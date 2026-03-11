class User < ApplicationRecord
  has_secure_password
  has_many :sessions, dependent: :destroy
  has_many :posts, dependent: :destroy
  has_many :comments, dependent: :destroy
  has_one_attached :avatar

  normalizes :email_address, with: ->(e) { e.strip.downcase }

  attribute :avatar_url, :string

  def display_name
    email_address.split("@").first.titleize
  end

  def profile_image
    if avatar.attached?
      avatar
    elsif avatar_url.present?
      avatar_url
    else
      "https://ui-avatars.com/api/?name=#{CGI.escape(display_name)}&background=random"
    end
  end
end
