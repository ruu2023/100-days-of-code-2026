module Booking
  class ReservationsController < ApplicationController
    layout "application"

    def create
      @owner = BookingOwner.find_by!(slug: params[:owner_slug])
      @slot = @owner.booking_slots.find(params[:booking_reservation][:booking_slot_id])
      @reservation = BookingReservation.new(reservation_params.merge(booking_slot: @slot))

      if @reservation.save
        redirect_to booking_owner_path(@owner.slug, date: @slot.starts_at.to_date.iso8601), notice: "Reservation confirmed."
      else
        @selected_date = @slot.starts_at.to_date
        @selected_slot = @slot
        @month_anchor = Date.new(@selected_date.year, @selected_date.month, 1)
        @calendar_days = calendar_days_for(@month_anchor)
        @slots = @owner.booking_slots.active.for_day(@selected_date)
        render "booking/owners/show", status: :unprocessable_entity
      end
    rescue ActiveRecord::RecordNotUnique
      redirect_to booking_owner_path(@owner.slug, date: @slot.starts_at.to_date.iso8601), alert: "That slot was just reserved. Please choose another time."
    end

    private
      def reservation_params
        params.require(:booking_reservation).permit(:name, :email, :phone, :note)
      end

      def calendar_days_for(month_anchor)
        first = month_anchor.beginning_of_month.beginning_of_week(:sunday)
        last = month_anchor.end_of_month.end_of_week(:sunday)

        (first..last).to_a
      end
  end
end
