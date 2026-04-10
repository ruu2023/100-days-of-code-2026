class TimelinesController < ApplicationController
  def index
    @languages = Language.all
  end
end
