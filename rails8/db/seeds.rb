# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Sample inventory data
[
  { code: "SKU-001", name: "ボールペン（黒）", quantity: 150, unit: "本", location: "A-1", notes: "定番商品" },
  { code: "SKU-002", name: "ボールペン（赤）", quantity: 80, unit: "本", location: "A-1", notes: "" },
  { code: "SKU-003", name: "ボールペン（青）", quantity: 60, unit: "本", location: "A-1", notes: "" },
  { code: "SKU-004", name: "ノート A4", quantity: 200, unit: "冊", location: "B-2", notes: "売れ筋商品" },
  { code: "SKU-005", name: "ノート B5", quantity: 45, unit: "冊", location: "B-2", notes: "在庫少なめ" },
  { code: "SKU-006", name: "クリップ（大）", quantity: 300, unit: "個", location: "C-1", notes: "" },
  { code: "SKU-007", name: "クリップ（小）", quantity: 500, unit: "個", location: "C-1", notes: "" },
  { code: "SKU-008", name: "ホチキス", quantity: 75, unit: "個", location: "C-2", notes: "" },
  { code: "SKU-009", name: "ホチキス針", quantity: 120, unit: "箱", location: "C-2", notes: "1箱に1000本入り" },
  { code: "SKU-010", name: "消しゴム", quantity: 8, unit: "個", location: "A-3", notes: "要発注" },
  { code: "SKU-011", name: "定規 30cm", quantity: 50, unit: "本", location: "D-1", notes: "" },
  { code: "SKU-012", name: "蛍光ペン（黄）", quantity: 90, unit: "本", location: "A-2", notes: "" },
  { code: "SKU-013", name: "蛍光ペン（緑）", quantity: 65, unit: "本", location: "A-2", notes: "" },
  { code: "SKU-014", name: "蛍光ペン（ピンク）", quantity: 40, unit: "本", location: "A-2", notes: "" },
  { code: "SKU-015", name: "のり（スティック）", quantity: 35, unit: "本", location: "D-3", notes: "" }
].each do |attrs|
  Inventory.find_or_create_by!(code: attrs[:code]) do |i|
    i.assign_attributes(attrs)
  end
end
