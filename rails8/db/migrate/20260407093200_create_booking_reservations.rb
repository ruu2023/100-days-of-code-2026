class CreateBookingReservations < ActiveRecord::Migration[8.1]
  def change
    create_table :booking_reservations do |t|
      t.references :booking_slot, null: false, foreign_key: true, index: { unique: true }
      t.string :name, null: false
      t.string :email, null: false
      t.string :phone
      t.text :note
      t.integer :status, null: false, default: 0

      t.timestamps
    end
  end
end
