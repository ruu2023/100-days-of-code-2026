require 'open3'

class GeminiSummarizerService
  def self.summarize(vulnerability)
    # プロンプトの組み立て
    # ヒアドキュメント(<<~PROMPT)
    prompt = <<~PROMPT
      あなたは優秀なセキュリティエンジニアです。
      入力された情報が「特定の具体的な脆弱性（CVE）に関するニュース」である場合のみ、以下の形式で出力してください。
      
      【要約】（日本語3行程度）
      【緊急度】（高・中・低）

      もし、今回のような「サイバー攻撃の傾向」や「一般的なセキュリティの啓蒙記事」など、
      特定のCVE番号に関連しない話題の場合は、何も書かずに「SKIP」とだけ出力してください。

      タイトル: #{vulnerability.title}
      内容: #{vulnerability.summary}
    PROMPT

    # Gemini CLI の実行
    stdout, stderr, status = Open3.capture3("gemini", stdin_data: prompt)

    
    if status.success?
      result = stdout.strip
      # SKIP と返ってきたら保存しない
      return nil if result == "SKIP"
    else
      # 失敗したらログにエラーを残す
      Rails.logger.error("Gemini CLI Error: #{stderr}")
      nil
    end

    result
  end

  # 未要約の記事を一括処理するメソッド
  def self.process_pending_summaries
    Vulnerability.where(japanese_summary: nil).find_each do |v|
      # 1. まず正規表現でチェック
      unless VulnerabilityChecker.is_cve?(v)
        v.update(japanese_summary: "NOT_CVE") # 重複処理防止用のフラグ
        next
      end

      # 2. Gemini で要約
      summary = summarize(v)
      
      if summary
        v.update(japanese_summary: summary)
        # ここで Slack 通知を呼ぶ（次のステップ）
      else
        # CVEではなかった、あるいはエラー
        v.update(japanese_summary: "SKIPPED")
      end
    end
  end
end