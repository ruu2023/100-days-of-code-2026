# frozen_string_literal: true

class Day085::SubscriptionsController < ApplicationController
  include Authentication
  before_action :require_authentication
  before_action :set_subscription, only: [:show, :edit, :update, :destroy]
  before_action :set_categories, only: [:index, :new, :edit, :create, :update]

  BILING_CYCLES = { monthly: "monthly", yearly: "yearly" }.freeze
  STATUSES = { active: "active", cancel_scheduled: "cancel_scheduled", cancelled: "cancelled" }.freeze

  def index
    @subscriptions = Current.user.day085_subscriptions
                                .by_name(params[:name])
                                .by_status(params[:status])
                                .by_category(params[:category_id])
                                .by_billing_cycle(params[:billing_cycle])
                                .order(created_at: :desc)

    @total_monthly = @subscriptions.sum(&:monthly_cost)
    @total_yearly = @subscriptions.sum(&:yearly_cost)
    @active_count = @subscriptions.active.count
    @cancel_scheduled_count = @subscriptions.cancel_scheduled.count
  end

  def show
    redirect_to day085_subscriptions_path unless @subscription
  end

  def new
    @subscription = Day085::Subscription.new(start_date: Date.current)
  end

  def create
    @subscription = Current.user.day085_subscriptions.new(subscription_params)

    if @subscription.save
      redirect_to day085_subscription_path(@subscription), notice: "Subscription created."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    redirect_to day085_subscriptions_path unless @subscription
  end

  def update
    if @subscription.update(subscription_params)
      redirect_to day085_subscription_path(@subscription), notice: "Subscription updated."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @subscription.destroy!
    redirect_to day085_subscriptions_path, notice: "Subscription deleted."
  end

  private

  def set_subscription
    @subscription = Current.user.day085_subscriptions.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    @subscription = nil
  end

  def set_categories
    @categories = Day085::Category.order(:name)
  end

  def subscription_params
    params.require(:day085_subscription).permit(
      :name, :price, :billing_cycle, :status, :category_id,
      :next_billing_date, :start_date, :end_date, :description, :website
    )
  end
end
