class Day006::MemosController < ApplicationController
  before_action :set_memo, only: %i[ show edit update destroy ]

  def index
    @memos = Day006::Memo.order(created_at: :desc)
  end

  def show
  end

  def new
    @memo = Day006::Memo.new
  end

  def edit
  end

  def create
    @memo = Day006::Memo.new(memo_params)

    respond_to do |format|
      if @memo.save
        format.turbo_stream
        format.html { redirect_to [:day006, @memo], notice: "Memo was successfully created." }
      else
        format.html { render :new, status: :unprocessable_entity }
      end
    end
  end

  def update
    respond_to do |format|
      if @memo.update(memo_params)
        format.turbo_stream
        format.html { redirect_to [:day006, @memo], notice: "Memo was successfully updated.", status: :see_other }
      else
        format.html { render :edit, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @memo.destroy!

    respond_to do |format|
      format.turbo_stream
      format.html { redirect_to day006_memos_path, notice: "Memo was successfully destroyed.", status: :see_other }
    end
  end

  private
    def set_memo
      @memo = Day006::Memo.find(params[:id])
    end

    def memo_params
      params.expect(memo: [ :title, :body ])
    end
end
