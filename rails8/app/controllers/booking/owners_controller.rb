module Booking
  class OwnersController < ApplicationController
    layout "application"

    def show
      @owner = BookingOwner.find_by!(slug: params[:slug])
      @selected_date = parse_date(params[:date])
      @selected_slot = selected_slot_for(@owner, params[:slot_id])
      @reservation = BookingReservation.new(booking_slot: @selected_slot)
      @month_anchor = Date.new(@selected_date.year, @selected_date.month, 1)
      @calendar_days = calendar_days_for(@month_anchor)
      @slots = @owner.booking_slots.active.for_day(@selected_date)
    end

    private
      def parse_date(raw_value)
        Date.iso8601(raw_value)
      rescue ArgumentError, TypeError
        Date.current
      end

      def selected_slot_for(owner, slot_id)
        return if slot_id.blank?

        owner.booking_slots.find_by(id: slot_id)
      end

      def calendar_days_for(month_anchor)
        first = month_anchor.beginning_of_month.beginning_of_week(:sunday)
        last = month_anchor.end_of_month.end_of_week(:sunday)

        (first..last).to_a
      end
  end
end
