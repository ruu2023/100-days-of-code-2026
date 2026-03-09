class Day067::PostsController < ApplicationController
  skip_forgery_protection only: :create

  def index
    @posts = Day067::Post.all.order(created_at: :desc)
  end

  def show
    @post = Day067::Post.find(params[:id])
  end

  def new
    @post = Day067::Post.new
  end

  def create
    @post = Day067::Post.new(post_params)
    if @post.save
      redirect_to day067_post_path(@post), notice: "Post was successfully created."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    @post = Day067::Post.find(params[:id])
    @post.destroy
    redirect_to day067_posts_path, notice: "Post was successfully destroyed."
  end

  private

  def post_params
    params.fetch(:post, {}).permit(:title, :body)
  end
end
