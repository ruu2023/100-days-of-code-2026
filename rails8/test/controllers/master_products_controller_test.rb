require "test_helper"

class MasterProductsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @master_product = master_products(:alpha)
  end

  test "should get index" do
    get master_demo_products_url
    assert_response :success
    assert_includes @response.body, "Excel感覚のマスタ管理画面"
  end

  test "should filter by search query" do
    get master_demo_products_url, params: { q: "カラーペン" }
    assert_response :success
    assert_includes @response.body, "カラーペン"
    assert_not_includes @response.body, "PRD-001"
  end

  test "should create master product" do
    assert_difference("MasterProduct.count", 1) do
      post master_demo_products_url, params: {
        master_product: {
          product_name_id: master_product_names(:new_item).id,
          category_ref_id: master_categories(:electronics).id,
          supplier_ref_id: master_suppliers(:nagoya_parts).id,
          stock: 12,
          unit: "台",
          price: 12800,
          status: "active",
          notes: "テスト登録",
          position: 30
        }
      }
    end

    assert_redirected_to master_demo_products_url
    assert_equal "PRD-0003", MasterProduct.order(:created_at).last.sku
  end

  test "should update master product inline" do
    patch quick_update_master_demo_product_url(@master_product), params: {
      master_product: {
        stock: 5,
        price: 520,
        status: "archived",
        notes: "終売"
      }
    }, as: :turbo_stream

    assert_response :success
    @master_product.reload
    assert_equal 5, @master_product.stock
    assert_equal "archived", @master_product.status
  end

  test "should destroy master product" do
    assert_difference("MasterProduct.count", -1) do
      delete master_demo_product_url(@master_product)
    end

    assert_redirected_to master_demo_products_url
  end
end
