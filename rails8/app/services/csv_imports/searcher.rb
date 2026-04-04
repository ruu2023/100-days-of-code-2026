module CsvImports
  class Searcher
    DEFAULT_LIMIT = 100
    MAX_LIMIT = 500
    FILTER_LIMIT = 5
    OPERATORS = {
      "eq" => "=",
      "not_eq" => "!=",
      "contains" => "LIKE",
      "gt" => ">",
      "gte" => ">=",
      "lt" => "<",
      "lte" => "<=",
      "is_null" => "IS NULL",
      "is_not_null" => "IS NOT NULL"
    }.freeze
    DIRECTIONS = %w[asc desc].freeze

    attr_reader :sql

    def initialize(csv_import, params = {})
      @csv_import = csv_import
      @params = params || {}
      @connection = ActiveRecord::Base.connection
      @sql = nil
    end

    def call
      return [] unless @connection.data_source_exists?(@csv_import.target_table_name)

      return [] if searchable_columns.empty?

      quoted_table = @connection.quote_table_name(@csv_import.target_table_name)
      where_clause = build_where_clause
      order_clause = build_order_clause
      limit = normalized_limit

      @sql = <<~SQL.squish
        SELECT *
        FROM #{quoted_table}
        #{where_clause.present? ? "WHERE #{where_clause}" : nil}
        ORDER BY #{order_clause}
        LIMIT #{limit}
      SQL

      @connection.exec_query(@sql).to_a
    end

    private

    def searchable_columns
      @searchable_columns ||= @csv_import.column_names_for_search
    end

    def build_where_clause
      clauses = []

      if normalized_keyword.present?
        quoted_query = @connection.quote("%#{normalized_keyword}%")
        keyword_clause = searchable_columns.map do |column|
          "CAST(#{quoted_column(column)} AS TEXT) LIKE #{quoted_query}"
        end.join(" OR ")
        clauses << "(#{keyword_clause})"
      end

      normalized_filters.each do |filter|
        clause = filter_clause(filter)
        clauses << clause if clause.present?
      end

      clauses.join(" AND ")
    end

    def filter_clause(filter)
      column = filter[:column]
      operator = filter[:operator]
      value = filter[:value]
      sql_operator = OPERATORS[operator]
      return nil unless searchable_columns.include?(column) && sql_operator.present?

      column_sql = quoted_column(column)

      case operator
      when "contains"
        "CAST(#{column_sql} AS TEXT) LIKE #{@connection.quote("%#{value}%")}"
      when "is_null", "is_not_null"
        "#{column_sql} #{sql_operator}"
      else
        return nil if value.blank?

        "#{column_sql} #{sql_operator} #{@connection.quote(value)}"
      end
    end

    def build_order_clause
      column = normalized_order_column
      direction = normalized_direction

      "#{quoted_column(column)} #{direction.upcase}"
    end

    def quoted_column(column)
      @connection.quote_column_name(column)
    end

    def normalized_keyword
      @normalized_keyword ||= param_value(:keyword).to_s.strip
    end

    def normalized_filters
      raw_filters = param_value(:filters)
      filters =
        case raw_filters
        when Hash
          raw_filters.sort_by { |key, _value| key.to_i }.map(&:last)
        when Array
          raw_filters
        else
          []
        end

      filters.first(FILTER_LIMIT).filter_map do |filter|
        next unless filter.respond_to?(:[])

        column = filter_value(filter, :column).to_s
        operator = filter_value(filter, :operator).to_s
        value = filter_value(filter, :value).to_s.strip
        next if column.blank? || operator.blank?
        next if value.blank? && !%w[is_null is_not_null].include?(operator)

        { column: column, operator: operator, value: value }
      end
    end

    def normalized_order_column
      column = param_value(:order_by).to_s
      searchable_columns.include?(column) ? column : "id"
    end

    def normalized_direction
      direction = param_value(:direction).to_s.downcase
      DIRECTIONS.include?(direction) ? direction : "desc"
    end

    def normalized_limit
      limit = param_value(:limit).to_i
      return DEFAULT_LIMIT if limit <= 0

      [limit, MAX_LIMIT].min
    end

    def param_value(key)
      @params[key] || @params[key.to_s]
    end

    def filter_value(filter, key)
      filter[key] || filter[key.to_s]
    end
  end
end
