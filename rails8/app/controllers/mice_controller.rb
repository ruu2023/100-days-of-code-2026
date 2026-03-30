class MiceController < ApplicationController

  def index
    @mice = Mouse.order(created_at: :desc)
  end

  def new
    @mouse = Mouse.new
  end

  def create
    @mouse = Mouse.new(mouse_params)

    respond_to do |format|
      if @mouse.save
        flash.now[:notice] = "新しくネズミ（課題）が増えた！"
        format.html { redirect_to mice_path, notice: "作成したんご"}
        format.turbo_stream
      else
        format.html { render :new, status: :unprocessable_entity }
      end
    end
  end

  before_action :set_mouse, only: %i[ edit update ]

  def edit
  end

  def update
    respond_to do |format|
      if @mouse.update(mouse_params)
        flash.now[:notice] = "新しくネズミ（課題）が更新！"
        format.html { redirect_to mice_path, notice: "更新したんご"}
        format.turbo_stream
      else
        format.html { render :edit, status: :unprocessable_entity}
      end
    end
  end

  private

    def set_mouse
      @mouse = Mouse.find(params[:id])
    end

    def mouse_params
      params.require(:mouse).permit(:title, :content, :status, :deadline, :author, :worker)
    end

end
