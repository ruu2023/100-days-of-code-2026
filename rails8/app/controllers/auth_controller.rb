# frozen_string_literal: true

class AuthController < ApplicationController
  include Authentication
  layout "x"

  allow_unauthenticated_access

  def google_oauth2
    auth = request.env["omniauth.auth"]
    raise "Missing OmniAuth auth payload" if auth.blank?

    user = User.find_or_initialize_by(provider: "google_oauth2", uid: auth.uid)
    if user.new_record?
      user.assign_attributes(
        email_address: auth.info.email,
        password: SecureRandom.hex(20),
        name: auth.info.name,
        image_url: auth.info.image
      )
      user.save!
    else
      user.update!(
        name: auth.info.name,
        image_url: auth.info.image
      )
    end

    start_new_session_for(user)

    redirect_to day085_path, notice: "Signed in with Google!"
  rescue StandardError => e
    Rails.logger.error "OAuth Error: #{e.message}"
    redirect_to new_session_path, alert: "Failed to sign in with Google."
  end

  def failure
    redirect_to new_session_path, alert: "Authentication failed: #{params[:message]}"
  end
end
