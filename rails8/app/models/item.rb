class Item < ApplicationRecord
  attribute :active, :boolean, default: true
  attribute :last_purchased_on, :date, default: -> { Date.current }

  validates :name, presence: true
  validates :purchase_cycle_days, presence: true,
                                   numericality: { only_integer: true, greater_than: 0 }
  validates :last_purchased_on, presence: true

  scope :active, -> { where(active: true) }

  def next_purchase_on
    return if last_purchased_on.blank? || purchase_cycle_days.blank?

    last_purchased_on + purchase_cycle_days.days
  end

  def days_until_next_purchase
    purchase_date = next_purchase_on
    return Float::INFINITY unless purchase_date

    (purchase_date - Date.current).to_i
  end

  def status
    purchase_date = next_purchase_on
    return :unknown unless purchase_date

    return :overdue if purchase_date < Date.current
    return :today if purchase_date == Date.current
    return :soon if purchase_date <= Date.current + 3

    :later
  end

  def mark_as_purchased!
    update!(last_purchased_on: Date.current, active: true)
  end
end

