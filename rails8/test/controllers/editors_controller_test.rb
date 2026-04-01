require "test_helper"

class EditorsControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get editor_url

    assert_response :success
  end
end
