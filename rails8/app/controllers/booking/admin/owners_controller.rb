module Booking
  module Admin
    class OwnersController < ApplicationController
      layout "application"

      def index
        @owners = BookingOwner.order(:name)
        @owner = BookingOwner.new
      end

      def create
        @owner = BookingOwner.new(owner_params)

        if @owner.save
          redirect_to booking_admin_owners_path, notice: "Owner created."
        else
          @owners = BookingOwner.order(:name)
          render :index, status: :unprocessable_entity
        end
      end

      private
        def owner_params
          params.require(:booking_owner).permit(:name, :slug, :notification_email, :time_zone)
        end
    end
  end
end
