class CsvImport < ApplicationRecord
  has_one_attached :source_file

  serialize :inferred_columns, coder: JSON
  serialize :sample_rows, coder: JSON

  enum :status, { uploaded: 0, importing: 1, ready: 2, failed: 3 }

  validates :name, presence: true
  validates :source_filename, presence: true
  validates :target_table_name, presence: true, uniqueness: true
  validates :col_sep, presence: true
  validates :row_count, numericality: { greater_than_or_equal_to: 0 }

  def column_names_for_search
    Array(inferred_columns).map { |column| column["name"] || column[:name] }
  end

  def sample_rows_for_preview
    Array(sample_rows)
  end

  def dynamic_record_class
    import = self

    Class.new(ActiveRecord::Base) do
      self.table_name = import.target_table_name
      self.inheritance_column = :_type_disabled
    end
  end

  def self.build_target_table_name(base_name, id)
    normalized = base_name.to_s.downcase.gsub(/[^a-z0-9]+/, "_").gsub(/\A_+|_+\z/, "")
    normalized = "dataset" if normalized.blank?

    "csv_import_#{id}_#{normalized}".first(62)
  end
end
