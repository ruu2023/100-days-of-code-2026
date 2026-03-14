class ConvertController < ApplicationController
  include ActionController::Live

  def index
  end

  def create
    @text = params[:text]
    @language = params[:language].presence || "Japanese"

    if @text.blank?
      flash.now[:alert] = "Please enter some text."
      render :index and return
    end

    client = OpenAI::Client.new(
      access_token: ENV["OLLAMA_API_KEY"] || "ollama",
      uri_base: ENV.fetch("OLLAMA_BASE_URL")
    )

    begin
      response_data = client.chat(
        parameters: {
          model: ENV.fetch("OLLAMA_MODEL"),
          messages: [
            {
              role: "system",
              content: <<~PROMPT
                You are a professional news translator.

                Translate the user's text into #{@language}.

                Rules:
                - Translate faithfully.
                - Do not add explanations.
                - Do not add abbreviations.
                - Do not infer unstated acronyms.
                - Preserve the original meaning.
                - Keep proper nouns, dates, numbers, and quotes accurate.
                - Output natural #{@language}.
                - Return only the translation.
              PROMPT
            },
            {
              role: "user",
              content: @text
            }
          ],
          temperature: 0.2
        }
      )

      @translated_text = response_data.dig("choices", 0, "message", "content")
    rescue => e
      Rails.logger.error("Ollama API error: #{e.class} #{e.message}")
      flash.now[:alert] = "Error calling Ollama API: #{e.message}"
    end

    render :index
  end

  def stream
    text = params[:text].to_s
    language = params[:language].presence || "Japanese"

    response.headers["Content-Type"] = "text/event-stream; charset=utf-8"
    response.headers["Cache-Control"] = "no-cache"
    response.headers["X-Accel-Buffering"] = "no"
    response.headers["Last-Modified"] = Time.now.httpdate

    client = OpenAI::Client.new(
      access_token: ENV["OLLAMA_API_KEY"] || "ollama",
      uri_base: ENV.fetch("OLLAMA_BASE_URL")
    )

    begin
      client.chat(
        parameters: {
          model: ENV.fetch("OLLAMA_MODEL"),
          messages: [
            {
              role: "system",
              content: <<~PROMPT
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

            response.stream.write("data: #{content}\n\n")
          end
        }
      )

      response.stream.write("event: done\ndata: [DONE]\n\n")
    rescue => e
      Rails.logger.error("Ollama API error: #{e.class} #{e.message}")
      response.stream.write("event: error\ndata: #{e.message}\n\n")
    ensure
      response.stream.close
    end
  end
end