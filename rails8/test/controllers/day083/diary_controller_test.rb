require "test_helper"

class Day083::DiaryControllerTest < ActionDispatch::IntegrationTest
  test "index" do
    get day083_path

    assert_response :success
    assert_select "h1", "Pocket Diary"
    assert_select "[data-controller='day083-diary']"
    assert_select "form[action='#{day083_path}']"
  end

  test "create entry" do
    assert_difference("Day083::DiaryEntry.count", 1) do
      post day083_path, params: {
        day083_diary_entry: {
          title: "Night Notes",
          body: "PWA reminder worked nicely.",
          mood: "happy",
          entry_on: Date.current
        }
      }
    end

    assert_redirected_to day083_path
    follow_redirect!
    assert_select "article", /PWA reminder worked nicely/
  end
end
