# frozen_string_literal: true

ActiveAdmin.register MasterProduct do
  permit_params :product_name_id, :category_ref_id, :supplier_ref_id, :stock, :unit, :price, :status, :notes, :position

  config.sort_order = "position_asc"

  filter :sku
  filter :product_name, as: :select, collection: -> { MasterProductName.ordered.pluck(:name, :id) }
  filter :category_ref, as: :select, collection: -> { MasterCategory.ordered.pluck(:name, :id) }
  filter :supplier_ref, as: :select, collection: -> { MasterSupplier.ordered.pluck(:name, :id) }
  filter :status, as: :select, collection: MasterProduct::STATUSES

  index title: "Master Products" do
    selectable_column
    id_column
    column :position
    column :sku
    column("商品名", :product_name)
    column("カテゴリ", :category_ref)
    column("仕入先", :supplier_ref)
    column :stock
    column(:price) { |product| number_to_currency(product.price, unit: "¥", precision: 0) }
    column :status
    actions defaults: true do |product|
      item "Demo", edit_master_demo_product_path(product), class: "member_link"
    end
  end

  form do |f|
    f.inputs "Master Product" do
      f.input :position
      f.input :sku, input_html: { disabled: true }
      f.input :product_name, collection: MasterProductName.ordered
      f.input :category_ref, collection: MasterCategory.ordered
      f.input :supplier_ref, collection: MasterSupplier.ordered
      f.input :stock
      f.input :unit
      f.input :price
      f.input :status, as: :select, collection: MasterProduct::STATUSES
      f.input :notes
    end
    f.actions
  end
end
