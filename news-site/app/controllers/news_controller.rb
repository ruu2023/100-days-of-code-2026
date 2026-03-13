require 'net/http'
require 'json'
require 'time'

class NewsController < ApplicationController
  JSON_URL = "https://ruu2023.github.io/100-days-of-code-2026/api/data.json"

  layout false

  def index
    @news = fetch_news
  end

  private

  def fetch_news
    uri = URI.parse(JSON_URL)
    response = Net::HTTP.get_response(uri)

    if response.is_a?(Net::HTTPSuccess)
      JSON.parse(response.body, symbolize_names: true)
    else
      []
    end
  rescue StandardError => e
    Rails.logger.error("Failed to fetch news: #{e.message}")
    []
  end
end
