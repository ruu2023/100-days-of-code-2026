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
            x: table.x || default_x_for(table),
            y: table.y || 0,
            z: table.z || default_z_for(table),
            val: 1.4 + (ordered_columns.size * 0.15)
          }
        end,
        links: relationships.map do |relationship|
          {
            id: relationship.id,
            source: relationship.target_table_id,
            target: relationship.source_table_id,
            name: relationship.name,
            label: relationship.label,
            direction_label: relationship.direction_label,
            semantic_label: relationship.semantic_label,
            cardinality: relationship.cardinality,
            source_column: relationship.source_column,
            target_column: relationship.target_column,
            source_table_name: relationship.source_table.name,
            target_table_name: relationship.target_table.name
          }
        end
      }
    end

    private

    def default_x_for(table)
      index = ordered_tables.index(table) || 0
      radius = [ordered_tables.size * 42, 120].max
      Math.cos((index.to_f / [ordered_tables.size, 1].max) * Math::PI * 2) * radius
    end

    def default_z_for(table)
      index = ordered_tables.index(table) || 0
      radius = [ordered_tables.size * 42, 120].max
      Math.sin((index.to_f / [ordered_tables.size, 1].max) * Math::PI * 2) * radius
    end

    def ordered_tables
      @ordered_tables ||= @diagram.erd_tables.order(:name).to_a
    end
  end
end
