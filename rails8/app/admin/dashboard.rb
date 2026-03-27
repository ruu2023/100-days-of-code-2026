# frozen_string_literal: true
ActiveAdmin.register_page "Dashboard" do
  menu priority: 1, label: proc { I18n.t("active_admin.dashboard") }

  content title: proc { I18n.t("active_admin.dashboard") } do
    columns do
      column do
        panel "Master Management Demo" do
          para "SKU は自動採番、商品名・カテゴリ・仕入先は別マスタ管理です。表の即時更新だけ Turbo Frames で補っています。"
          ul do
            li link_to("ActiveAdmin CRUD", admin_master_products_path)
            li link_to("Spreadsheet Demo", master_demo_products_path)
            li link_to("商品名マスタ", admin_master_product_names_path)
            li link_to("カテゴリマスタ", admin_master_categories_path)
            li link_to("仕入先マスタ", admin_master_suppliers_path)
          end
        end
      end

      column do
        panel "Status" do
          para "登録件数: #{MasterProduct.count}件"
          para "商品名マスタ: #{MasterProductName.count}件"
          para "カテゴリマスタ: #{MasterCategory.count}件"
          para "仕入先マスタ: #{MasterSupplier.count}件"
          para "有効: #{MasterProduct.where(status: 'active').count}件"
          para "アーカイブ: #{MasterProduct.where(status: 'archived').count}件"
        end
      end
    end

    if MasterProduct.none?
      div class: "blank_slate_container", id: "dashboard_default_message" do
        span class: "blank_slate" do
          span "まだデモデータがありません"
          small "bin/rails db:seed でサンプルを投入できます。"
        end
      end
    end
  end # content
end
