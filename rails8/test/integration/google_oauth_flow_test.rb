require "test_helper"

class GoogleOauthFlowTest < ActionDispatch::IntegrationTest
  test "sign in button posts to omniauth request path" do
    get new_session_path

    assert_response :success
    assert_select "form[action='/auth/google_oauth2'][method='post']"
  end

  test "google oauth request path is not handled by application routes as get" do
    assert_raises(ActionController::RoutingError) do
      Rails.application.routes.recognize_path("/auth/google_oauth2", method: :get)
    end
  end
end
