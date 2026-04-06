class ErdColumn < ApplicationRecord
  belongs_to :erd_table

  validates :name, presence: true, uniqueness: { scope: :erd_table_id }
  validates :data_type, presence: true
end
