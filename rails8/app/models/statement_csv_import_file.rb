class StatementCsvImportFile < ApplicationRecord
  belongs_to :statement_csv_import
  belongs_to :statement_csv_import_dataset, optional: true

  has_one_attached :source_file

  serialize :normalized_headers, coder: JSON
  serialize :inferred_columns, coder: JSON
  serialize :sample_rows, coder: JSON

  enum :status, { uploaded: 0, analyzed: 1, imported: 2, failed: 3 }

  validates :source_filename, presence: true
  validates :col_sep, presence: true
  validates :row_count, numericality: { greater_than_or_equal_to: 0 }
end
