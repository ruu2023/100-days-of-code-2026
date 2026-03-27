class CreateMasterProducts < ActiveRecord::Migration[8.1]
  def change
    create_table :master_products do |t|
      t.string :sku, null: false
      t.string :name, null: false
      t.string :category, null: false
      t.string :supplier, null: false
      t.integer :stock, null: false, default: 0
      t.string :unit, null: false, default: "pcs"
      t.decimal :price, precision: 10, scale: 2, null: false, default: 0
      t.string :status, null: false, default: "active"
      t.text :notes
      t.integer :position, null: false, default: 0

      t.timestamps
    end

    add_index :master_products, :sku, unique: true
    add_index :master_products, :category
    add_index :master_products, :status
    add_index :master_products, :position
  end
end
