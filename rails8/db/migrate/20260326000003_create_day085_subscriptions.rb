class CreateDay085Subscriptions < ActiveRecord::Migration[8.1]
  def change
    create_table :day085_subscriptions do |t|
      t.references :user, null: false, foreign_key: true
      t.references :category, foreign_key: { to_table: :day085_categories }
      t.string :name, null: false
      t.decimal :price, precision: 10, scale: 2, null: false
      t.integer :billing_cycle, null: false, default: 0 # 0: monthly, 1: yearly
      t.integer :status, null: false, default: 0 # 0: active, 1: cancel_scheduled, 2: cancelled
      t.date :next_billing_date
      t.date :start_date
      t.date :end_date
      t.text :description
      t.text :website

      t.timestamps
    end

    add_index :day085_subscriptions, [:user_id, :status]
    add_index :day085_subscriptions, [:user_id, :category_id]
  end
end
