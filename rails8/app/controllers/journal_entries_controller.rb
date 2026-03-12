# frozen_string_literal: true

class JournalEntriesController < ApplicationController
  before_action :set_journal_entry, only: [:show, :edit, :update, :destroy, :post, :reverse]

  def index
    @journal_entries = JournalEntry.all
    @journal_entries = @journal_entries.by_date(params[:date]) if params[:date].present?
    @journal_entries = @journal_entries.order(entry_date: :desc, created_at: :desc)
  end

  def show; end

  def new
    @journal_entry = JournalEntry.new(entry_date: Date.today)
  end

  def edit
    # Ensure we have at least 2 line items for editing
    while @journal_entry.line_items.count < 2
      @journal_entry.line_items.build
    end
  end

  def create
    @journal_entry = JournalEntry.new(journal_entry_params)
    @journal_entry.created_by = current_user if defined?(current_user)

    if @journal_entry.save
      redirect_to [:accounting, @journal_entry], notice: "Journal entry was successfully created."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def update
    if @journal_entry.update(journal_entry_params)
      redirect_to [:accounting, @journal_entry], notice: "Journal entry was successfully updated."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @journal_entry.destroy
    redirect_to accounting_journal_entries_url, notice: "Journal entry was successfully deleted."
  end

  def post
    if @journal_entry.post!
      redirect_to [:accounting, @journal_entry], notice: "Journal entry was posted."
    else
      redirect_to [:accounting, @journal_entry], alert: "Cannot post unbalanced entry."
    end
  end

  def reverse
    @journal_entry.reverse!
    redirect_to [:accounting, @journal_entry], notice: "Journal entry was reversed."
  rescue StandardError => e
    redirect_to [:accounting, @journal_entry], alert: "Error reversing entry: #{e.message}"
  end

  private

  def set_journal_entry
    @journal_entry = JournalEntry.find(params[:id])
  end

  def journal_entry_params
    params.require(:journal_entry).permit(
      :entry_date,
      :description,
      :party_id,
      line_items_attributes: [:id, :account_id, :debit, :credit, :memo, :_destroy]
    )
  end
end
