# frozen_string_literal: true

class Day085::Subscription < ApplicationRecord
  self.table_name = "day085_subscriptions"

  belongs_to :user
  belongs_to :category, class_name: "Day085::Category", optional: true

  enum :billing_cycle, { monthly: 0, yearly: 1 }
  enum :status, { active: 0, cancel_scheduled: 1, cancelled: 2 }

  validates :name, presence: true
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :billing_cycle, presence: true
  validates :status, presence: true

  scope :for_user, ->(user) { where(user:) }
  scope :by_name, ->(name) { where("name LIKE ?", "%#{name}%") if name.present? }
  scope :by_status, ->(status) { where(status:) if status.present? }
  scope :by_category, ->(category_id) { where(category_id:) if category_id.present? }
  scope :by_billing_cycle, ->(cycle) { where(billing_cycle: cycle) if cycle.present? }

  def monthly_cost
    if monthly?
      price
    else
      price / 12
    end
  end

  def yearly_cost
    if yearly?
      price
    else
      price * 12
    end
  end

  def next_billing_date
    return nil if cancelled?

    base_date = start_date || Date.current

    case billing_cycle
    when "monthly"
      date = base_date
      date += 1.month while date <= Date.current
      date
    when "yearly"
      date = base_date
      date += 1.year while date <= Date.current
      date
    end
  end
end
