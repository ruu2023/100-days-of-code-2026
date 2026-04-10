class TimelineController < ApplicationController
  def index
    @events = HistoryEvent.order(:year)
    respond_to do |format|
      format.html
      format.json { render json: @events }
    end
  end
end
