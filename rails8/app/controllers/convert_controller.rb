class ConvertController < ApplicationController
  def index
  end

  def create
    @text = params[:text]
    @language = params[:language] || "Japanese"

    if @text.blank?
      flash.now[:alert] = "Please enter some text."
      render :index and return
    end

    client = OpenAI::Client.new(
      access_token: ENV["OPENAI_API_KEY"],
      uri_base: "https://router.requesty.ai/v1"
    )

    begin
      response = client.chat(
        parameters: {
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are a professional translator. Translate the given text to #{@language}." },
            { role: "user", content: @text }
          ],
          temperature: 0.7,
        }
      )
      @translated_text = response.dig("choices", 0, "message", "content")
    rescue => e
      flash.now[:alert] = "Error calling OpenAI API: #{e.message}"
    end

    render :index
  end
end
