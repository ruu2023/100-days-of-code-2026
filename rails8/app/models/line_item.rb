# frozen_string_literal: true

class LineItem < ApplicationRecord
  belongs_to :journal_entry
  belongs_to :account

  validates :account_id, presence: true
  validates :debit, numericality: { greater_than_or_equal_to: 0 }
  validates :credit, numericality: { greater_than_or_equal_to: 0 }
  validate :has_debit_or_credit

  # Ensure either debit or credit has a value, but not both
  def has_debit_or_credit
    return if debit.present? || credit.present?

    errors.add(:base, "Either debit or credit must have a value")
  end

  # Amount is positive for debits, negative for credits
  def amount
    debit - credit
  end

  # Check if this is a debit entry
  def debit?
    credit.to_f.zero? && debit.to_f.positive?
  end

  # Check if this is a credit entry
  def credit?
    debit.to_f.zero? && credit.to_f.positive?
  end
end
