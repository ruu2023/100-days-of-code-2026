require "test_helper"

class AgencyAgentsControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get agency_agents_index_url
    assert_response :success
  end
end
