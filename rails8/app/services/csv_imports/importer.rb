module CsvImports
  class Importer
    BATCH_SIZE = 500

    def initialize(csv_import)
      @csv_import = csv_import
      @connection = ActiveRecord::Base.connection
    end

    def call
      raise ArgumentError, "推定カラムがありません" if @csv_import.inferred_columns.blank?
      raise ArgumentError, "CSVファイルがありません" unless @csv_import.source_file.attached?

      @csv_import.update!(status: :importing, error_message: nil)

      create_table!
      import_rows!

      @csv_import.update!(status: :ready, imported_at: Time.current, error_message: nil)
    rescue StandardError => e
      @csv_import.update!(status: :failed, error_message: e.message)
      cleanup_table!
      raise
    end

    private

    def create_table!
      raise ArgumentError, "同名テーブルが既に存在します" if @connection.data_source_exists?(@csv_import.target_table_name)

      columns = Array(@csv_import.inferred_columns)

      @connection.create_table(@csv_import.target_table_name) do |t|
        columns.each do |column|
          add_column_definition(t, column)
        end

        t.timestamps
      end
    end

    def add_column_definition(table, column)
      name = column["name"]
      nullable = column["nullable"]

      case column["type"]
      when "integer"
        table.integer name, null: nullable
      when "decimal"
        table.decimal name, precision: 18, scale: 6, null: nullable
      when "boolean"
        table.boolean name, null: nullable
      when "date"
        table.date name, null: nullable
      when "datetime"
        table.datetime name, null: nullable
      when "text"
        table.text name, null: nullable
      else
        table.string name, null: nullable
      end
    end

    def import_rows!
      record_class = @csv_import.dynamic_record_class
      columns = Array(@csv_import.inferred_columns)
      batch = []

      @csv_import.source_file.open do |file|
        csv_text = CsvImports::EncodedFileReader.new(file).read
        parser = CSV.new(csv_text, headers: @csv_import.header_row, col_sep: @csv_import.col_sep, skip_blanks: true)

        parser.each do |entry|
          values = @csv_import.header_row ? entry.fields : entry
          row = {}

          columns.each_with_index do |column, index|
            row[column["name"]] = cast_value(values[index], column["type"])
          end

          timestamp = Time.current
          row["created_at"] = timestamp
          row["updated_at"] = timestamp
          batch << row

          flush_batch!(record_class, batch) if batch.length >= BATCH_SIZE
        end
      end

      flush_batch!(record_class, batch)
    end

    def flush_batch!(record_class, batch)
      return if batch.empty?

      record_class.insert_all!(batch)
      batch.clear
    end

    def cast_value(value, type)
      stripped = value.to_s.strip
      return nil if stripped.blank?

      case type
      when "integer"
        stripped.to_i
      when "decimal"
        BigDecimal(stripped)
      when "boolean"
        %w[true yes y 1].include?(stripped.downcase)
      when "date"
        Date.parse(stripped)
      when "datetime"
        Time.zone.parse(stripped)
      else
        stripped
      end
    end

    def cleanup_table!
      return unless @connection.data_source_exists?(@csv_import.target_table_name)
      return if @csv_import.ready?

      @connection.drop_table(@csv_import.target_table_name)
    end
  end
end
