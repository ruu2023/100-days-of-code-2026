class CreateBookingSlots < ActiveRecord::Migration[8.1]
  def change
    create_table :booking_slots do |t|
      t.references :booking_owner, null: false, foreign_key: true
      t.datetime :starts_at, null: false
      t.datetime :ends_at, null: false
      t.integer :capacity, null: false, default: 1
      t.boolean :active, null: false, default: true
      t.string :label

      t.timestamps
    end

    add_index :booking_slots, [ :booking_owner_id, :starts_at ], unique: true
  end
end
