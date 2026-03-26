# frozen_string_literal: true

class Day085::Category < ApplicationRecord
  self.table_name = "day085_categories"

  has_many :subscriptions, class_name: "Day085::Subscription", foreign_key: :category_id, dependent: :nullify

  validates :name, presence: true, uniqueness: true
end
