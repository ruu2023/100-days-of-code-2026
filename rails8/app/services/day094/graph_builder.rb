module Day094
  class GraphBuilder
    def initialize(diagram)
      @diagram = diagram
    end

    def as_json
      {
        diagram: {
          id: @diagram.id,
          name: @diagram.name,
          description: @diagram.description
        },
        nodes: @diagram.erd_tables.includes(:erd_columns).order(:name).map do |table|
          {
            id: table.id,
            record_id: table.id,
            name: table.name,
            description: table.description,
            label: table.graph_label,
            columns: table.erd_columns.order(primary_key: :desc, name: :asc).map do |column|
              {
                id: column.id,
                name: column.name,
                data_type: column.data_type,
                null_allowed: column.null_allowed,
                primary_key: column.primary_key
              }
            end,
            x: table.x,
            y: table.y,
            z: table.z,
            val: 1.4 + (table.erd_columns.size * 0.15)
          }
        end,
        links: @diagram.erd_relationships.includes(:source_table, :target_table).map do |relationship|
          {
            id: relationship.id,
            source: relationship.source_table_id,
            target: relationship.target_table_id,
            name: relationship.name,
            label: relationship.label,
            cardinality: relationship.cardinality,
            source_column: relationship.source_column,
            target_column: relationship.target_column
          }
        end
      }
    end
  end
end
