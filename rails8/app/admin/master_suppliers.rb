# frozen_string_literal: true

ActiveAdmin.register MasterSupplier do
  permit_params :name, :position

  config.sort_order = "position_asc"

  filter :name

  index title: "仕入先マスタ" do
    selectable_column
    id_column
    column :position
    column :name
    column("利用商品数") { |record| record.master_products.count }
    actions
  end

  form do |f|
    f.inputs do
      f.input :position
      f.input :name
    end
    f.actions
  end
end
