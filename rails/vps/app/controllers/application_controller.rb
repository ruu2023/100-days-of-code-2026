class ApplicationController < ActionController::Base
  allow_browser versions: :modern

  before_action :log_request_debug

  stale_when_importmap_changes

  private

  def log_request_debug
    Rails.logger.info "=== REQUEST DEBUG START ==="
    Rails.logger.info "method=#{request.request_method}"
    Rails.logger.info "path=#{request.fullpath}"
    Rails.logger.info "scheme=#{request.scheme}"
    Rails.logger.info "ssl?=#{request.ssl?}"
    Rails.logger.info "base_url=#{request.base_url}"
    Rails.logger.info "host=#{request.host}"
    Rails.logger.info "origin=#{request.headers['Origin']}"
    Rails.logger.info "x_forwarded_proto=#{request.headers['X-Forwarded-Proto']}"
    Rails.logger.info "x_forwarded_host=#{request.headers['X-Forwarded-Host']}"
    Rails.logger.info "x_forwarded_for=#{request.headers['X-Forwarded-For']}"
    Rails.logger.info "=== REQUEST DEBUG END ==="
  end
end