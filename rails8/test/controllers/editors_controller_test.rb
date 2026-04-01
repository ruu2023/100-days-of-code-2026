require "test_helper"

class EditorsControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get editor_url

    assert_response :success
  end

  test "should run ruby snippet" do
    post run_editor_url, params: { editor: { code: "puts 'hello from ruby'" } }

    assert_response :success
    assert_includes response.body, "hello from ruby"
    assert_includes response.body, "exit 0"
  end
end
