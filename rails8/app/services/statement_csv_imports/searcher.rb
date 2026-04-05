module StatementCsvImports
  class Searcher < CsvImports::Searcher
    def initialize(statement_csv_import_dataset, params = {})
      @csv_import = statement_csv_import_dataset
      @params = params || {}
      @connection = ActiveRecord::Base.connection
      @sql = nil
    end
  end
end
