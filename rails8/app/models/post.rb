class Post < ApplicationRecord
  belongs_to :user
  has_many :comments, dependent: :destroy

  has_many_attached :media, dependent: :purge_later do |attachable|
    attachable.variant :thumb, resize_to_limit: [200, 200]
    attachable.variant :medium, resize_to_limit: [600, 600]
  end

  validates :body, presence: { message: "or media is required" }, unless: -> { media.attached? }
  validates :body, length: { maximum: 280 }, allow_blank: true
  validates :media, presence: { message: "or text is required" }, unless: -> { body.present? }

  normalizes :body, with: ->(b) { b.strip if b.present? }

  scope :timeline, -> { order(created_at: :desc).includes(:user, media_attachments: :blob) }

  after_create_commit :broadcast_to_turbo_stream
  after_update_commit :broadcast_replace_to_turbo_stream
  after_destroy_commit :broadcast_remove_from_turbo_stream
  after_create_commit :process_video_thumbnails

  private

  def broadcast_to_turbo_stream
    broadcast_prepend_to "posts", partial: "posts/post", object: self
  end

  def broadcast_replace_to_turbo_stream
    broadcast_replace_to "posts", partial: "posts/post", object: self
  end

  def broadcast_remove_from_turbo_stream
    broadcast_remove_to "posts"
  end

  def process_video_thumbnails
    media.blobs.each do |blob|
      next unless blob.video?

      GenerateVideoThumbnailJob.perform_later(blob.id)
    end
  end
end
