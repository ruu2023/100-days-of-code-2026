# frozen_string_literal: true

class Day083::DiaryEntry < ApplicationRecord
  self.table_name = "day083_diary_entries"

  MOODS = %w[calm happy tired excited reflective].freeze

  attribute :entry_on, default: -> { Date.current }
  attribute :mood, default: "reflective"

  validates :body, presence: true
  validates :entry_on, presence: true
  validates :mood, inclusion: { in: MOODS }

  scope :recent, -> { order(entry_on: :desc, created_at: :desc) }
end
