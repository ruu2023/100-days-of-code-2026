Rails.application.routes.draw do
  get "items/index"
  resources :mice
  get "agency_agents", to: "agency_agents#index"
  root "agency_agents#index"
  ActiveAdmin.routes(self)
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  
  ##
  # require auth
  # OAuth routes
  match "auth/google_oauth2/callback", to: "auth#google_oauth2", via: %i[get post]
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
  get "editor", to: "editors#index"
  post "editor/run", to: "editors#run", as: :run_editor

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

  # Day085 - Subscription Management App
  scope "/day085", as: :day085 do
    get "/" => "day085/subscriptions#index"
    resources :subscriptions, controller: "day085/subscriptions"
  end

  # Day092 - Othello App
  scope "/day092", as: :day092 do
    get "/" => "day092/othello#index"
  end

  # Curl Prompt Maker
  get "/curl_prompt" => "curl_prompt#index"
  post "/curl_prompt" => "curl_prompt#create"
  post "/curl_prompt/send_request" => "curl_prompt#send_request"
  post "/curl_prompt/mock" => "curl_prompt#mock"


  resources :images, only: [:new, :create, :show]
  get "images/:id/download" => "images#download", as: :download_image
    
  get "day082", to: "images#new"

  # Inventory Management
  resources :inventories do
    collection do
      get :search
    end
  end

  scope "/master-demo", as: :master_demo do
    get "/" => "master_products#index"
    resources :products, controller: "master_products", only: %i[index new create edit update destroy] do
      member do
        get :row
        get :edit_row
        patch :quick_update
      end
    end
  end

  # Day090 - Geometry Shapes App
  scope "/geometrys", as: :geometrys do
    get "/" => "geometrys#index"
    get "/overlap" => "geometrys#overlap"
    get "/:shape" => "geometrys#show", as: :shape
  end

  # Day091 - Just 3 Things Today (今日やる3つだけ出す)
  scope "/just3", as: :day090 do
    get "/" => "day090/tasks#index", as: :tasks
    post "/" => "day090/tasks#create"
    patch "/:id" => "day090/tasks#update", as: :task
  end

  # CSV Tables - Convert CSV to Markdown and Excel table
  get "csv_tables", to: "csv_tables#index"
  resources :csv_imports, only: [:index, :show, :create] do
    post :run_import, on: :member
  end
  resources :statement_csv_imports, only: [:index, :show, :create] do
    post :run_import, on: :member
  end
  resources :statement_csv_import_datasets, only: [:show]

  # Day093 商品購入履歴
  resources :items, only: [:index, :new, :create, :edit, :update, :destroy] do
    member do
      patch :mark_purchased
    end
  end
end
