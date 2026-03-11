module ApplicationHelper
  def user_avatar_path(user)
    if user.avatar_url.present?
      user.avatar_url
    else
      "https://ui-avatars.com/api/?name=#{CGI.escape(user.display_name)}&background=random"
    end
  end
end
