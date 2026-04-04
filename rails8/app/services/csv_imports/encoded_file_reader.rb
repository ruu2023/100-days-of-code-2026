module CsvImports
  class EncodedFileReader
    ENCODINGS = [
      "utf-8",
      "cp932",
      "shift_jis",
      "windows-31j"
    ].freeze

    def initialize(file)
      @file = file
    end

    def read
      raw = @file.read
      raise ArgumentError, "CSVファイルが空です" if raw.blank?

      normalized = normalize_encoding(raw)
      normalized.gsub(/\r\n?/, "\n")
    end

    private

    def normalize_encoding(raw)
      utf8_with_bom = raw.dup.force_encoding(Encoding::UTF_8)
      return strip_utf8_bom(utf8_with_bom) if utf8_with_bom.valid_encoding?

      ENCODINGS.each do |encoding|
        converted = raw.dup.force_encoding(encoding).encode(Encoding::UTF_8)
        return strip_utf8_bom(converted) if converted.valid_encoding?
      rescue Encoding::ConverterNotFoundError, Encoding::UndefinedConversionError, Encoding::InvalidByteSequenceError
        next
      end

      strip_utf8_bom(raw.force_encoding(Encoding::UTF_8).scrub)
    end

    def strip_utf8_bom(text)
      text.delete_prefix("\uFEFF")
    end
  end
end
