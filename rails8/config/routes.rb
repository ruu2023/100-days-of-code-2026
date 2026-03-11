Rails.application.routes.draw do
  resource :session
  resources :passwords, param: :token

  # OAuth routes
  get "auth/google_oauth2", to: "auth#google_oauth2"
  get "auth/google_oauth2/callback", to: "auth#google_oauth2"
  get "auth/failure", to: "auth#failure"

  # X (Twitter) Clone - Post routes
  resources :posts do
    resources :comments, only: [:create, :destroy]
  end

  # Timeline route
  get "/timeline" => "posts#timeline", as: :timeline

  # Search route
  get "/search" => "posts#search", as: :search

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Day006 - Memo App
  scope "/day006", as: :day006 do
    get "/" => "day006/memos#index"
    resources :memos, controller: "day006/memos"
  end

  # Day067 - Blog App
  scope "/day067", as: :day067 do
    get "/" => "day067/dashboard#index"
    resources :posts, controller: "day067/posts"
  end

  # Day069 - Image Viewer
  scope "/day069", as: :day069 do
    get "/" => "day069/image_viewer#index"
    post "/scrape" => "day069/image_viewer#scrape"
    get "/download_csv" => "day069/image_viewer#download_csv"
  end

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  get "/" => "rails/health#show", as: :rails_health_check
end
