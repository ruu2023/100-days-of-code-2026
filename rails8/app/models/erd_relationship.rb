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

  def direction_label
    "#{target_table.name}.#{target_column.presence || 'id'} -> #{source_table.name}.#{source_column.presence || 'id'}"
  end

  def semantic_label
    case cardinality
    when "one_to_many"
      "#{target_table.name} belongs_to #{source_table.name} / #{source_table.name} has_many #{target_table.name}"
    when "many_to_one"
      "#{target_table.name} has_many #{source_table.name} / #{source_table.name} belongs_to #{target_table.name}"
    when "one_to_one"
      "#{target_table.name} has_one #{source_table.name}"
    when "many_to_many"
      "#{target_table.name} has_and_belongs_to_many #{source_table.name}"
    else
      cardinality.humanize
    end
  end

  def cardinality_badge
    case cardinality
    when "one_to_many"
      "N:1"
    when "many_to_one"
      "1:N"
    when "one_to_one"
      "1:1"
    when "many_to_many"
      "N:N"
    else
      cardinality.humanize
    end
  end

  def cardinality_phrase
    case cardinality
    when "one_to_many"
      "many-to-one"
    when "many_to_one"
      "one-to-many"
    when "one_to_one"
      "one-to-one"
    when "many_to_many"
      "many-to-many"
    else
      cardinality.humanize
    end
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
