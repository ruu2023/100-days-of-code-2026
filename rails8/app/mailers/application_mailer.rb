class ApplicationMailer < ActionMailer::Base
  default from: -> {
    from_email = ENV.fetch("MAILER_FROM_EMAIL", "no-reply@ruu-dev.com")
    from_name = ENV.fetch("MAILER_FROM_NAME", "Ruu Dev Booking")

    "#{from_name} <#{from_email}>"
  }
  layout "mailer"
end
