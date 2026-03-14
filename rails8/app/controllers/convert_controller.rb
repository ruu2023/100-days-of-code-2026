class ConvertController < ApplicationController
  include ActionController::Live

  def index
  end

  # def stream
  #   text = params[:text].to_s
  #   language = params[:language].presence || "Japanese"

  #   if text.blank?
  #     response.status = 422
  #     response.headers["Content-Type"] = "text/event-stream; charset=utf-8"
  #     response.stream.write("event: error\ndata: Please enter some text.\n\n")
  #     response.stream.close
  #     return
  #   end

  #   response.headers["Content-Type"] = "text/event-stream; charset=utf-8"
  #   response.headers["Cache-Control"] = "no-cache"
  #   response.headers["X-Accel-Buffering"] = "no"
  #   response.headers["Last-Modified"] = Time.now.httpdate

  #   begin
  #     ollama_client.chat(
  #       parameters: {
  #         model: ENV.fetch("OLLAMA_MODEL"),
  #         messages: [
  #           {
  #             role: "system",
  #             content: translator_prompt(language)
  #           },
  #           {
  #             role: "user",
  #             content: text
  #           }
  #         ],
  #         temperature: 0.2,
  #         stream: proc do |chunk, _bytes|
  #           content = chunk.dig("choices", 0, "delta", "content").to_s
  #           next if content.blank?

  #           content = content.force_encoding("UTF-8")
  #           content = content.encode("UTF-8", invalid: :replace, undef: :replace, replace: "")
  #           response.stream.write("data: #{content}\n\n")
  #         end
  #       }
  #     )

  #     response.stream.write("event: done\ndata: [DONE]\n\n")
  #   rescue => e
  #     Rails.logger.error("Ollama API error: #{e.class} #{e.message}")
  #     response.stream.write("event: error\ndata: #{e.message}\n\n")
  #   ensure
  #     response.stream.close
  #   end
  # end

  require "net/http"
  require "json"

  def stream
    uri = URI("http://172.18.0.1:11434/v1/chat/completions")

    http = Net::HTTP.new(uri.host, uri.port)
    request = Net::HTTP::Post.new(uri)
    request["Content-Type"] = "application/json"
    request["Authorization"] = "Bearer ollama"

    request.body = {
      model: "hf.co/LiquidAI/LFM2.5-1.2B-JP-GGUF:Q8_0",
      messages: [
        { role: "user", content: "hello" }
      ],
      temperature: 0.2
    }.to_json

    response = http.request(request)

    render plain: response.body
  end

  private

  def ollama_client
    OpenAI::Client.new(
      access_token: ENV["OLLAMA_API_KEY"] || "ollama",
      uri_base: Rails.configuration.x.ollama_base_url
    )
  end

  def translator_prompt(language)
    <<~PROMPT
      You are a professional news translator.

      Translate the user's text into #{language}.

      Rules:
      - Translate faithfully.
      - Do not add explanations.
      - Do not add abbreviations.
      - Do not infer unstated acronyms.
      - Preserve the original meaning.
      - Keep proper nouns, dates, numbers, and quotes accurate.
      - Use natural #{language}.
      - Return only the translation.
    PROMPT
  end
end