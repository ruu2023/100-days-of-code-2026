require "test_helper"

class ItemsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @item = items(:one)
  end

  test "should get index" do
    get items_url
    assert_response :success
  end

  test "should create item" do
    assert_difference("Item.count") do
      post items_url, params: { item: { active: true, last_purchased_on: Date.current, memo: "定番", name: "めんつゆ", purchase_cycle_days: 30 } }
    end

    assert_redirected_to items_url
  end

  test "should update item" do
    patch item_url(@item), params: { item: { active: true, last_purchased_on: Date.current, memo: @item.memo, name: "しょうゆ", purchase_cycle_days: 14 } }

    assert_redirected_to items_url
    assert_equal "しょうゆ", @item.reload.name
  end

  test "should destroy item" do
    assert_difference("Item.count", -1) do
      delete item_url(@item)
    end

    assert_redirected_to items_url
  end

  test "should mark item as purchased" do
    patch mark_purchased_item_url(@item)

    assert_redirected_to items_url
    assert_equal Date.current, @item.reload.last_purchased_on
  end
end
