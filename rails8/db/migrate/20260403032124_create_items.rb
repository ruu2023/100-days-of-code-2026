class CreateItems < ActiveRecord::Migration[8.1]
  def change
    create_table :items do |t|
      t.string :name
      t.integer :purchase_cycle_days
      t.date :last_purchased_on
      t.text :memo
      t.boolean :active

      t.timestamps
    end
  end
end
