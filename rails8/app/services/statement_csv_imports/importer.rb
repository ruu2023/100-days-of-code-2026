module StatementCsvImports
  class Importer
    BATCH_SIZE = CsvImports::Importer::BATCH_SIZE

    def initialize(statement_csv_import)
      @statement_csv_import = statement_csv_import
      @connection = ActiveRecord::Base.connection
      @created_tables = []
    end

    def call
      raise ArgumentError, "取り込み対象のデータセットがありません" if @statement_csv_import.statement_csv_import_datasets.empty?

      @statement_csv_import.update!(status: :importing, error_message: nil)

      @statement_csv_import.statement_csv_import_datasets.includes(:statement_csv_import_files).find_each do |dataset|
        import_dataset!(dataset)
      end

      @statement_csv_import.update!(status: :ready, imported_at: Time.current, error_message: nil)
    rescue StandardError => e
      @statement_csv_import.update!(status: :failed, error_message: e.message)
      cleanup_created_tables!
      raise
    end

    private

    def import_dataset!(dataset)
      raise ArgumentError, "#{dataset.name}: 推定カラムがありません" if dataset.inferred_columns.blank?

      dataset.update!(status: :importing, error_message: nil)
      create_table_if_needed!(dataset)
      import_rows!(dataset)
      dataset.update!(status: :ready, imported_at: Time.current, error_message: nil)
      dataset.statement_csv_import_files.update_all(status: StatementCsvImportFile.statuses[:imported], updated_at: Time.current)
    rescue StandardError => e
      dataset.update!(status: :failed, error_message: e.message)
      raise
    end

    def create_table_if_needed!(dataset)
      return if @connection.data_source_exists?(dataset.target_table_name)

      columns = Array(dataset.inferred_columns)

      @connection.create_table(dataset.target_table_name) do |t|
        columns.each do |column|
          add_column_definition(t, column)
        end

        t.timestamps
      end

      @created_tables << dataset.target_table_name
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

    def import_rows!(dataset)
      record_class = dataset.dynamic_record_class
      columns = Array(dataset.inferred_columns)
      batch = []

      dataset.statement_csv_import_files.order(:id).each do |file_record|
        raise ArgumentError, "#{file_record.source_filename}: CSVファイルがありません" unless file_record.source_file.attached?

        file_record.source_file.open do |file|
          csv_text = CsvImports::EncodedFileReader.new(file).read
          parser = CSV.new(csv_text, headers: file_record.header_row, col_sep: file_record.col_sep, skip_blanks: true)

          parser.each do |entry|
            values = file_record.header_row ? entry.fields : entry
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

    def cleanup_created_tables!
      @created_tables.each do |table_name|
        next unless @connection.data_source_exists?(table_name)

        @connection.drop_table(table_name)
      end
    end
  end
end
