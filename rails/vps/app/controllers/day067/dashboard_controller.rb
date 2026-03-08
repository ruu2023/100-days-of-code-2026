class Day067::DashboardController < ApplicationController
  def index
    @post_count = Post.count
    @latest_post = Post.order(created_at: :desc).first
  end
end
