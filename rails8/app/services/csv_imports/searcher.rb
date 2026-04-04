module CsvImports
  class Searcher
    DEFAULT_LIMIT = 100

    def initialize(csv_import, query)
      @csv_import = csv_import
      @query = query.to_s.strip
      @connection = ActiveRecord::Base.connection
    end

    def call
      return [] if @query.blank?
      return [] unless @connection.data_source_exists?(@csv_import.target_table_name)

      columns = @csv_import.column_names_for_search
      return [] if columns.empty?

      quoted_table = @connection.quote_table_name(@csv_import.target_table_name)
      quoted_query = @connection.quote("%#{@query}%")
      where_clause = columns.map do |column|
        "CAST(#{@connection.quote_column_name(column)} AS TEXT) LIKE #{quoted_query}"
      end.join(" OR ")

      sql = <<~SQL.squish
        SELECT *
        FROM #{quoted_table}
        WHERE #{where_clause}
        ORDER BY id DESC
        LIMIT #{DEFAULT_LIMIT}
      SQL

      @connection.exec_query(sql).to_a
    end
  end
end
