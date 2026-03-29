class CsvTablesController < ApplicationController
  def index
    @csv_text = params[:csv_text] || ""
    @parsed_rows = parse_csv(@csv_text) if @csv_text.present?
  end

  private

  def parse_csv(text)
    rows = CSV.parse(text.gsub(/\r\n?/, "\n"), headers: true, skip_blanks: true)
    {
      headers: rows.headers,
      rows: rows.map(&:fields)
    }
  rescue CSV::MalformedCSVError, ArgumentError
    nil
  end
end
