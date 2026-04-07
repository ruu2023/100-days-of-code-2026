class CreateBookingOwners < ActiveRecord::Migration[8.1]
  def change
    create_table :booking_owners do |t|
      t.string :name, null: false
      t.string :slug, null: false
      t.string :notification_email, null: false
      t.string :time_zone, null: false, default: "Asia/Tokyo"

      t.timestamps
    end

    add_index :booking_owners, :slug, unique: true
  end
end
