class StatementCsvImportsController < ApplicationController
  before_action :set_statement_csv_import, only: [:show, :run_import]

  def index
    @statement_csv_import = StatementCsvImport.new
    @statement_csv_imports = StatementCsvImport.order(created_at: :desc).limit(20)
  end

  def create
    uploaded_files = Array(statement_csv_import_params[:source_files]).compact_blank
    import_name = statement_csv_import_params[:name].presence || default_name_for(uploaded_files)

    @statement_csv_import = StatementCsvImport.new(name: import_name)

    if uploaded_files.blank?
      @statement_csv_import.errors.add(:base, "CSVファイルを選択してください")
      @statement_csv_imports = StatementCsvImport.order(created_at: :desc).limit(20)
      return render :index, status: :unprocessable_entity
    end

    @statement_csv_import.save!

    uploaded_files.each do |uploaded_file|
      file_record = @statement_csv_import.statement_csv_import_files.create!(
        source_filename: uploaded_file.original_filename.to_s
      )
      file_record.source_file.attach(uploaded_file)
    end

    StatementCsvImports::Analyzer.new(@statement_csv_import).call
    redirect_to @statement_csv_import, notice: "CSVを解析しました。ヘッダーごとのグループを確認してから取込を実行してください。"
  rescue StandardError => e
    @statement_csv_import ||= StatementCsvImport.new(name: import_name)
    @statement_csv_import.errors.add(:base, e.message)
    @statement_csv_imports = StatementCsvImport.order(created_at: :desc).limit(20)
    render :index, status: :unprocessable_entity
  end

  def show
    @datasets = @statement_csv_import.statement_csv_import_datasets.includes(:statement_csv_import_files).order(:created_at)
  end

  def run_import
    StatementCsvImports::Importer.new(@statement_csv_import).call
    redirect_to @statement_csv_import, notice: "明細テーブルを作成または追記し、CSVを取り込みました。"
  rescue StandardError => e
    redirect_to @statement_csv_import, alert: "取込に失敗しました: #{e.message}"
  end

  private

  def set_statement_csv_import
    @statement_csv_import = StatementCsvImport.find(params[:id])
  end

  def statement_csv_import_params
    params.require(:statement_csv_import).permit(:name, source_files: [])
  end

  def default_name_for(uploaded_files)
    first_name = uploaded_files.first&.original_filename.to_s.sub(/\.[^.]+\z/, "")
    first_name.presence || "statement_import_#{Time.current.strftime("%Y%m%d_%H%M")}"
  end
end
