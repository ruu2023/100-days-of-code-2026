# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

master_products = [
  { sku: "PRD-100", name: "ステンレスボトル", category: "生活雑貨", supplier: "North Market", stock: 44, unit: "本", price: 2980, status: "active", notes: "春販促の定番", position: 10 },
  { sku: "PRD-110", name: "LEDデスクライト", category: "家電", supplier: "Kobe Devices", stock: 12, unit: "台", price: 6480, status: "active", notes: "在庫少なめ", position: 20 },
  { sku: "PRD-120", name: "折りたたみ収納箱", category: "収納", supplier: "North Market", stock: 28, unit: "個", price: 1580, status: "draft", notes: "色展開確認中", position: 30 },
  { sku: "PRD-130", name: "ゲルインクペン 5色", category: "文具", supplier: "Tokyo Supply", stock: 6, unit: "セット", price: 880, status: "active", notes: "低在庫アラート対象", position: 40 },
  { sku: "PRD-140", name: "木製トレー", category: "生活雑貨", supplier: "Osaka Wholesale", stock: 0, unit: "枚", price: 1980, status: "archived", notes: "終売予定", position: 50 }
]

master_products.each do |attributes|
  record = MasterProduct.find_or_initialize_by(sku: attributes[:sku])
  record.update!(attributes)
end
