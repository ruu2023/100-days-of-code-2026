# app/services/feed_parser_service.rb
require 'feedjira'
require 'httparty'

class FeedParserService
  SOURCES = {
    "The Hacker News" => { url: "https://feeds.feedburner.com/TheHackersNews", type: :rss },
    "Socket.dev"      => { url: "https://socket.dev/api/blog/feed.json", type: :json }
  }.freeze

  def self.fetch_and_save
    SOURCES.each do |name, config|
      response = HTTParty.get(config[:url])
      next unless response.success?

      if config[:type] == :json
        parse_json(name, response.body)
      else
        parse_rss(name, response.body)
      end
    end
  end

  private

  # RSS (The Hacker News など) の解析
  def self.parse_rss(name, body)
    feed = Feedjira.parse(body)
    feed.entries.each do |entry|
      save_vulnerability(
        title: entry.title,
        url: entry.url,
        summary: entry.summary || entry.content,
        source: name,
        published_at: entry.published
      )
    end
  end

  # JSON Feed (Socket.dev) の解析
  def self.parse_json(name, body)
    data = JSON.parse(body)
    # JSON Feed 形式では通常 "items" 配列に記事が入っています
    data["items"].each do |item|
      save_vulnerability(
        title: item["title"],
        url: item["url"],
        summary: item["summary"] || item["content_text"],
        source: name,
        published_at: item["date_published"]
      )
    end
  end

  def self.save_vulnerability(attrs)
    return if Vulnerability.exists?(url: attrs[:url])
    Vulnerability.create!(attrs)
  end
end