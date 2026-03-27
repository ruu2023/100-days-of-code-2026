require "test_helper"

class MasterProductTest < ActiveSupport::TestCase
  test "requires unique sku" do
    duplicate = MasterProduct.new(
      sku: master_products(:alpha).sku,
      product_name: master_product_names(:pen),
      category_ref: master_categories(:stationery),
      supplier_ref: master_suppliers(:tokyo_supply),
      stock: 1,
      unit: "冊",
      price: 100,
      status: "active",
      position: 99
    )

    assert_not duplicate.valid?
    assert_includes duplicate.errors[:sku], "has already been taken"
  end

  test "assigns sku automatically on create" do
    product = MasterProduct.create!(
      product_name: master_product_names(:new_item),
      category_ref: master_categories(:electronics),
      supplier_ref: master_suppliers(:nagoya_parts),
      stock: 3,
      unit: "台",
      price: 1200,
      status: "active",
      position: 40
    )

    assert_equal "PRD-0003", product.sku
  end
end
