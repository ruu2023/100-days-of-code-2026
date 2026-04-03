require "test_helper"

class ItemTest < ActiveSupport::TestCase
  test "is invalid without purchase cycle days" do
    item = Item.new(name: "牛乳", last_purchased_on: Date.current, active: true)

    assert_not item.valid?
    assert item.errors.added?(:purchase_cycle_days, :blank)
  end

  test "next_purchase_on is nil when required values are missing" do
    item = Item.new(name: "牛乳")

    assert_nil item.next_purchase_on
    assert_equal :unknown, item.status
  end
end
