module Day090
  class Task < ApplicationRecord
    self.table_name = "day090_tasks"

    validates :content, presence: true
    validates :scheduled_on, presence: true

    before_validation :set_scheduled_on, on: :create

    scope :incomplete, -> { where(completed_at: nil) }
    scope :today_focus, -> { incomplete.order(:scheduled_on, :created_at).limit(3) }

    def youtube_id
      return nil unless content.present?
      
      # Match youtube.com/watch?v=... or youtu.be/...
      if content =~ /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
        $1
      else
        nil
      end
    end

    def youtube?
      youtube_id.present?
    end

    private

    def set_scheduled_on
      return if scheduled_on.present?
      
      # Find the earliest date (>= today) that has fewer than 3 tasks
      date = Date.current
      loop do
        if self.class.where(scheduled_on: date).count < 3
          self.scheduled_on = date
          break
        end
        date += 1.day
      end
    end
  end
end
