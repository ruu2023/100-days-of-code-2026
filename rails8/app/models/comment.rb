class Comment < ApplicationRecord
  belongs_to :user
  belongs_to :post

  validates :body, presence: true

  normalizes :body, with: ->(b) { b.strip }
end
