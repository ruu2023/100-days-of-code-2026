class TestWebpushController < ApplicationController
  include Authentication
  allow_unauthenticated_access only: [:show] # Allow viewing page, but subscribe/send need auth

  def show
    @vapid_public_key = Rails.application.credentials.webpush[:public_key]
  end

  def subscribe
    subscription = current_user.webpush_subscriptions.find_or_initialize_by(endpoint: params[:endpoint])
    subscription.p256dh_key = params[:p256dh]
    subscription.auth_key = params[:auth]
    
    if subscription.save
      render json: { message: "Successfully subscribed" }, status: :ok
    else
      render json: { errors: subscription.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def send_test
    subscription = current_user.webpush_subscriptions.last
    
    if subscription.nil?
      return render json: { error: "No subscription found" }, status: :not_found
    end

    begin
      message = {
        title: "Test WebPush",
        options: {
          body: "This is a test notification from Rails!",
          icon: "/icon.png",
          data: { path: "/test_webpush" }
        }
      }.to_json

      Webpush.payload_send(
        message: message,
        endpoint: subscription.endpoint,
        p256dh: subscription.p256dh_key,
        auth: subscription.auth_key,
        vapid: {
          public_key: Rails.application.credentials.webpush[:public_key],
          private_key: Rails.application.credentials.webpush[:private_key]
        }
      )
      render json: { message: "Test notification sent!" }, status: :ok
    rescue Webpush::Error => e
      render json: { error: e.message }, status: :internal_server_error
    end
  end
end
