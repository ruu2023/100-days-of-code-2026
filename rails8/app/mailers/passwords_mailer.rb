class PasswordsMailer < ApplicationMailer
  def reset(user)
    @user = user

    mail to: @user.email_address, subject: "Password reset instructions"
  end
end
