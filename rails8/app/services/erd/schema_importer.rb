module Erd
  class SchemaImporter
    Result = Struct.new(:diagram, :table_count, :relationship_count, keyword_init: true)

    CreateTable = Struct.new(:name, :options, :columns, keyword_init: true)
    ColumnDef = Struct.new(:name, :data_type, :null_allowed, :default_value, :primary_key, keyword_init: true)
    ForeignKeyDef = Struct.new(:from_table, :to_table, :column, :primary_key, keyword_init: true)

    class ImportError < StandardError; end

    def initialize(uploaded_schema:, diagram_name: nil)
      @uploaded_schema = uploaded_schema
      @diagram_name = diagram_name.to_s.strip
    end

    def import!
      validate_uploaded_schema!

      schema = parse_schema(schema_content)
      raise ImportError, "create_table が見つかりませんでした" if schema[:tables].empty?

      diagram = nil

      ActiveRecord::Base.transaction do
        diagram = ErdDiagram.create!(
          name: @diagram_name.presence || default_diagram_name,
          description: "Imported from #{source_name}"
        )

        table_map = build_tables!(diagram, schema[:tables])
        build_relationships!(diagram, table_map, schema[:foreign_keys])
      end

      Result.new(
        diagram: diagram,
        table_count: diagram.erd_tables.count,
        relationship_count: diagram.erd_relationships.count
      )
    end

    private

    def validate_uploaded_schema!
      raise ImportError, "schema.rb ファイルを選択してください" if @uploaded_schema.blank?
      raise ImportError, "schema.rb を選択してください" unless source_name == "schema.rb"
    end

    def default_diagram_name
      "imported schema"
    end

    def source_name
      @source_name ||= if @uploaded_schema.respond_to?(:original_filename)
                         @uploaded_schema.original_filename.to_s
                       else
                         File.basename(@uploaded_schema.to_s)
                       end
    end

    def schema_content
      @schema_content ||= if @uploaded_schema.respond_to?(:read)
                            @uploaded_schema.rewind if @uploaded_schema.respond_to?(:rewind)
                            @uploaded_schema.read
                          else
                            Pathname.new(@uploaded_schema.to_s).expand_path.read
                          end
    end

    def parse_schema(content)
      tables = []
      foreign_keys = []
      current_table = nil

      content.each_line do |raw_line|
        line = raw_line.strip
        next if line.empty?

        if current_table
          if line == "end"
            tables << current_table
            current_table = nil
            next
          end

          column = parse_column_line(line)
          current_table.columns << column if column
          next
        end

        create_table = parse_create_table_line(line)
        if create_table
          current_table = create_table
          next
        end

        foreign_key = parse_foreign_key_line(line)
        foreign_keys << foreign_key if foreign_key
      end

      { tables: tables, foreign_keys: foreign_keys }
    end

    def parse_create_table_line(line)
      match = line.match(/\Acreate_table\s+"(?<name>[^"]+)"(?<options>.*)\sdo\s+\|t\|\z/)
      return unless match

      CreateTable.new(name: match[:name], options: match[:options], columns: [])
    end

    def parse_column_line(line)
      return parse_reference_line(line) if line.start_with?("t.references ", "t.belongs_to ")

      match = line.match(/\At\.(?<type>[a-z_]+)\s+"(?<name>[^"]+)"(?<options>.*)\z/)
      return unless match

      options = extract_options(match[:options])
      ColumnDef.new(
        name: match[:name],
        data_type: match[:type],
        null_allowed: options.fetch("null", true),
        default_value: options["default"],
        primary_key: false
      )
    end

    def parse_reference_line(line)
      match = line.match(/\At\.(?:references|belongs_to)\s+"(?<name>[^"]+)"(?<options>.*)\z/)
      return unless match

      options = extract_options(match[:options])
      ColumnDef.new(
        name: "#{match[:name]}_id",
        data_type: "bigint",
        null_allowed: options.fetch("null", true),
        default_value: options["default"],
        primary_key: false
      )
    end

    def parse_foreign_key_line(line)
      match = line.match(/\Aadd_foreign_key\s+"(?<from>[^"]+)",\s+"(?<to>[^"]+)"(?<options>.*)\z/)
      return unless match

      options = extract_options(match[:options])
      ForeignKeyDef.new(
        from_table: match[:from],
        to_table: match[:to],
        column: options["column"] || "#{match[:to].singularize}_id",
        primary_key: options["primary_key"] || "id"
      )
    end

    def extract_options(text)
      {
        "null" => extract_boolean(text, "null"),
        "default" => extract_string(text, "default"),
        "column" => extract_string(text, "column"),
        "primary_key" => extract_string(text, "primary_key")
      }.compact
    end

    def extract_boolean(text, key)
      match = text.match(/#{Regexp.escape(key)}:\s*(true|false)/)
      return if match.nil?

      match[1] == "true"
    end

    def extract_string(text, key)
      quoted = text.match(/#{Regexp.escape(key)}:\s*"([^"]+)"/)
      return quoted[1] if quoted

      symbol = text.match(/#{Regexp.escape(key)}:\s*:([a-zA-Z_]+)/)
      return symbol[1] if symbol

      number = text.match(/#{Regexp.escape(key)}:\s*([0-9]+)/)
      return number[1] if number
    end

    def build_tables!(diagram, definitions)
      definitions.each_with_object({}) do |table_def, map|
        table = diagram.erd_tables.create!(
          name: table_def.name,
          description: "Imported from #{source_name}"
        )

        add_primary_key_column!(table, table_def) unless idless_table?(table_def)

        table_def.columns.each do |column_def|
          table.erd_columns.create!(
            name: column_def.name,
            data_type: column_def.data_type,
            null_allowed: column_def.null_allowed,
            default_value: column_def.default_value,
            primary_key: column_def.primary_key
          )
        end

        map[table.name] = table
      end
    end

    def add_primary_key_column!(table, table_def)
      primary_key_name = table_def.options[/primary_key:\s*"([^"]+)"/, 1] || "id"

      table.erd_columns.create!(
        name: primary_key_name,
        data_type: "bigint",
        null_allowed: false,
        primary_key: true
      )
    end

    def idless_table?(table_def)
      table_def.options.match?(/id:\s*false/)
    end

    def build_relationships!(diagram, table_map, foreign_keys)
      foreign_keys.each do |foreign_key|
        source_table = table_map[foreign_key.to_table]
        target_table = table_map[foreign_key.from_table]
        next if source_table.nil? || target_table.nil?

        diagram.erd_relationships.create!(
          source_table: source_table,
          target_table: target_table,
          source_column: foreign_key.primary_key,
          target_column: foreign_key.column,
          cardinality: :one_to_many,
          name: "#{foreign_key.to_table}_to_#{foreign_key.from_table}"
        )
      end
    end
  end
end
