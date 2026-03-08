# Demo Blog Seeds
Post.find_or_create_by!(title: "Welcome to Demo Blog") do |post|
  post.body = "This is a demo blog created for day067. Welcome!"
end

Post.find_or_create_by!(title: "Second Post") do |post|
  post.body = "This is the second post in our demo blog. Rails makes it easy to create blogs!"
end

Post.find_or_create_by!(title: "About Rails") do |post|
  post.body = "Ruby on Rails is a full-stack web framework optimized for programmer happiness and sustainable productivity."
end
