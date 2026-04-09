# app/services/rss_parser_service.rb
require 'feedjira'
require 'httparty'

class RssParserService
  SOURCES = {
    "The Hacker News" => "https://feeds.feedburner.com/TheHackersNews",
    "Socket.dev"      => "https://socket.dev/blog/rss.xml"
  }.freeze

  def self.fetch_and_save
    SOURCES.each do |name, url|
      xml = HTTParty.get(url).body
      feed = Feedjira.parse(xml)

      feed.entries.each do |entry|
        # すでに保存済みの記事はスキップ
        next if Vulnerability.exists?(url: entry.url)

        Vulnerability.create!(
          title: entry.title,
          url: entry.url,
          summary: entry.summary || entry.content,
          source: name,
          published_at: entry.published
        )
      end
    end
  end
end