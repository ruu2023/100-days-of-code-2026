class StatementCsvImportDataset < ApplicationRecord
  NEW_TABLE = "new_table"
  APPEND_TABLE = "append".freeze

  belongs_to :statement_csv_import
  has_many :statement_csv_import_files, dependent: :nullify

  serialize :normalized_headers, coder: JSON
  serialize :inferred_columns, coder: JSON
  serialize :sample_rows, coder: JSON
  serialize :source_filenames, coder: JSON

  enum :status, { uploaded: 0, importing: 1, ready: 2, failed: 3 }

  validates :name, presence: true
  validates :header_signature, presence: true
  validates :target_table_name, presence: true
  validates :target_mode, inclusion: { in: [NEW_TABLE, APPEND_TABLE] }
  validates :row_count, numericality: { greater_than_or_equal_to: 0 }

  def column_names_for_search
    Array(inferred_columns).map { |column| column["name"] || column[:name] }
  end

  def columns_with_labels
    Array(inferred_columns).map do |column|
      normalized = column.stringify_keys
      normalized["display_name"] = normalized["display_name"].presence || normalized["original_header"].presence || normalized["name"]
      normalized["original_header"] = normalized["original_header"].presence || normalized["name"]
      normalized
    end
  end

  def display_name_for(column_name)
    column_with_label(column_name).fetch("display_name", column_name)
  end

  def original_header_for(column_name)
    column_with_label(column_name).fetch("original_header", column_name)
  end

  def search_column_options
    columns_with_labels.map do |column|
      ["#{column['display_name']} (#{column['name']})", column["name"]]
    end
  end

  def sample_rows_for_preview
    Array(sample_rows)
  end

  def dynamic_record_class
    dataset = self

    Class.new(ActiveRecord::Base) do
      self.table_name = dataset.target_table_name
      self.inheritance_column = :_type_disabled
    end
  end

  def append_target?
    target_mode == APPEND_TABLE
  end

  def assign_display_names!(display_names)
    updated_columns = columns_with_labels.map do |column|
      new_name = display_names[column["name"]].to_s.strip
      column.merge("display_name" => new_name.presence || column["display_name"])
    end

    update!(inferred_columns: updated_columns)
  end

  def self.build_target_table_name(base_name, id)
    normalized = base_name.to_s.downcase.gsub(/[^a-z0-9]+/, "_").gsub(/\A_+|_+\z/, "")
    normalized = "dataset" if normalized.blank?

    "statement_csv_import_#{id}_#{normalized}".first(62)
  end

  private

  def column_with_label(column_name)
    columns_with_labels.find { |column| column["name"] == column_name.to_s } || { "display_name" => column_name.to_s, "original_header" => column_name.to_s }
  end
end
