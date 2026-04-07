class BookingReservation < ApplicationRecord
  belongs_to :booking_slot

  enum :status, { confirmed: 0, cancelled: 1 }

  normalizes :email, with: ->(value) { value.to_s.strip.downcase }

  validates :name, :email, presence: true
  validates :booking_slot_id, uniqueness: true
  validate :slot_is_available, on: :create

  after_create :send_notifications

  delegate :booking_owner, to: :booking_slot

  private
    def slot_is_available
      return if booking_slot_id.blank?
      return unless BookingReservation.where(booking_slot_id: booking_slot_id).where.not(id: id).exists?

      errors.add(:booking_slot, "is no longer available")
    end

    def send_notifications
      BookingReservationMailer.confirmation(self).deliver_now
      BookingReservationMailer.owner_notification(self).deliver_now
    end
end
