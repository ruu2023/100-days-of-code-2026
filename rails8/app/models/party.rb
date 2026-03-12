# frozen_string_literal: true

class Party < ApplicationRecord
  enum :party_type, {
    client: "client",
    vendor: "vendor"
  }, prefix: true

  has_many :journal_entries, dependent: :nullify

  validates :name, presence: true
  validates :party_type, presence: true

  scope :active, -> { where(active: true) }
  scope :by_type, ->(type) { where(party_type: type) }
  scope :search, ->(query) { where("LOWER(name) LIKE ?", "%#{query.downcase}%") if query.present? }

  def display_name
    "#{name} (#{party_type.titleize})"
  end
end
