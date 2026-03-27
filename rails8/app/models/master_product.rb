class MasterProduct < ApplicationRecord
  STATUSES = %w[active draft archived].freeze

  validates :sku, :name, :category, :supplier, :unit, :status, presence: true
  validates :sku, uniqueness: true
  validates :stock, :position, numericality: { greater_than_or_equal_to: 0, only_integer: true }
  validates :price, numericality: { greater_than_or_equal_to: 0 }
  validates :status, inclusion: { in: STATUSES }

  scope :ordered, -> { order(:position, :sku) }

  def self.search(params)
    records = ordered
    records = records.where("LOWER(name) LIKE :term OR LOWER(sku) LIKE :term", term: "%#{params[:q].to_s.downcase}%") if params[:q].present?
    records = records.where(category: params[:category]) if params[:category].present?
    records = records.where(status: params[:status]) if params[:status].present?
    records
  end

  def self.category_options
    ordered.distinct.pluck(:category).compact_blank
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[category created_at id name notes position price sku status stock supplier unit updated_at]
  end

  def self.ransackable_associations(_auth_object = nil)
    []
  end
end
