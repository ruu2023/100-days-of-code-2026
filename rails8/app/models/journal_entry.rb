# frozen_string_literal: true

class JournalEntry < ApplicationRecord
  belongs_to :party, optional: true
  belongs_to :created_by, class_name: "User", optional: true
  belongs_to :reversal_of, class_name: "JournalEntry", optional: true

  has_many :line_items, dependent: :destroy
  has_many :accounts, through: :line_items

  accepts_nested_attributes_for :line_items, allow_destroy: true

  validates :entry_number, presence: true, uniqueness: true
  validates :entry_date, presence: true
  validate :debits_equal_credits
  validate :has_valid_line_items

  before_validation :generate_entry_number, on: :create

  scope :posted, -> { where(posted: true) }
  scope :unposted, -> { where(posted: false) }
  scope :by_date, ->(date) { where(entry_date: date) }

  # Generate unique entry number
  def generate_entry_number
    self.entry_number ||= "JE-#{Date.today.strftime('%Y%m%d')}-#{JournalEntry.count.next.to_s.rjust(4, '0')}"
  end

  # Total debits
  def total_debits
    line_items.sum(:debit)
  end

  # Total credits
  def total_credits
    line_items.sum(:credit)
  end

  # Check if entry is balanced
  def balanced?
    total_debits == total_credits
  end

  # Post the entry
  def post!
    update!(posted: true) if balanced?
  end

  # Reverse the entry
  def reverse!
    return unless posted?

    JournalEntry.transaction do
      reversed_entry = JournalEntry.create!(
        entry_date: Date.today,
        description: "Reversal of #{entry_number}",
        reversal_of: self,
        line_items: line_items.map do |li|
          {
            account_id: li.account_id,
            debit: li.credit,
            credit: li.debit,
            memo: li.memo
          }
        end
      )
      update!(reversed: true)
      reversed_entry.post!
    end
  end

  private

  def debits_equal_credits
    return if line_items.empty?

    unless balanced?
      errors.add(:base, "Debits (#{total_debits}) must equal Credits (#{total_credits})")
    end
  end

  def has_valid_line_items
    return if line_items.empty?

    valid_items = line_items.reject(&:marked_for_destruction?)
    return if valid_items.count >= 2

    # At least one must have amount > 0
    has_amount = valid_items.any? { |li| li.debit.to_f > 0 || li.credit.to_f > 0 }
    unless has_amount
      errors.add(:base, "少なくとも1つの取引を入力してください")
    end
  end
end
