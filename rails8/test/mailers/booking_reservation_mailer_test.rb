require "test_helper"

class BookingReservationMailerTest < ActionMailer::TestCase
  test "confirmation" do
    reservation = booking_reservations(:confirmed)
    mail = BookingReservationMailer.confirmation(reservation)

    assert_equal [ reservation.email ], mail.to
    assert_equal "#{reservation.booking_owner.name} ご予約確認", mail.subject
    assert_includes mail.body.encoded, reservation.name
  end

  test "owner notification" do
    reservation = booking_reservations(:confirmed)
    mail = BookingReservationMailer.owner_notification(reservation)

    assert_equal [ reservation.booking_owner.notification_email ], mail.to
    assert_equal "#{reservation.booking_owner.name} 新しい予約", mail.subject
    assert_includes mail.body.encoded, reservation.email
  end
end
