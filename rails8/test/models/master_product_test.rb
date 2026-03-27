require "test_helper"

class MasterProductTest < ActiveSupport::TestCase
  test "requires unique sku" do
    duplicate = MasterProduct.new(
      sku: master_products(:alpha).sku,
      name: "重複SKU",
      category: "文具",
      supplier: "Tokyo Supply",
      stock: 1,
      unit: "冊",
      price: 100,
      status: "active",
      position: 99
    )

    assert_not duplicate.valid?
    assert_includes duplicate.errors[:sku], "has already been taken"
  end
end
