# generate_items_csv.rb
require "csv"
require "securerandom"
require "date"

OUTPUT_PATH = "items_sample_1000.csv"
COUNT = 100000

statuses = %w[todo doing done]
categories = ["学習", "買い物", "発信", "仕事", "趣味"]

titles = [
  "Rails記事ネタ",
  "Turbo確認",
  "Hotwire練習",
  "定期購入メモ",
  "YouTube要約候補",
  "DB設計見直し",
  "画面改善アイデア",
  "CSV取込テスト",
  "UI修正案",
  "学習ログ"
]

memos = [
  "後で見返す",
  "優先度高め",
  "今週中に対応",
  "時間があるときにやる",
  "実装メモを残す",
  "記事化できそう",
  "まずMVPで作る",
  "改善余地あり",
  "一旦たたき台",
  "試しに追加"
]

CSV.open(OUTPUT_PATH, "w", write_headers: true, headers: ["name", "memo", "status", "category", "created_on"]) do |csv|
  COUNT.times do |i|
    name = "#{titles.sample} #{i + 1}"
    memo = "#{memos.sample} / #{SecureRandom.hex(4)}"
    status = statuses.sample
    category = categories.sample
    created_on = Date.today - rand(0..180)

    csv << [name, memo, status, category, created_on]
  end
end

puts "#{OUTPUT_PATH} を出力しました（#{COUNT}件）"