# frozen_string_literal: true

class AuthController < ApplicationController
  include Authentication
  layout "x"

  allow_unauthenticated_access

  def google_oauth2
    auth = request.env["omniauth.auth"]

    user = User.find_or_initialize_by(email_address: auth.info.email)
    user.assign_attributes(
      password: SecureRandom.hex(20)
    ) if user.new_record?

    # Store Google avatar URL if available
    user.avatar_url = auth.info.image if user.respond_to?(:avatar_url)

    user.save!

    # Create session using Rails 8 authentication system
    start_new_session_for(user)

    redirect_to posts_path, notice: "Signed in with Google!"
  rescue StandardError => e
    Rails.logger.error "OAuth Error: #{e.message}"
    redirect_to new_session_path, alert: "Failed to sign in with Google."
  end

  def failure
    redirect_to new_session_path, alert: "Authentication failed: #{params[:message]}"
  end
end
