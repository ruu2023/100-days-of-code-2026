class ErdDiagram < ApplicationRecord
  has_many :erd_tables, dependent: :destroy
  has_many :erd_relationships, dependent: :destroy

  validates :name, presence: true
end
