# frozen_string_literal: true

class GenerateVideoThumbnailJob < ApplicationJob
  queue_as :media

  retry_on StandardError, wait: :exponentially_longer, attempts: 3

  def perform(attachment_id)
    attachment = ActiveStorage::Attachment.find(attachment_id)

    return unless attachment.video?

    # Generate thumbnail using FFmpeg
    attachment.analyze if attachment.blob.analyzed?

    # Create thumbnail variant
    thumbnail = ImageProcessing::Video.thumbnail(attachment.blob.download, width: 400, height: 400)

    # Attach thumbnail as a preview
    attachment.previewable_attachable_thumbnail.attach(
      io: File.open(thumbnail),
      filename: "thumbnail_#{attachment.blob.filename.base}.jpg",
      content_type: "image/jpeg"
    )
  ensure
    thumbnail.close if thumbnail
  end
end
