# frozen_string_literal: true

class Day083::DiaryController < ApplicationController
  before_action :set_entry, only: [:destroy]

  def index
    @entry = Day083::DiaryEntry.new(entry_on: Date.current)
    @entries = Day083::DiaryEntry.recent
  end

  def create
    @entry = Day083::DiaryEntry.new(entry_params)

    if @entry.save
      redirect_to day083_path, notice: "日記を保存しました。"
    else
      @entries = Day083::DiaryEntry.recent
      render :index, status: :unprocessable_entity
    end
  end

  def destroy
    @entry.destroy
    redirect_to day083_path, notice: "日記を削除しました。"
  end

  private

  def set_entry
    @entry = Day083::DiaryEntry.find(params[:id])
  end

  def entry_params
    params.require(:day083_diary_entry).permit(:title, :body, :mood, :entry_on)
  end
end
