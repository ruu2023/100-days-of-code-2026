class ErdTable < ApplicationRecord
  belongs_to :erd_diagram

  has_many :erd_columns, dependent: :destroy
  has_many :source_relationships,
           class_name: "ErdRelationship",
           foreign_key: :source_table_id,
           inverse_of: :source_table,
           dependent: :destroy
  has_many :target_relationships,
           class_name: "ErdRelationship",
           foreign_key: :target_table_id,
           inverse_of: :target_table,
           dependent: :destroy

  validates :name, presence: true, uniqueness: { scope: :erd_diagram_id }

  def graph_label
    column_lines = erd_columns.order(primary_key: :desc, name: :asc).map do |column|
      prefix = column.primary_key? ? "PK" : "  "
      nullability = column.null_allowed? ? "NULL" : "NOT NULL"
      "#{prefix} #{column.name}: #{column.data_type} #{nullability}"
    end

    ([name] + column_lines).join("\n")
  end
end
