if ENV["RESEND_API_KEY"].present?
  ActionMailer::Base.add_delivery_method(
    :resend_api,
    ResendDeliveryMethod,
    api_key: ENV["RESEND_API_KEY"],
    from: "#{ENV.fetch('MAILER_FROM_NAME', 'Ruu Dev Booking')} <#{ENV.fetch('MAILER_FROM_EMAIL', 'no-reply@ruu-dev.com')}>",
    reply_to: ENV["MAILER_REPLY_TO"]
  )
end
