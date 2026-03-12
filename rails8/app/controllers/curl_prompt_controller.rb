require 'shellwords'

class CurlPromptController < ApplicationController
  skip_before_action :verify_authenticity_token
  allow_unauthenticated_access

  def index
  end

  def create
    askurl = params[:askurl].to_s
    askmethod = params[:askmethod].presence || "GET"
    askcontent = params[:askcontent].presence
    askbody = params[:askbody]
    askheaders = params[:askheaders].to_s

    return render json: { curl: "URL is required" }, status: :unprocessable_entity if askurl.blank?

    lines = ["curl -X #{Shellwords.escape(askmethod)} #{Shellwords.escape(askurl)}"]

    if askcontent
      lines << "-H #{Shellwords.escape("Content-Type: #{askcontent}")}"
    end

    askheaders.each_line do |h|
      h = h.strip
      lines << "-H #{Shellwords.escape(h)}" if h.present?
    end

    if askbody.present? && askmethod != "GET"
      body_str = askbody.respond_to?(:to_unsafe_h) ? askbody.to_unsafe_h.to_json : askbody.to_s
      lines << "-d #{Shellwords.escape(body_str)}"
    end

    curl_cmd = lines.join(" \\\n  ")

    render json: { curl: curl_cmd }
  end

  def send_request
    require 'net/http'
    require 'uri'

    askurl = params[:askurl].to_s
    askmethod = params[:askmethod].presence || "GET"
    askcontent = params[:askcontent].presence
    askbody = params[:askbody]
    askheaders = params[:askheaders].to_s

    return render json: { error: "URL is required" }, status: :unprocessable_entity if askurl.blank?

    begin
      uri = URI.parse(askurl)
      
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = (uri.scheme == 'https')
      http.open_timeout = 5
      http.read_timeout = 10
      
      request_class = Net::HTTP.const_get(askmethod.capitalize) rescue Net::HTTP::Get
      request = request_class.new(uri.request_uri || "/")
      
      if askcontent.present?
        request["Content-Type"] = askcontent
      end
      
      askheaders.each_line do |h|
        h = h.strip
        next if h.blank?
        key, value = h.split(':', 2)
        request[key.strip] = value.strip if key && value
      end
      
      if askbody.present? && askmethod != "GET" && askmethod != "DELETE"
        request.body = askbody.respond_to?(:to_unsafe_h) ? askbody.to_unsafe_h.to_json : askbody.to_s
      end
      
      start_time = Time.now
      response = http.request(request)
      duration = ((Time.now - start_time) * 1000).to_i
      
      # Parse JSON response if possible for prettier formatting
      parsed_body = response.body
      begin
        parsed_body = JSON.parse(response.body) if response["Content-Type"]&.include?("application/json")
      rescue
      end
      
      render json: {
        status: response.code.to_i,
        status_message: response.message,
        body: parsed_body,
        raw_body: response.body,
        headers: response.to_hash,
        duration_ms: duration
      }
    rescue => e
      render json: { error: e.message }, status: :unprocessable_entity
    end
  end

  def mock
    trivia = <<~TEXT
      睡眠に関する興味深い雑学をいくつかご紹介します。

      1. **レム睡眠と金縛り**
         夢を見る「レム睡眠」の間、脳は活発に動いていますが、体が動いて怪我をしないよう、筋肉の動きを抑制するスイッチが入ります。このスイッチが解除される前に意識だけが戻ってしまう状態がいわゆる「金縛り」です。

      2. **記憶の整理と定着**
         睡眠中、脳は起きている間に得た情報を整理し、必要なものを長期記憶として保存します。特に「ノンレム睡眠（深い眠り）」の時に嫌な記憶を消去し、「レム睡眠」の時に技術や知識を定着させると言われています。

      3. **「羊を数える」の由来**
         英語で羊（Sheep）と眠り（Sleep）の発音が似ているから、という説が有名です。また、羊が次々と柵を越えていく単調なイメージを繰り返すことで、脳をリラックスさせる効果も期待されています。

      4. **睡眠不足は酔っ払いと同じ？**
         17時間連続で起きている（朝6時に起きて夜11時まで起きている）状態は、血中アルコール濃度0.05%（ビール大瓶1本程度）の状態と同程度の認知能力低下を招くという研究結果があります。

      5. **世界一長い不眠記録**
         1964年にアメリカの高校生ランディ・ガードナーが記録した「264時間12分（約11日間）」がギネス公認の最高記録です。現在は健康へのリスクが高すぎるため、不眠記録の挑戦は公式には受け付けられていません。
    TEXT

    render json: {
      status: 200,
      status_message: "OK",
      body: trivia,
      raw_body: trivia,
      headers: {
        "Content-Type" => ["application/json"],
        "X-Mocked" => ["true"]
      },
      duration_ms: 10
    }
  end
end
