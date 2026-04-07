class BookingOwner < ApplicationRecord
  has_many :booking_slots, dependent: :destroy

  normalizes :slug, with: ->(value) { value.to_s.parameterize }
  normalizes :notification_email, with: ->(value) { value.to_s.strip.downcase }

  validates :name, :slug, :notification_email, presence: true
  validates :slug, uniqueness: true
end
