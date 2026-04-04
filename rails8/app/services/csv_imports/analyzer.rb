module CsvImports
  class Analyzer
    SAMPLE_LIMIT = 20
    SEPARATORS = [",", "\t", ";", "|"].freeze

    def initialize(csv_import)
      @csv_import = csv_import
    end

    def call
      raise ArgumentError, "CSVファイルを選択してください" unless @csv_import.source_file.attached?

      @csv_import.source_file.open do |file|
        csv_text = CsvImports::EncodedFileReader.new(file).read
        sample_text = csv_text.first(16.kilobytes)

        col_sep = detect_separator(sample_text)
        preview_rows = read_preview_rows(csv_text, col_sep)
        raise ArgumentError, "CSVファイルが空です" if preview_rows.empty?

        header_row = detect_header_row(preview_rows)

        analysis = analyze_rows(csv_text, col_sep, header_row)
        table_name = CsvImport.build_target_table_name(@csv_import.name.presence || @csv_import.source_filename, @csv_import.id)

        @csv_import.update!(
          col_sep: col_sep,
          header_row: header_row,
          row_count: analysis[:row_count],
          inferred_columns: analysis[:columns],
          sample_rows: analysis[:sample_rows],
          target_table_name: table_name,
          error_message: nil,
          status: :uploaded
        )
      end
    end

    private

    def detect_separator(sample_text)
      first_lines = sample_text.lines.first(5).join

      SEPARATORS.max_by do |separator|
        first_lines.lines.sum { |line| line.count(separator) }
      end
    end

    def read_preview_rows(csv_text, col_sep)
      rows = []
      csv = CSV.new(csv_text, col_sep: col_sep, skip_blanks: true)

      SAMPLE_LIMIT.times do
        row = csv.shift
        break unless row

        rows << row.map { |value| value.to_s.strip }
      end

      rows
    end

    def detect_header_row(rows)
      first_row = rows.first
      return true if rows.length == 1

      second_row = rows.second || []
      first_data_like_count = first_row.count { |value| data_like?(value) }
      second_data_like_count = second_row.count { |value| data_like?(value) }
      unique_cells = first_row.reject(&:blank?).uniq.length == first_row.reject(&:blank?).length
      identifier_like = first_row.count { |value| identifier_like?(value) }

      return true if unique_cells && identifier_like >= (first_row.length / 2.0).ceil && first_data_like_count < second_data_like_count

      first_data_like_count < (first_row.length / 2.0)
    end

    def analyze_rows(csv_text, col_sep, header_row)
      parser = CSV.new(csv_text, headers: header_row, col_sep: col_sep, skip_blanks: true)
      first_entry = parser.shift
      return empty_analysis if first_entry.nil?

      headers, first_values =
        if header_row
          [first_entry.headers, first_entry.fields]
        else
          [generated_headers(first_entry.length), first_entry]
        end

      normalized_headers = normalize_headers(headers)
      trackers = normalized_headers.map { |header| initial_tracker(header) }
      row_count = 0
      sample_rows = []

      process_values(first_values, trackers, normalized_headers, sample_rows)
      row_count += 1

      parser.each do |entry|
        values = header_row ? entry.fields : entry
        process_values(values, trackers, normalized_headers, sample_rows)
        row_count += 1
      end

      {
        row_count: row_count,
        columns: finalize_trackers(trackers),
        sample_rows: sample_rows
      }
    end

    def empty_analysis
      {
        row_count: 0,
        columns: [],
        sample_rows: []
      }
    end

    def process_values(values, trackers, normalized_headers, sample_rows)
      row_hash = {}

      normalized_headers.each_with_index do |column_name, index|
        value = values[index].to_s.strip
        row_hash[column_name] = value
        update_tracker(trackers[index], value)
      end

      sample_rows << row_hash if sample_rows.length < SAMPLE_LIMIT
    end

    def generated_headers(length)
      Array.new(length) { |index| "column_#{index + 1}" }
    end

    def normalize_headers(headers)
      counts = Hash.new(0)

      headers.map.with_index do |header, index|
        base = header.to_s.downcase.gsub(/[^a-z0-9]+/, "_").gsub(/\A_+|_+\z/, "")
        base = "column_#{index + 1}" if base.blank?
        counts[base] += 1
        counts[base] == 1 ? base : "#{base}_#{counts[base]}"
      end
    end

    def initial_tracker(name)
      {
        "name" => name,
        "type_candidates" => {
          "integer" => true,
          "decimal" => true,
          "boolean" => true,
          "date" => true,
          "datetime" => true
        },
        "nullable" => false,
        "max_length" => 0
      }
    end

    def update_tracker(tracker, value)
      if value.blank?
        tracker["nullable"] = true
        return
      end

      tracker["max_length"] = [tracker["max_length"], value.length].max
      tracker["type_candidates"]["integer"] &&= integer_like?(value)
      tracker["type_candidates"]["decimal"] &&= decimal_like?(value)
      tracker["type_candidates"]["boolean"] &&= boolean_like?(value)
      tracker["type_candidates"]["date"] &&= date_like?(value)
      tracker["type_candidates"]["datetime"] &&= datetime_like?(value)
    end

    def finalize_trackers(trackers)
      trackers.map do |tracker|
        {
          "name" => tracker["name"],
          "type" => inferred_type_for(tracker),
          "nullable" => tracker["nullable"]
        }
      end
    end

    def inferred_type_for(tracker)
      candidates = tracker["type_candidates"]

      return "boolean" if candidates["boolean"]
      return "integer" if candidates["integer"]
      return "decimal" if candidates["decimal"]
      return "datetime" if candidates["datetime"]
      return "date" if candidates["date"]
      return "text" if tracker["max_length"] > 255

      "string"
    end

    def identifier_like?(value)
      normalized = value.to_s.strip
      normalized.match?(/\A[\p{L}\p{N}_\-\s]+\z/u) && !data_like?(normalized)
    end

    def data_like?(value)
      integer_like?(value) || decimal_like?(value) || boolean_like?(value) || date_like?(value) || datetime_like?(value)
    end

    def integer_like?(value)
      value.match?(/\A[+-]?\d+\z/)
    end

    def decimal_like?(value)
      value.match?(/\A[+-]?\d+(?:\.\d+)?\z/)
    end

    def boolean_like?(value)
      %w[true false yes no y n 1 0].include?(value.to_s.strip.downcase)
    end

    def date_like?(value)
      Date.parse(value)
      !value.to_s.include?(":")
    rescue ArgumentError
      false
    end

    def datetime_like?(value)
      Time.zone.parse(value).present? && value.to_s.include?(":")
    rescue ArgumentError, TypeError
      false
    end
  end
end
