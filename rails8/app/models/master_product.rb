class MasterProduct < ApplicationRecord
  STATUSES = %w[active draft archived].freeze

  belongs_to :product_name, class_name: "MasterProductName", inverse_of: :master_products
  belongs_to :category_ref, class_name: "MasterCategory", inverse_of: :master_products
  belongs_to :supplier_ref, class_name: "MasterSupplier", inverse_of: :master_products

  before_validation :assign_sku, on: :create

  validates :sku, :unit, :status, presence: true
  validates :sku, uniqueness: true
  validates :stock, :position, numericality: { greater_than_or_equal_to: 0, only_integer: true }
  validates :price, numericality: { greater_than_or_equal_to: 0 }
  validates :status, inclusion: { in: STATUSES }

  delegate :name, to: :product_name
  delegate :name, to: :category_ref, prefix: :category
  delegate :name, to: :supplier_ref, prefix: :supplier

  scope :with_masters, -> { includes(:product_name, :category_ref, :supplier_ref) }
  scope :ordered, -> { with_masters.order(:position, :sku) }

  def self.search(params)
    records = ordered
    if params[:q].present?
      term = "%#{params[:q].to_s.downcase}%"
      records = records.left_joins(:product_name).where("LOWER(master_product_names.name) LIKE :term OR LOWER(master_products.sku) LIKE :term", term: term)
    end
    records = records.where(category_ref_id: params[:category_id]) if params[:category_id].present?
    records = records.where(supplier_ref_id: params[:supplier_id]) if params[:supplier_id].present?
    records = records.where(status: params[:status]) if params[:status].present?
    records
  end

  def self.category_options
    MasterCategory.ordered.pluck(:name, :id)
  end

  def self.supplier_options
    MasterSupplier.ordered.pluck(:name, :id)
  end

  def self.product_name_options
    MasterProductName.ordered.pluck(:name, :id)
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[created_at id notes position price sku status stock unit updated_at]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[category_ref product_name supplier_ref]
  end

  private

  def assign_sku
    return if sku.present?

    last_number = self.class.unscoped.maximum(Arel.sql("CAST(SUBSTR(sku, 5) AS INTEGER)")).to_i
    self.sku = format("PRD-%04d", last_number + 1)
  end
end
