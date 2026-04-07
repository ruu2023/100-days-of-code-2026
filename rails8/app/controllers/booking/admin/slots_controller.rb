module Booking
  module Admin
    class SlotsController < ApplicationController
      layout "application"
      before_action :set_owner

      def index
        @slot = @owner.booking_slots.new(default_slot_attributes)
        @slots = @owner.booking_slots.order(:starts_at)
      end

      def create
        @slot = @owner.booking_slots.new(slot_params)

        if @slot.save
          redirect_to booking_admin_owner_slots_path(@owner), notice: "Slot created."
        else
          @slots = @owner.booking_slots.order(:starts_at)
          render :index, status: :unprocessable_entity
        end
      end

      private
        def set_owner
          @owner = BookingOwner.find(params[:owner_id])
        end

        def default_slot_attributes
          start_time = Time.zone.now.change(min: 0) + 1.day
          { starts_at: start_time, ends_at: start_time + 30.minutes, capacity: 1 }
        end

        def slot_params
          params.require(:booking_slot).permit(:starts_at, :ends_at, :capacity, :active, :label)
        end
    end
  end
end
