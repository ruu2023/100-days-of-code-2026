class ConvertController < ApplicationController
  include ActionController::Live

  def index
  end

  def stream
    text = params[:text].to_s
    language = params[:language].presence || "Japanese"

    response.headers["Content-Type"] = "text/event-stream; charset=utf-8"
    response.headers["Cache-Control"] = "no-cache"
    response.headers["X-Accel-Buffering"] = "no"

    if text.blank?
      response.status = 422
      sse_write("Please enter some text.", event: "error")
      return
    end

    begin
      sse_write("connected", event: "open")

      ollama_client.chat(
        parameters: {
          model: ENV.fetch("OLLAMA_MODEL"),
          messages: [
            {
              role: "system",
              content: translator_prompt(language)
            },
            {
              role: "user",
              content: text
            }
          ],
          temperature: 0.2,
          stream: proc do |chunk, _bytes|
            content = chunk.dig("choices", 0, "delta", "content").to_s
            next if content.blank?

            content = content.force_encoding("UTF-8")
            content = content.encode("UTF-8", invalid: :replace, undef: :replace, replace: "")

            sse_write(content)
          end
        }
      )

      sse_write("[DONE]", event: "done")
    rescue ActionController::Live::ClientDisconnected, IOError => e
      Rails.logger.info("SSE client disconnected: #{e.class} #{e.message}")
    rescue => e
      Rails.logger.error("Ollama API error: #{e.class} #{e.message}")
      sse_write(e.message, event: "error")
    ensure
      response.stream.close
    end
  end

  private

  def sse_write(data, event: nil)
    response.stream.write("event: #{event}\n") if event
    data.to_s.each_line do |line|
      response.stream.write("data: #{line.chomp}\n")
    end
    response.stream.write("\n")
  end

  def ollama_client
    OpenAI::Client.new(
      access_token: ENV["OLLAMA_API_KEY"] || "ollama",
      uri_base: Rails.configuration.x.ollama_base_url || "http://172.18.0.1:11434/v1"
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