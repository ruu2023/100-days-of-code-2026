require "test_helper"

class Erd::SchemaImporterTest < ActiveSupport::TestCase
  test "imports tables columns and foreign keys from schema.rb" do
    schema_path = Rails.root.join("test/fixtures/files/schema_import_sample/schema.rb")

    result = Erd::SchemaImporter.new(
      schema_path: schema_path,
      diagram_name: "Imported Blog"
    ).import!

    diagram = result.diagram
    users = diagram.erd_tables.find_by!(name: "users")
    posts = diagram.erd_tables.find_by!(name: "posts")

    assert_equal "Imported Blog", diagram.name
    assert_equal 2, result.table_count
    assert_equal 1, result.relationship_count
    assert users.erd_columns.exists?(name: "id", primary_key: true)
    assert posts.erd_columns.exists?(name: "user_id", data_type: "integer")

    relationship = diagram.erd_relationships.find_by!(target_table: posts)
    assert_equal users, relationship.source_table
    assert_equal "user_id", relationship.target_column
    assert_equal "id", relationship.source_column
  end

  test "rejects non schema file" do
    error = assert_raises(Erd::SchemaImporter::ImportError) do
      Erd::SchemaImporter.new(schema_path: Rails.root.join("README.md")).import!
    end

    assert_equal "schema.rb を指定してください", error.message
  end
end
