class Day067::DashboardController < ApplicationController
  def index
    @post_count = Day067::Post.count
    @latest_post = Day067::Post.order(created_at: :desc).first
  end
end
