require "test_helper"
require "rack/test"
require "tempfile"

class Erd::SchemaImporterTest < ActiveSupport::TestCase
  test "imports tables columns and foreign keys from schema.rb" do
    schema_file = Rack::Test::UploadedFile.new(
      Rails.root.join("test/fixtures/files/schema_import_sample/schema.rb"),
      "text/plain"
    )

    result = Erd::SchemaImporter.new(
      uploaded_schema: schema_file,
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
      Erd::SchemaImporter.new(
        uploaded_schema: Rack::Test::UploadedFile.new(
          Rails.root.join("test/fixtures/files/customers.csv"),
          "text/csv"
        )
      ).import!
    end

    assert_equal "schema.rb を選択してください", error.message
  end

  test "rejects empty upload" do
    error = assert_raises(Erd::SchemaImporter::ImportError) do
      Erd::SchemaImporter.new(uploaded_schema: nil).import!
    end

    assert_equal "schema.rb ファイルを選択してください", error.message
  end

  test "imports multiple foreign keys between the same table pair" do
    Tempfile.create(["schema", ".rb"]) do |file|
      file.write(<<~RUBY)
        ActiveRecord::Schema[8.1].define(version: 2026_04_06_090000) do
          create_table "tables", force: :cascade do |t|
            t.string "name", null: false
          end

          create_table "relations", force: :cascade do |t|
            t.bigint "from_table_id", null: false
            t.bigint "to_table_id", null: false
          end

          add_foreign_key "relations", "tables", column: "from_table_id"
          add_foreign_key "relations", "tables", column: "to_table_id"
        end
      RUBY
      file.rewind

      uploaded = Rack::Test::UploadedFile.new(file.path, "text/plain", original_filename: "schema.rb")
      result = Erd::SchemaImporter.new(uploaded_schema: uploaded, diagram_name: "Double FK").import!

      assert_equal 2, result.relationship_count
      assert_equal 2, result.diagram.erd_relationships.pluck(:name).uniq.size
    end
  end
end
