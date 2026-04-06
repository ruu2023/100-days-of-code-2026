require "test_helper"
require "rack/test"

class Erd::ErdDiagramsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @diagram = ErdDiagram.create!(name: "Blog")
    @users = @diagram.erd_tables.create!(name: "users", description: "ユーザー")
    @posts = @diagram.erd_tables.create!(name: "posts", description: "投稿")
    @users.erd_columns.create!(name: "id", data_type: "bigint", primary_key: true, null_allowed: false)
    @posts.erd_columns.create!(name: "user_id", data_type: "bigint", null_allowed: false)
    @diagram.erd_relationships.create!(
      source_table: @users,
      target_table: @posts,
      source_column: "id",
      target_column: "user_id",
      cardinality: :one_to_many,
      name: "users_posts"
    )
  end

  test "should get index" do
    get erd_path

    assert_response :success
    assert_match "Rails + Three.js ER 図", response.body
  end

  test "should create diagram" do
    assert_difference("ErdDiagram.count") do
      post erd_erd_diagrams_path, params: { erd_diagram: { name: "Shop", description: "EC schema" } }
    end

    assert_redirected_to erd_path(diagram_id: ErdDiagram.order(:id).last.id)
  end

  test "should render graph api" do
    get graph_api_erd_erd_diagram_path(@diagram), as: :json

    assert_response :success
    payload = JSON.parse(response.body)

    assert_equal @diagram.name, payload.dig("diagram", "name")
    assert_equal 2, payload["nodes"].size
    assert_equal 1, payload["links"].size
  end

  test "should persist node position" do
    patch position_api_erd_erd_table_path(@users),
          params: { erd_table: { x: 12.5, y: -3.0, z: 42.0 } },
          as: :json

    assert_response :success
    assert_equal 12.5, @users.reload.x
    assert_equal(-3.0, @users.y)
    assert_equal 42.0, @users.z
  end

  test "should import schema file" do
    schema_file = Rack::Test::UploadedFile.new(
      Rails.root.join("test/fixtures/files/schema_import_sample/schema.rb"),
      "text/plain"
    )

    assert_difference("ErdDiagram.count") do
      post erd_schema_imports_path, params: {
        schema_import: {
          schema_file: schema_file,
          diagram_name: "Fixture Import"
        }
      }
    end

    diagram = ErdDiagram.order(:id).last
    assert_redirected_to erd_path(diagram_id: diagram.id)
    assert_equal "Fixture Import", diagram.name
    assert diagram.erd_tables.exists?(name: "users")
    assert diagram.erd_relationships.exists?
  end
end
