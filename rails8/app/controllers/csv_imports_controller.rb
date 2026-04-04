class CsvImportsController < ApplicationController
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
    @search_query = params[:q].to_s
    @search_results = @csv_import.ready? ? CsvImports::Searcher.new(@csv_import, @search_query).call : []
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
end
