Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Day006 - Memo App
  get "/day006", to: "day006/memos#index"
  resources :day006_memos, controller: "day006/memos"

  # Day067 - Blog App
  get "/day067", to: "day067/dashboard#index"
  resources :day067_posts, controller: "day067/posts"

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  get "/", to: proc { [200, { "Content-Type" => "text/plain" }, ["Rails is running"]] }
end
