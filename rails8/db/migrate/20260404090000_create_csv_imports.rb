class CreateCsvImports < ActiveRecord::Migration[8.1]
  def change
    create_table :csv_imports do |t|
      t.string :name, null: false
      t.string :source_filename, null: false
      t.string :target_table_name, null: false
      t.integer :status, null: false, default: 0
      t.string :col_sep, null: false, default: ","
      t.boolean :header_row, null: false, default: true
      t.integer :row_count, null: false, default: 0
      t.text :inferred_columns
      t.text :sample_rows
      t.datetime :imported_at
      t.text :error_message

      t.timestamps
    end

    add_index :csv_imports, :target_table_name, unique: true
    add_index :csv_imports, :status
  end
end
