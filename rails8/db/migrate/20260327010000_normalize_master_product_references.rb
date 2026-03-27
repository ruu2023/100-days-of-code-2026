class NormalizeMasterProductReferences < ActiveRecord::Migration[8.1]
  class MigrationMasterProduct < ApplicationRecord
    self.table_name = "master_products"
  end

  class MigrationMasterProductName < ApplicationRecord
    self.table_name = "master_product_names"
  end

  class MigrationMasterCategory < ApplicationRecord
    self.table_name = "master_categories"
  end

  class MigrationMasterSupplier < ApplicationRecord
    self.table_name = "master_suppliers"
  end

  def up
    create_table :master_product_names do |t|
      t.string :name, null: false
      t.integer :position, null: false, default: 0
      t.timestamps
    end
    add_index :master_product_names, :name, unique: true
    add_index :master_product_names, :position

    create_table :master_categories do |t|
      t.string :name, null: false
      t.integer :position, null: false, default: 0
      t.timestamps
    end
    add_index :master_categories, :name, unique: true
    add_index :master_categories, :position

    create_table :master_suppliers do |t|
      t.string :name, null: false
      t.integer :position, null: false, default: 0
      t.timestamps
    end
    add_index :master_suppliers, :name, unique: true
    add_index :master_suppliers, :position

    add_reference :master_products, :product_name, foreign_key: { to_table: :master_product_names }
    add_reference :master_products, :category_ref, foreign_key: { to_table: :master_categories }
    add_reference :master_products, :supplier_ref, foreign_key: { to_table: :master_suppliers }

    say_with_time "Backfilling master product references" do
      MigrationMasterProduct.reset_column_information

      MigrationMasterProduct.distinct.order(:name).pluck(:name).compact.each.with_index(1) do |name, index|
        MigrationMasterProductName.find_or_create_by!(name: name) do |record|
          record.position = index * 10
        end
      end

      MigrationMasterProduct.distinct.order(:category).pluck(:category).compact.each.with_index(1) do |name, index|
        MigrationMasterCategory.find_or_create_by!(name: name) do |record|
          record.position = index * 10
        end
      end

      MigrationMasterProduct.distinct.order(:supplier).pluck(:supplier).compact.each.with_index(1) do |name, index|
        MigrationMasterSupplier.find_or_create_by!(name: name) do |record|
          record.position = index * 10
        end
      end

      MigrationMasterProduct.find_each do |product|
        product.update_columns(
          product_name_id: MigrationMasterProductName.find_by!(name: product.name).id,
          category_ref_id: MigrationMasterCategory.find_by!(name: product.category).id,
          supplier_ref_id: MigrationMasterSupplier.find_by!(name: product.supplier).id
        )
      end
    end

    change_column_null :master_products, :product_name_id, false
    change_column_null :master_products, :category_ref_id, false
    change_column_null :master_products, :supplier_ref_id, false

    remove_index :master_products, :category
    remove_column :master_products, :name, :string
    remove_column :master_products, :category, :string
    remove_column :master_products, :supplier, :string
  end

  def down
    add_column :master_products, :name, :string
    add_column :master_products, :category, :string
    add_column :master_products, :supplier, :string
    add_index :master_products, :category

    MigrationMasterProduct.reset_column_information
    MigrationMasterProduct.find_each do |product|
      product.update_columns(
        name: MigrationMasterProductName.find(product.product_name_id).name,
        category: MigrationMasterCategory.find(product.category_ref_id).name,
        supplier: MigrationMasterSupplier.find(product.supplier_ref_id).name
      )
    end

    remove_reference :master_products, :product_name, foreign_key: { to_table: :master_product_names }
    remove_reference :master_products, :category_ref, foreign_key: { to_table: :master_categories }
    remove_reference :master_products, :supplier_ref, foreign_key: { to_table: :master_suppliers }

    drop_table :master_suppliers
    drop_table :master_categories
    drop_table :master_product_names
  end
end
