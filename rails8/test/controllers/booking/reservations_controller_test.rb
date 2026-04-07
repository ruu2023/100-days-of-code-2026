require "test_helper"

module Booking
  class ReservationsControllerTest < ActionDispatch::IntegrationTest
    setup do
      @owner = booking_owners(:salon)
      @slot = booking_slots(:tomorrow_morning)
    end

    test "creates a reservation" do
      assert_difference("BookingReservation.count", 1) do
        post booking_owner_reservations_path(@owner.slug), params: {
          booking_reservation: {
            booking_slot_id: @slot.id,
            name: "New Guest",
            email: "guest@example.com",
            phone: "09012345678",
            note: "Please call if delayed"
          }
        }
      end

      assert_redirected_to booking_owner_path(@owner.slug, date: @slot.starts_at.to_date.iso8601)
      assert_equal "New Guest", @slot.reload.booking_reservation.name
      assert_equal "guest@example.com", @slot.booking_reservation.email
    end

    test "rejects an already reserved slot" do
      post booking_owner_reservations_path(@owner.slug), params: {
        booking_reservation: {
          booking_slot_id: booking_slots(:tomorrow_noon).id,
          name: "Late Guest",
          email: "late@example.com"
        }
      }

      assert_response :unprocessable_entity
      assert_includes response.body, "no longer available"
    end
  end
end
