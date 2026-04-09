class VulnerabilitiesController < ApplicationController
  def index
    @vulnerabilities = Vulnerability.all.order(published_at: :desc)
  end
end
