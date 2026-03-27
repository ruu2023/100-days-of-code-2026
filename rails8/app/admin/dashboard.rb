# frozen_string_literal: true
ActiveAdmin.register_page "Dashboard" do
  menu priority: 1, label: proc { I18n.t("active_admin.dashboard") }

  content title: proc { I18n.t("active_admin.dashboard") } do
    columns do
      column do
        panel "Master Management Demo" do
          para "一覧・検索・CRUD は ActiveAdmin、表の即時更新は Turbo Frames で補っています。"
          ul do
            li link_to("ActiveAdmin CRUD", admin_master_products_path)
            li link_to("Spreadsheet Demo", master_demo_products_path)
          end
        end
      end

      column do
        panel "Status" do
          para "登録件数: #{MasterProduct.count}件"
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
