# frozen_string_literal: true

class CreateParties < ActiveRecord::Migration[8.1]
  def change
    create_table :parties do |t|
      t.string :name, null: false
      t.string :party_type, null: false, default: "client" # client, vendor
      t.string :email
      t.string :phone
      t.text :address
      t.string :tax_id
      t.boolean :active, default: true

      t.timestamps
    end

    add_index :parties, :name
    add_index :parties, :party_type
    add_index :parties, :active
  end
end
