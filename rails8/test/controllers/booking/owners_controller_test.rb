require "test_helper"

module Booking
  class OwnersControllerTest < ActionDispatch::IntegrationTest
    test "shows booking page" do
      slot = booking_slots(:tomorrow_morning)
      get booking_owner_path(booking_owners(:salon).slug, date: slot.starts_at.to_date.iso8601)

      assert_response :success
      assert_includes response.body, "Tokyo Salon"
      assert_includes response.body, "Morning"
      assert_includes response.body, "bg-emerald-400"
    end
  end
end
