module Erd
  class GraphBuilder
    def initialize(diagram)
      @diagram = diagram
    end

    def as_json
      relationships = @diagram.erd_relationships.includes(:source_table, :target_table).to_a
      foreign_key_index = relationships.each_with_object(Hash.new { |hash, key| hash[key] = [] }) do |relationship, hash|
        hash[relationship.target_table_id] << relationship.target_column
      end

      {
        diagram: {
          id: @diagram.id,
          name: @diagram.name,
          description: @diagram.description
        },
        nodes: @diagram.erd_tables.includes(:erd_columns).order(:name).map do |table|
          table_layout = layout_by_table_id[table.id]
          ordered_columns = table.erd_columns.order(primary_key: :desc, name: :asc).map do |column|
            is_foreign_key = foreign_key_index[table.id].include?(column.name)

            {
              id: column.id,
              name: column.name,
              data_type: column.data_type,
              null_allowed: column.null_allowed,
              primary_key: column.primary_key,
              foreign_key: is_foreign_key,
              badge: column.primary_key? ? "PK" : (is_foreign_key ? "FK" : nil)
            }
          end

          {
            id: table.id,
            record_id: table.id,
            name: table.name,
            description: table.description,
            label: table.graph_label,
            columns: ordered_columns,
            primary_key_count: ordered_columns.count { |column| column[:primary_key] },
            foreign_key_count: ordered_columns.count { |column| column[:foreign_key] },
            x: table.x || table_layout[:x],
            y: table.y || 0,
            z: table.z || table_layout[:z],
            card_height: 82 + ordered_columns.size * 46 + 26,
            val: 1.4 + (ordered_columns.size * 0.15)
          }
        end,
        links: relationships.map do |relationship|
          source_table = relationship.source_table
          target_table = relationship.target_table

          {
            id: relationship.id,
            source: target_table.id,
            target: source_table.id,
            name: relationship.name,
            label: relationship.label,
            direction_label: relationship.direction_label,
            semantic_label: relationship.semantic_label,
            cardinality_badge: relationship.cardinality_badge,
            cardinality: relationship.cardinality,
            source_column: relationship.source_column,
            target_column: relationship.target_column,
            source_table_name: source_table.name,
            target_table_name: target_table.name,
            source_row_index: row_index_for(source_table, relationship.source_column),
            target_row_index: row_index_for(target_table, relationship.target_column),
            source_link_order: link_order_for(source_table.id, relationship.id, :source),
            target_link_order: link_order_for(target_table.id, relationship.id, :target)
          }
        end
      }
    end

    private

    def row_index_for(table, column_name)
      return 0 if column_name.blank?

      ordered_columns_for(table).find_index { |column| column.name == column_name } || 0
    end

    def link_order_for(table_id, relationship_id, side)
      links = relationship_orders_by_table_id.dig(table_id, side) || []
      links.index(relationship_id) || 0
    end

    def ordered_columns_for(table)
      @ordered_columns_for ||= {}
      @ordered_columns_for[table.id] ||= table.erd_columns.order(primary_key: :desc, name: :asc).to_a
    end

    def relationship_orders_by_table_id
      @relationship_orders_by_table_id ||= begin
        hash = Hash.new { |value, key| value[key] = { source: [], target: [] } }

        @diagram.erd_relationships.order(:id).each do |relationship|
          hash[relationship.source_table_id][:source] << relationship.id
          hash[relationship.target_table_id][:target] << relationship.id
        end

        hash
      end
    end

    def layout_by_table_id
      @layout_by_table_id ||= begin
        levels = compute_levels
        groups = ordered_tables.group_by { |table| levels[table.id] || 0 }
        max_level = groups.keys.max || 0

        groups.each_with_object({}) do |(level, tables), hash|
          x = (level - max_level / 2.0) * 260
          start_z = -((tables.size - 1) * 170) / 2.0

          tables.each_with_index do |table, index|
            hash[table.id] = { x: x, z: start_z + index * 170 }
          end
        end
      end
    end

    def compute_levels
      levels = Hash.new(0)

      ordered_tables.size.times do
        changed = false

        @diagram.erd_relationships.each do |relationship|
          next_level = levels[relationship.source_table_id] + 1
          if next_level > levels[relationship.target_table_id]
            levels[relationship.target_table_id] = next_level
            changed = true
          end
        end

        break unless changed
      end

      levels
    end

    def ordered_tables
      @ordered_tables ||= @diagram.erd_tables.order(:name).to_a
    end
  end
end
