class CreateInventories < ActiveRecord::Migration[8.1]
  def change
    create_table :inventories do |t|
      t.string :name
      t.string :code
      t.integer :quantity
      t.string :unit
      t.string :location
      t.text :notes

      t.timestamps
    end
  end
end
