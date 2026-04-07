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
      @available_dates = available_dates_for(@owner, @calendar_days)
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

      def available_dates_for(owner, calendar_days)
        owner.booking_slots
          .active
          .left_outer_joins(:booking_reservation)
          .where(booking_reservations: { id: nil })
          .where(starts_at: calendar_days.first.beginning_of_day..calendar_days.last.end_of_day)
          .where("starts_at >= ?", Time.current)
          .pluck(:starts_at)
          .map(&:to_date)
          .uniq
      end
  end
end
