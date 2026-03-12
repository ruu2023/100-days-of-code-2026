# frozen_string_literal: true

class Account < ApplicationRecord
  enum :account_type, {
    asset: 0,
    liability: 1,
    equity: 2,
    revenue: 3,
    expense: 4
  }, prefix: true

  belongs_to :parent, class_name: "Account", optional: true
  has_many :children, class_name: "Account", foreign_key: :parent_id, dependent: :nullify

  has_many :line_items, dependent: :destroy
  has_many :journal_entries, through: :line_items

  validates :name, presence: true
  validates :code, presence: true, uniqueness: true
  validates :account_type, presence: true

  scope :active, -> { where(active: true) }
  scope :by_type, ->(type) { where(account_type: type) }

  # Account type groups for reporting
  def self.asset_liability_types
    %w[asset liability]
  end

  def self.equity_revenue_expense_types
    %w[equity revenue expense]
  end

  # Calculate balance for this account
  def balance
    line_items.sum(:debit) - line_items.sum(:credit)
  end

  # Debit increases asset and expense, credit increases liability, equity, revenue
  def debit_is_increase?
    account_type == "asset" || account_type == "expense"
  end
end
