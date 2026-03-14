# frozen_string_literal: true

class CommentsController < ApplicationController
  include Authentication
  layout "x"

  before_action :require_authentication

  def create
    post = Post.find(params[:post_id])
    @comment = post.comments.build(comment_params)
    @comment.user = Current.user

    if @comment.save
      respond_to do |format|
        format.turbo_stream
        format.html { redirect_to posts_path, notice: "Comment added!" }
      end
    else
      redirect_to posts_path, alert: "Failed to add comment"
    end
  end

  def destroy
    @comment = Comment.find(params[:id])

    if @comment.user == Current.user || Current.user.admin?
      @comment.destroy
      respond_to do |format|
        format.turbo_stream
        format.html { redirect_to posts_path, notice: "Comment deleted" }
      end
    else
      redirect_to posts_path, alert: "Not authorized"
    end
  end

  private

  def comment_params
    params.require(:comment).permit(:body)
  end
end
