require 'open-uri'
require 'nokogiri'
require 'csv'
require 'ferrum'

class Day069::ImageViewerController < ApplicationController
  def index
    @url = params[:url] || ""
    @images = []
  end

  def scrape
    @url = params[:url]
    @images = []

    use_js_rendering = params[:js] == '1'

    begin
      if use_js_rendering
        @images = scrape_with_ferrum(@url)
      else
        @images = scrape_with_nokogiri(@url)
      end
    rescue StandardError => e
      flash[:error] = "エラーが発生しました: #{e.message}"
    end

    render :index
  end

  def scrape_with_ferrum(url)
    images = []

    browser = Ferrum::Browser.new(
      headless: true,
      timeout: 30,
      browser_options: {
        'no-sandbox': nil,
        'disable-dev-shm-usage': nil
      }
    )

    begin
      browser.go_to(url)
      # ページがロードされるまで待機（Reactなどのフレームワークがレンダリング完了するまで）
      sleep 5

      # HTMLを取得
      html = browser.body
      doc = Nokogiri::HTML(html)

      images = extract_images_from_doc(doc, url)
    ensure
      browser.quit
    end

    images
  end

  def scrape_with_nokogiri(url)
    html = URI.open(url, read_timeout: 10) { |io| io.read }
    doc = Nokogiri::HTML(html)

    extract_images_from_doc(doc, url)
  end

  def extract_images_from_doc(doc, base_url)
    images = []

    # imgタグからsrc属性を取得
    doc.css('img').each do |img|
      # src 属性
      src = img['src']
      unless src.blank?
        src = convert_to_absolute_url(base_url, src)
        images << src if valid_image_url?(src)
      end

      # data-src, data-lazy-src (React/遅延読み込み)
      %w[data-src data-lazy-src data-original srcset].each do |attr|
        src = img[attr]
        next if src.blank?
        src = convert_to_absolute_url(base_url, src)
        images << src if valid_image_url?(src)
      end
    end

    # srcset属性からも画像URLを取得
    doc.css('img[srcset]').each do |img|
      srcset = img['srcset']
      next if srcset.blank?

      srcset.split(',').each do |src_with_size|
        src = src_with_size.split.first.strip
        next if src.blank?

        src = convert_to_absolute_url(base_url, src)
        images << src if valid_image_url?(src)
      end
    end

    # style属性のbackground-imageからも取得
    doc.css('[style*="background-image"]').each do |element|
      style = element['style']
      if style =~ /url\(['"]?([^'")\s]+)['"]?\)/
        src = Regexp.last_match(1)
        src = convert_to_absolute_url(base_url, src)
        images << src if valid_image_url?(src)
      end
    end

    # picture > source タグ
    doc.css('picture source').each do |source|
      src = source['srcset'] || source['src']
      next if src.blank?

      src = convert_to_absolute_url(base_url, src)
      images << src if valid_image_url?(src)
    end

    images.uniq
  end

  def download_csv
    url = params[:url]
    use_js_rendering = params[:js] == '1'

    begin
      images = if use_js_rendering
                 scrape_with_ferrum(url)
               else
                 scrape_with_nokogiri(url)
               end
    rescue StandardError => e
      flash[:error] = "エラーが発生しました: #{e.message}"
      redirect_to day069_path
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
    CSV.generate do |csv|
      csv << ['No', 'Image URL']
      images.each_with_index do |image, index|
        csv << [index + 1, image]
      end
    end
  end
end
