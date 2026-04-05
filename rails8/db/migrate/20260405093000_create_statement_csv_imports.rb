class CreateStatementCsvImports < ActiveRecord::Migration[8.1]
  def change
    create_table :statement_csv_imports do |t|
      t.string :name, null: false
      t.integer :status, null: false, default: 0
      t.text :error_message
      t.datetime :imported_at

      t.timestamps
    end

    add_index :statement_csv_imports, :status

    create_table :statement_csv_import_datasets do |t|
      t.references :statement_csv_import, null: false, foreign_key: true
      t.string :name, null: false
      t.string :header_signature, null: false
      t.text :normalized_headers
      t.text :inferred_columns
      t.text :sample_rows
      t.text :source_filenames
      t.string :target_table_name, null: false
      t.string :target_mode, null: false, default: "new_table"
      t.integer :row_count, null: false, default: 0
      t.integer :status, null: false, default: 0
      t.text :error_message
      t.datetime :imported_at

      t.timestamps
    end

    add_index :statement_csv_import_datasets, :header_signature
    add_index :statement_csv_import_datasets, :status
    add_index :statement_csv_import_datasets, :target_table_name

    create_table :statement_csv_import_files do |t|
      t.references :statement_csv_import, null: false, foreign_key: true
      t.references :statement_csv_import_dataset, foreign_key: true
      t.string :source_filename, null: false
      t.string :col_sep, null: false, default: ","
      t.boolean :header_row, null: false, default: true
      t.integer :row_count, null: false, default: 0
      t.text :normalized_headers
      t.text :inferred_columns
      t.text :sample_rows
      t.integer :status, null: false, default: 0
      t.text :error_message

      t.timestamps
    end

    add_index :statement_csv_import_files, :status
  end
end
