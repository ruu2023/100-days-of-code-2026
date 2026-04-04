class CsvImportsController < ApplicationController
  FILTER_ROWS = 3

  before_action :set_csv_import, only: [:show, :run_import]

  def index
    @csv_import = CsvImport.new
    @csv_imports = CsvImport.order(created_at: :desc).limit(20)
  end

  def create
    uploaded_file = csv_import_params[:source_file]
    import_name = csv_import_params[:name].presence || uploaded_file&.original_filename.to_s.sub(/\.[^.]+\z/, "")

    @csv_import = CsvImport.new(
      name: import_name,
      source_filename: uploaded_file&.original_filename.to_s,
      target_table_name: "pending_#{SecureRandom.hex(4)}"
    )
    @csv_import.source_file.attach(uploaded_file) if uploaded_file.present?

    if @csv_import.save
      CsvImports::Analyzer.new(@csv_import).call
      redirect_to @csv_import, notice: "CSVを解析しました。内容を確認してから取込を実行してください。"
    else
      @csv_imports = CsvImport.order(created_at: :desc).limit(20)
      render :index, status: :unprocessable_entity
    end
  rescue StandardError => e
    @csv_import.errors.add(:base, e.message)
    @csv_imports = CsvImport.order(created_at: :desc).limit(20)
    render :index, status: :unprocessable_entity
  end

  def show
    @search_form = build_search_form(params[:search])
    @search_results = []
    @search_sql = nil

    return unless @csv_import.ready?
    return unless search_requested?

    searcher = CsvImports::Searcher.new(@csv_import, @search_form)
    @search_results = searcher.call
    @search_sql = searcher.sql
  end

  def run_import
    CsvImports::Importer.new(@csv_import).call
    redirect_to @csv_import, notice: "テーブルを作成してCSVを取り込みました。検索できます。"
  rescue StandardError => e
    redirect_to @csv_import, alert: "取込に失敗しました: #{e.message}"
  end

  private

  def set_csv_import
    @csv_import = CsvImport.find(params[:id])
  end

  def csv_import_params
    params.require(:csv_import).permit(:name, :source_file)
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

  def search_requested?
    params[:search].present?
  end
end
