class SlackNotifierService
  WEBHOOK_URL = ENV['SLACK_WEBHOOK_URL']

  def self.send(vulnerability)
    return if WEBHOOK_URL.blank?

    # Slack のメッセージ整形（Block Kit を使うときれいになります）
    payload = {
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*新しい脆弱性（CVE）の発表がありました*\n*<#{vulnerability.url}|#{vulnerability.title}>*"
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "```\n#{vulnerability.japanese_summary}\n```"
          }
        },
        {
          type: "context",
          elements: [
            { type: "mrkdwn", text: "Source: #{vulnerability.source} | Published: #{vulnerability.published_at&.strftime('%Y-%m-%d')}" }
          ]
        }
      ]
    }

    HTTParty.post(
      WEBHOOK_URL,
      body: payload.to_json,
      headers: { 'Content-Type' => 'application/json' }
    )
  end
end