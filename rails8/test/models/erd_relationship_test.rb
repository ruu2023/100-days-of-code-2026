require "test_helper"

class ErdRelationshipTest < ActiveSupport::TestCase
  test "is invalid when source and target tables are identical" do
    diagram = ErdDiagram.create!(name: "Blog")
    table = diagram.erd_tables.create!(name: "users")

    relationship = ErdRelationship.new(
      erd_diagram: diagram,
      source_table: table,
      target_table: table,
      cardinality: :one_to_many
    )

    assert_not relationship.valid?
    assert_includes relationship.errors[:target_table_id], "must be different from source table"
  end

  test "is invalid when tables belong to different diagrams" do
    left_diagram = ErdDiagram.create!(name: "Blog")
    right_diagram = ErdDiagram.create!(name: "Shop")
    source_table = left_diagram.erd_tables.create!(name: "users")
    target_table = right_diagram.erd_tables.create!(name: "orders")

    relationship = ErdRelationship.new(
      erd_diagram: left_diagram,
      source_table: source_table,
      target_table: target_table,
      cardinality: :one_to_many
    )

    assert_not relationship.valid?
    assert_includes relationship.errors[:base], "source and target tables must belong to the selected diagram"
  end
end
