# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

product_name_seeds = [
  { name: "ステンレスボトル", position: 10 },
  { name: "LEDデスクライト", position: 20 },
  { name: "折りたたみ収納箱", position: 30 },
  { name: "ゲルインクペン 5色", position: 40 },
  { name: "木製トレー", position: 50 }
]

category_seeds = [
  { name: "生活雑貨", position: 10 },
  { name: "家電", position: 20 },
  { name: "収納", position: 30 },
  { name: "文具", position: 40 }
]

supplier_seeds = [
  { name: "North Market", position: 10 },
  { name: "Kobe Devices", position: 20 },
  { name: "Tokyo Supply", position: 30 },
  { name: "Osaka Wholesale", position: 40 }
]

product_name_seeds.each do |attributes|
  MasterProductName.find_or_initialize_by(name: attributes[:name]).update!(attributes)
end

category_seeds.each do |attributes|
  MasterCategory.find_or_initialize_by(name: attributes[:name]).update!(attributes)
end

supplier_seeds.each do |attributes|
  MasterSupplier.find_or_initialize_by(name: attributes[:name]).update!(attributes)
end

master_products = [
  { sku: "PRD-0100", product_name_name: "ステンレスボトル", category_name: "生活雑貨", supplier_name: "North Market", stock: 44, unit: "本", price: 2980, status: "active", notes: "春販促の定番", position: 10 },
  { sku: "PRD-0110", product_name_name: "LEDデスクライト", category_name: "家電", supplier_name: "Kobe Devices", stock: 12, unit: "台", price: 6480, status: "active", notes: "在庫少なめ", position: 20 },
  { sku: "PRD-0120", product_name_name: "折りたたみ収納箱", category_name: "収納", supplier_name: "North Market", stock: 28, unit: "個", price: 1580, status: "draft", notes: "色展開確認中", position: 30 },
  { sku: "PRD-0130", product_name_name: "ゲルインクペン 5色", category_name: "文具", supplier_name: "Tokyo Supply", stock: 6, unit: "セット", price: 880, status: "active", notes: "低在庫アラート対象", position: 40 },
  { sku: "PRD-0140", product_name_name: "木製トレー", category_name: "生活雑貨", supplier_name: "Osaka Wholesale", stock: 0, unit: "枚", price: 1980, status: "archived", notes: "終売予定", position: 50 }
]

master_products.each do |attributes|
  record = MasterProduct.find_or_initialize_by(sku: attributes[:sku])
  record.assign_attributes(
    product_name: MasterProductName.find_by!(name: attributes[:product_name_name]),
    category_ref: MasterCategory.find_by!(name: attributes[:category_name]),
    supplier_ref: MasterSupplier.find_by!(name: attributes[:supplier_name]),
    stock: attributes[:stock],
    unit: attributes[:unit],
    price: attributes[:price],
    status: attributes[:status],
    notes: attributes[:notes],
    position: attributes[:position]
  )
  record.save!
end
