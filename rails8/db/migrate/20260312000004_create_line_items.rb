# frozen_string_literal: true

class CreateLineItems < ActiveRecord::Migration[8.1]
  def change
    create_table :line_items do |t|
      t.references :journal_entry, null: false, foreign_key: true
      t.references :account, null: false, foreign_key: true
      t.decimal :debit, precision: 15, scale: 2, default: 0
      t.decimal :credit, precision: 15, scale: 2, default: 0
      t.text :memo

      t.timestamps
    end

    add_index :line_items, [:journal_entry_id, :account_id]
  end
end
