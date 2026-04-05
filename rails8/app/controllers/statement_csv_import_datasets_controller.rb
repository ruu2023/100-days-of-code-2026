class StatementCsvImportDatasetsController < ApplicationController
  FILTER_ROWS = 3

  before_action :set_statement_csv_import_dataset

  def show
    @search_form = build_search_form(params[:search])
    @search_results = []
    @search_sql = nil

    return unless @statement_csv_import_dataset.ready?
    return unless params[:search].present?

    searcher = StatementCsvImports::Searcher.new(@statement_csv_import_dataset, @search_form)
    @search_results = searcher.call
    @search_sql = searcher.sql
  end

  private

  def set_statement_csv_import_dataset
    @statement_csv_import_dataset = StatementCsvImportDataset.find(params[:id])
  end

  def build_search_form(raw_params)
    raw =
      if raw_params.respond_to?(:to_unsafe_h)
        raw_params.to_unsafe_h
      elsif raw_params.respond_to?(:to_h)
        raw_params.to_h
      else
        {}
      end

    raw ||= {}

    raw_filters = raw["filters"] || raw[:filters]
    normalized_raw_filters =
      case raw_filters
      when Hash
        raw_filters.sort_by { |key, _value| key.to_i }.map(&:last)
      when Array
        raw_filters
      else
        []
      end

    filters = normalized_raw_filters.first(FILTER_ROWS).map do |filter|
      next {} unless filter.respond_to?(:[])

      {
        "column" => filter["column"].to_s.presence || filter[:column].to_s,
        "operator" => filter["operator"].to_s.presence || filter[:operator].to_s,
        "value" => filter["value"].to_s.presence || filter[:value].to_s
      }
    end

    while filters.length < FILTER_ROWS
      filters << {}
    end

    {
      "keyword" => raw["keyword"].to_s.presence || raw[:keyword].to_s,
      "filters" => filters,
      "order_by" => raw["order_by"].to_s.presence || raw[:order_by].to_s,
      "direction" => raw["direction"].to_s.presence || raw[:direction].to_s || "desc",
      "limit" => raw["limit"].to_s.presence || raw[:limit].to_s || CsvImports::Searcher::DEFAULT_LIMIT.to_s
    }
  end
end
