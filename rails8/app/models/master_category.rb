class MasterCategory < ApplicationRecord
  has_many :master_products, foreign_key: :category_ref_id, inverse_of: :category_ref, dependent: :restrict_with_exception

  validates :name, presence: true, uniqueness: true
  validates :position, numericality: { greater_than_or_equal_to: 0, only_integer: true }

  scope :ordered, -> { order(:position, :name) }

  def self.ransackable_attributes(_auth_object = nil)
    %w[created_at id name position updated_at]
  end

  def self.ransackable_associations(_auth_object = nil)
    []
  end

  def to_s
    name
  end
end
