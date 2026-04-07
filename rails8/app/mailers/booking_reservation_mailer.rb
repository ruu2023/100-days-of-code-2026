class BookingReservationMailer < ApplicationMailer
  def confirmation(reservation)
    @reservation = reservation
    @slot = reservation.booking_slot
    @owner = reservation.booking_owner

    mail to: reservation.email, subject: "#{@owner.name} ご予約確認"
  end

  def owner_notification(reservation)
    @reservation = reservation
    @slot = reservation.booking_slot
    @owner = reservation.booking_owner

    mail to: @owner.notification_email, subject: "#{@owner.name} 新しい予約"
  end
end
