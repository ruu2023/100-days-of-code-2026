require 'open-uri'
require 'nokogiri'

class Day069::ImageViewerController < ApplicationController
  def index
    @images = []
    @url = ""
  end

  def scrape
    @url = params[:url]
    @images = []

    begin
      html = URI.open(@url, read_timeout: 10) { |io| io.read }
      doc = Nokogiri::HTML(html)

      # imgタグからsrc属性を取得
      doc.css('img').each do |img|
        src = img['src']
        next if src.blank?

        # 相対URLの場合は絶対URLに変換
        src = convert_to_absolute_url(@url, src)

        # 無効なURLを除外
        next unless valid_image_url?(src)

        @images << src
      end

      # srcset属性からも画像URLを取得（重複を除外）
      doc.css('img[srcset]').each do |img|
        srcset = img['srcset']
        next if srcset.blank?

        srcset.split(',').each do |src_with_size|
          src = src_with_size.split.first.strip
          next if src.blank?

          src = convert_to_absolute_url(@url, src)
          next unless valid_image_url?(src)

          @images << src unless @images.include?(src)
        end
      end

      # style属性のbackground-imageからも取得
      doc.css('[style*="background-image"]').each do |element|
        style = element['style']
        if style =~ /url\(['"]?([^'")\s]+)['"]?\)/
          src = Regexp.last_match(1)
          src = convert_to_absolute_url(@url, src)
          next unless valid_image_url?(src)

          @images << src unless @images.include?(src)
        end
      end

      @images.uniq!

    rescue OpenURI::HTTPError => e
      flash[:error] = "URLにアクセスできませんでした: #{e.message}"
    rescue StandardError => e
      flash[:error] = "エラーが発生しました: #{e.message}"
    end

    render :index
  end

  def download_csv
    url = params[:url]
    images = []

    begin
      html = URI.open(url, read_timeout: 10) { |io| io.read }
      doc = Nokogiri::HTML(html)

      doc.css('img').each do |img|
        src = img['src']
        next if src.blank?

        src = convert_to_absolute_url(url, src)
        next unless valid_image_url?(src)

        images << src
      end

      doc.css('img[srcset]').each do |img|
        srcset = img['srcset']
        next if srcset.blank?

        srcset.split(',').each do |src_with_size|
          src = src_with_size.split.first.strip
          next if src.blank?

          src = convert_to_absolute_url(url, src)
          next unless valid_image_url?(src)

          images << src unless images.include?(src)
        end
      end

      images.uniq!

    rescue StandardError => e
      flash[:error] = "エラーが発生しました: #{e.message}"
      redirect_to day069_image_viewer_index_path
      return
    end

    csv_data = generate_csv(images)

    send_data csv_data, filename: "images_#{Date.today}.csv", type: 'text/csv'
  end

  private

  def convert_to_absolute_url(base_url, relative_url)
    return relative_url if relative_url.start_with?('http://', 'https://', 'data:')

    uri = URI.parse(base_url)
    if relative_url.start_with?('//')
      "#{uri.scheme}:#{relative_url}"
    else
      "#{uri.scheme}://#{uri.host}#{relative_url.start_with?('/') ? '' : '/'}#{relative_url}"
    end
  end

  def valid_image_url?(url)
    return false if url.blank?
    return false if url.start_with?('data:')
    return true if url.start_with?('http://', 'https://')

    false
  end

  def generate_csv(images)
    require 'csv'

    CSV.generate do |csv|
      csv << ['No', 'Image URL']
      images.each_with_index do |image, index|
        csv << [index + 1, image]
      end
    end
  end
end
