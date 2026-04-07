class BookingSlot < ApplicationRecord
  belongs_to :booking_owner
  has_one :booking_reservation, dependent: :destroy

  scope :active, -> { where(active: true) }
  scope :for_day, ->(day) { where(starts_at: day.beginning_of_day..day.end_of_day).order(:starts_at) }
  scope :upcoming, -> { where("starts_at >= ?", Time.current).order(:starts_at) }

  validates :starts_at, :ends_at, presence: true
  validates :starts_at, uniqueness: { scope: :booking_owner_id }
  validates :capacity, numericality: { greater_than: 0 }
  validate :ends_after_start

  def reserved?
    booking_reservation&.persisted?
  end

  def available?
    active? && !reserved? && starts_at >= Time.current
  end

  def display_label
    label.presence || "#{starts_at.strftime('%H:%M')} - #{ends_at.strftime('%H:%M')}"
  end

  private
    def ends_after_start
      return if starts_at.blank? || ends_at.blank?
      return if ends_at > starts_at

      errors.add(:ends_at, "must be after the start time")
    end
end
