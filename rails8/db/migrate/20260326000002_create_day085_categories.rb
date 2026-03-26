class CreateDay085Categories < ActiveRecord::Migration[8.1]
  def change
    create_table :day085_categories do |t|
      t.string :name, null: false
      t.string :icon
      t.integer :color

      t.timestamps
    end

    add_index :day085_categories, :name, unique: true
  end
end
