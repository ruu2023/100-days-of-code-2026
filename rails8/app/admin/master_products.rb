# frozen_string_literal: true

ActiveAdmin.register MasterProduct do
  permit_params :sku, :name, :category, :supplier, :stock, :unit, :price, :status, :notes, :position

  config.sort_order = "position_asc"

  filter :sku
  filter :name
  filter :category
  filter :supplier
  filter :status, as: :select, collection: MasterProduct::STATUSES

  index title: "Master Products" do
    selectable_column
    id_column
    column :position
    column :sku
    column :name
    column :category
    column :supplier
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
      f.input :sku
      f.input :name
      f.input :category
      f.input :supplier
      f.input :stock
      f.input :unit
      f.input :price
      f.input :status, as: :select, collection: MasterProduct::STATUSES
      f.input :notes
    end
    f.actions
  end
end
