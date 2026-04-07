require "test_helper"

class ResendDeliveryMethodTest < ActiveSupport::TestCase
  test "builds resend payload from multipart mail" do
    delivery_method = ResendDeliveryMethod.new(
      api_key: "re_test",
      from: "Ruu Dev Booking <no-reply@ruu-dev.com>",
      reply_to: "hello@ruu-dev.com"
    )

    mail = BookingReservationMailer.confirmation(booking_reservations(:confirmed))
    payload = delivery_method.send(:payload_for, mail)

    assert_equal "Ruu Dev Booking <no-reply@ruu-dev.com>", payload[:from]
    assert_equal [ "reserved@example.com" ], payload[:to]
    assert_equal "hello@ruu-dev.com", payload[:reply_to]
    assert_includes payload[:html], "Tokyo Salon"
    assert_includes payload[:text], "Tokyo Salon"
  end
end
