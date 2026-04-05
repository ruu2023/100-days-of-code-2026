class StatementCsvImport < ApplicationRecord
  has_many :statement_csv_import_files, dependent: :destroy
  has_many :statement_csv_import_datasets, dependent: :destroy

  enum :status, { uploaded: 0, importing: 1, ready: 2, failed: 3 }

  validates :name, presence: true
end
