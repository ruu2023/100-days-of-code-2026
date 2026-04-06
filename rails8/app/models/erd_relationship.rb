class ErdRelationship < ApplicationRecord
  belongs_to :erd_diagram
  belongs_to :source_table, class_name: "ErdTable", inverse_of: :source_relationships
  belongs_to :target_table, class_name: "ErdTable", inverse_of: :target_relationships

  enum :cardinality, {
    one_to_one: 0,
    one_to_many: 1,
    many_to_one: 2,
    many_to_many: 3
  }, default: :one_to_many

  validates :source_table_id, uniqueness: {
    scope: [:erd_diagram_id, :target_table_id, :name],
    message: "relationship already exists for this source and target"
  }

  validate :source_and_target_are_different
  validate :tables_belong_to_same_diagram

  before_validation :sync_diagram_from_source_table

  def label
    [name, "#{source_column.presence || source_table.name} -> #{target_column.presence || target_table.name}"].compact.join(" ")
  end

  private

  def sync_diagram_from_source_table
    self.erd_diagram ||= source_table&.erd_diagram
  end

  def source_and_target_are_different
    return if source_table_id.blank? || target_table_id.blank?

    errors.add(:target_table_id, "must be different from source table") if source_table_id == target_table_id
  end

  def tables_belong_to_same_diagram
    return if source_table.blank? || target_table.blank?

    if source_table.erd_diagram_id != erd_diagram_id || target_table.erd_diagram_id != erd_diagram_id
      errors.add(:base, "source and target tables must belong to the selected diagram")
    end
  end
end
