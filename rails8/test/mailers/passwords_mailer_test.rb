require "test_helper"

class PasswordsMailerTest < ActionMailer::TestCase
  test "reset" do
    user = users(:one)
    mail = PasswordsMailer.reset(user)

    assert_equal [ user.email_address ], mail.to
    assert_equal "Password reset instructions", mail.subject
    assert_includes mail.body.encoded, "reset your password"
  end
end
