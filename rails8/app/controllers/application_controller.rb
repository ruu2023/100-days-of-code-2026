class ApplicationController < ActionController::Base
  include Authentication
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  # Changes to the importmap will invalidate the etag for HTML responses
  stale_when_importmap_changes
end

# Allow public access to specific controllers for development/testing
class JournalEntriesController < ApplicationController
  allow_unauthenticated_access only: [:index, :new, :create, :show]
end

class PartiesController < ApplicationController
  allow_unauthenticated_access only: [:search, :quick_new, :quick_create]
end
