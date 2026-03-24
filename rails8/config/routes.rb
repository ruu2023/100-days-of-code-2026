Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  
  ##
  # require auth
  # OAuth routes
  get "auth/google_oauth2", to: "auth#google_oauth2"
  get "auth/google_oauth2/callback", to: "auth#google_oauth2"
  get "auth/failure", to: "auth#failure"

  # X (Twitter) Clone - Post routes
  resources :posts do
    resources :comments, only: [ :create, :destroy ]
  end

  # Timeline route
  get "/timeline" => "posts#timeline", as: :timeline

  # Search route
  get "/search" => "posts#search", as: :search

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html
  # require auth end


  # Defines the root path route ("/")
  get "news", to: "news#index"
  get "convert", to: "convert#index"
  get "convert/stream",  to: "convert#stream"

  # Bookkeeping routes
  scope "/accounting", as: :accounting do
    root to: "journal_entries#index"
    resources :journal_entries do
      member do
        post :post
        post :reverse
      end
    end

    resources :parties do
      collection do
        get :search
        post :quick_create
      end
    end
    get "parties/quick_new", to: "parties#quick_new"
  end

  # Parties also available outside accounting scope for backward compatibility
  resources :parties do
    collection do
      get :search
      post :quick_create
    end
  end
  get "parties/quick_new", to: "parties#quick_new"

  resource :session
  resources :passwords, param: :token

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

  # Day081 - Roulette App
  scope "/day081", as: :day081 do
    get "/" => "day081/roulette#index"
  end

  # Day083 - PWA Diary App
  scope "/day083", as: :day083 do
    get "/" => "day083/diary#index"
    post "/" => "day083/diary#create"
    delete "/:id" => "day083/diary#destroy", as: :entry
  end

# Curl Prompt Maker
get "/curl_prompt" => "curl_prompt#index"
post "/curl_prompt" => "curl_prompt#create"
post "/curl_prompt/send_request" => "curl_prompt#send_request"
post "/curl_prompt/mock" => "curl_prompt#mock"


resources :images, only: [:new, :create, :show]
get "images/:id/download" => "images#download", as: :download_image
  
get "day082", to: "images#new"

root "images#new"
# Inventory Management
resources :inventories do
  collection do
    get :search
  end
end
end
