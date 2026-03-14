# frozen_string_literal: true

class PostsController < ApplicationController
  include Authentication
  layout "x"

  before_action :require_authentication, except: [:index, :show, :search]
  before_action :set_post, only: [:show, :destroy]

  def index
    @posts = Post.timeline
    @post = Post.new
  end

  def timeline
    @posts = Post.timeline
    render :index
  end

  def search
    @query = params[:q]
    if @query.present?
      @posts = Post.where("body LIKE ?", "%#{@query}%").order(created_at: :desc).includes(:user, media_attachments: :blob)
    else
      @posts = Post.timeline
    end
    @post = Post.new
    render :index
  end

  def show
    @post
  end

  def create
    @post = Current.user.posts.build(post_params)

    if @post.save
      respond_to do |format|
        format.turbo_stream { render turbo_stream: turbo_stream.prepend("posts", partial: "posts/post", object: @post) }
        format.html { redirect_to posts_path, notice: "Post created!" }
      end
    else
      @posts = Post.timeline
      render :index, status: :unprocessable_entity
    end
  end

  def destroy
    if @post.user == Current.user || Current.user.admin?
      @post.destroy
      respond_to do |format|
        format.turbo_stream { render turbo_stream: turbo_stream.remove(@post) }
        format.html { redirect_to posts_path, notice: "Post deleted" }
      end
    else
      redirect_to posts_path, alert: "Not authorized"
    end
  end

  private

  def set_post
    @post = Post.find(params[:id])
  end

  def post_params
    params.require(:post).permit(:body, media: [])
  end
end
