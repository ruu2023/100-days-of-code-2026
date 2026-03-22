require "test_helper"

class Day081::RouletteControllerTest < ActionDispatch::IntegrationTest
  test "index" do
    get day081_path

    assert_response :success
    assert_select "h1", "Roulette Playground"
    assert_select "[data-controller='day081-roulette']"
    assert_select "button", /Spin/
  end
end
