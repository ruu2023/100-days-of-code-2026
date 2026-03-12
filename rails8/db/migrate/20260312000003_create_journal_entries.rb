# frozen_string_literal: true

class CreateJournalEntries < ActiveRecord::Migration[8.1]
  def change
    create_table :journal_entries do |t|
      t.string :entry_number, null: false
      t.date :entry_date, null: false
      t.text :description
      t.references :party, foreign_key: { to_table: :parties }, null: true
      t.references :created_by, foreign_key: { to_table: :users }, null: true
      t.boolean :posted, default: false
      t.boolean :reversed, default: false
      t.references :reversal_of, foreign_key: { to_table: :journal_entries }, null: true

      t.timestamps
    end

    add_index :journal_entries, :entry_number, unique: true
    add_index :journal_entries, :entry_date
    add_index :journal_entries, :posted
  end
end
