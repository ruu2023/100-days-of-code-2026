require "net/http"
require "json"

class ResendDeliveryMethod
  RESEND_URI = URI("https://api.resend.com/emails")

  def initialize(settings = {})
    @api_key = settings.fetch(:api_key)
    @from = settings.fetch(:from)
    @reply_to = settings[:reply_to]
  end

  def deliver!(mail)
    response = Net::HTTP.start(RESEND_URI.host, RESEND_URI.port, use_ssl: true) do |http|
      request = Net::HTTP::Post.new(RESEND_URI)
      request["Authorization"] = "Bearer #{@api_key}"
      request["Content-Type"] = "application/json"
      request.body = payload_for(mail).to_json
      http.request(request)
    end

    return if response.is_a?(Net::HTTPSuccess)

    raise "Resend delivery failed: #{response.code} #{response.body}"
  end

  private
    def payload_for(mail)
      payload = {
        from: @from,
        to: addresses_for(mail.to),
        cc: addresses_for(mail.cc),
        bcc: addresses_for(mail.bcc),
        reply_to: @reply_to.presence,
        subject: mail.subject,
        html: html_body_for(mail),
        text: text_body_for(mail)
      }.compact

      payload[:headers] = mail.header.fields.each_with_object({}) do |field, headers|
        next if %w[to from subject cc bcc reply-to mime-version content-type content-transfer-encoding].include?(field.name.downcase)

        headers[field.name] = field.value.to_s
      end.presence

      payload.compact
    end

    def addresses_for(value)
      Array(value).presence
    end

    def html_body_for(mail)
      body_for(mail, "text/html")
    end

    def text_body_for(mail)
      body_for(mail, "text/plain") || mail.body&.decoded
    end

    def body_for(mail, mime_type)
      return unless mail.multipart?

      part = mail.parts.find { |candidate| candidate.mime_type == mime_type }
      part&.body&.decoded
    end
end
