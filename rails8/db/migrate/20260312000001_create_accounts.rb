# frozen_string_literal: true

class CreateAccounts < ActiveRecord::Migration[8.1]
  def change
    create_table :accounts do |t|
      t.string :name, null: false
      t.integer :account_type, null: false # 0: Asset, 1: Liability, 2: Equity, 3: Revenue, 4: Expense
      t.string :code, null: false
      t.text :description
      t.boolean :active, default: true
      t.references :parent, foreign_key: { to_table: :accounts }, null: true

      t.timestamps
    end

    add_index :accounts, :code, unique: true
    add_index :accounts, :account_type
    add_index :accounts, :active
  end
end
