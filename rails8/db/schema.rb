# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_04_10_095610) do
  create_table "accounts", force: :cascade do |t|
    t.integer "account_type", null: false
    t.boolean "active", default: true
    t.string "code", null: false
    t.datetime "created_at", null: false
    t.text "description"
    t.string "name", null: false
    t.integer "parent_id"
    t.datetime "updated_at", null: false
    t.index ["account_type"], name: "index_accounts_on_account_type"
    t.index ["active"], name: "index_accounts_on_active"
    t.index ["code"], name: "index_accounts_on_code", unique: true
    t.index ["parent_id"], name: "index_accounts_on_parent_id"
  end

  create_table "active_storage_attachments", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "booking_owners", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.string "notification_email", null: false
    t.string "slug", null: false
    t.string "time_zone", default: "Asia/Tokyo", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_booking_owners_on_slug", unique: true
  end

  create_table "booking_reservations", force: :cascade do |t|
    t.integer "booking_slot_id", null: false
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.string "name", null: false
    t.text "note"
    t.string "phone"
    t.integer "status", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["booking_slot_id"], name: "index_booking_reservations_on_booking_slot_id", unique: true
  end

  create_table "booking_slots", force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.integer "booking_owner_id", null: false
    t.integer "capacity", default: 1, null: false
    t.datetime "created_at", null: false
    t.datetime "ends_at", null: false
    t.string "label"
    t.datetime "starts_at", null: false
    t.datetime "updated_at", null: false
    t.index ["booking_owner_id", "starts_at"], name: "index_booking_slots_on_booking_owner_id_and_starts_at", unique: true
    t.index ["booking_owner_id"], name: "index_booking_slots_on_booking_owner_id"
  end

  create_table "comments", force: :cascade do |t|
    t.text "body"
    t.datetime "created_at", null: false
    t.integer "post_id", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["post_id"], name: "index_comments_on_post_id"
    t.index ["user_id"], name: "index_comments_on_user_id"
  end

  create_table "csv_imports", force: :cascade do |t|
    t.string "col_sep", default: ",", null: false
    t.datetime "created_at", null: false
    t.text "error_message"
    t.boolean "header_row", default: true, null: false
    t.datetime "imported_at"
    t.text "inferred_columns"
    t.string "name", null: false
    t.integer "row_count", default: 0, null: false
    t.text "sample_rows"
    t.string "source_filename", null: false
    t.integer "status", default: 0, null: false
    t.string "target_table_name", null: false
    t.datetime "updated_at", null: false
    t.index ["status"], name: "index_csv_imports_on_status"
    t.index ["target_table_name"], name: "index_csv_imports_on_target_table_name", unique: true
  end

  create_table "day006_memos", force: :cascade do |t|
    t.text "body"
    t.datetime "created_at", null: false
    t.string "title"
    t.datetime "updated_at", null: false
  end

  create_table "day067_posts", force: :cascade do |t|
    t.text "body"
    t.datetime "created_at", null: false
    t.string "title"
    t.datetime "updated_at", null: false
  end

  create_table "day083_diary_entries", force: :cascade do |t|
    t.text "body", null: false
    t.datetime "created_at", null: false
    t.date "entry_on", null: false
    t.string "mood", default: "reflective", null: false
    t.string "title"
    t.datetime "updated_at", null: false
    t.index ["created_at"], name: "index_day083_diary_entries_on_created_at"
    t.index ["entry_on"], name: "index_day083_diary_entries_on_entry_on"
  end

  create_table "day085_categories", force: :cascade do |t|
    t.integer "color"
    t.datetime "created_at", null: false
    t.string "icon"
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_day085_categories_on_name", unique: true
  end

  create_table "day085_subscriptions", force: :cascade do |t|
    t.integer "billing_cycle", default: 0, null: false
    t.integer "category_id"
    t.datetime "created_at", null: false
    t.text "description"
    t.date "end_date"
    t.string "name", null: false
    t.date "next_billing_date"
    t.decimal "price", precision: 10, scale: 2, null: false
    t.date "start_date"
    t.integer "status", default: 0, null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.text "website"
    t.index ["category_id"], name: "index_day085_subscriptions_on_category_id"
    t.index ["user_id", "category_id"], name: "index_day085_subscriptions_on_user_id_and_category_id"
    t.index ["user_id", "status"], name: "index_day085_subscriptions_on_user_id_and_status"
    t.index ["user_id"], name: "index_day085_subscriptions_on_user_id"
  end

  create_table "day090_tasks", force: :cascade do |t|
    t.datetime "completed_at"
    t.string "content"
    t.datetime "created_at", null: false
    t.date "scheduled_on"
    t.datetime "updated_at", null: false
  end

  create_table "erd_columns", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "data_type", null: false
    t.string "default_value"
    t.integer "erd_table_id", null: false
    t.string "name", null: false
    t.boolean "null_allowed", default: true, null: false
    t.boolean "primary_key", default: false, null: false
    t.datetime "updated_at", null: false
    t.index ["erd_table_id", "name"], name: "index_erd_columns_on_erd_table_id_and_name", unique: true
    t.index ["erd_table_id"], name: "index_erd_columns_on_erd_table_id"
  end

  create_table "erd_diagrams", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.string "name", null: false
    t.datetime "updated_at", null: false
  end

  create_table "erd_relationships", force: :cascade do |t|
    t.integer "cardinality", default: 1, null: false
    t.datetime "created_at", null: false
    t.integer "erd_diagram_id", null: false
    t.string "name"
    t.string "source_column"
    t.integer "source_table_id", null: false
    t.string "target_column"
    t.integer "target_table_id", null: false
    t.datetime "updated_at", null: false
    t.index ["erd_diagram_id", "source_table_id", "target_table_id", "name"], name: "index_erd_relationships_on_diagram_and_tables", unique: true
    t.index ["erd_diagram_id"], name: "index_erd_relationships_on_erd_diagram_id"
    t.index ["source_table_id"], name: "index_erd_relationships_on_source_table_id"
    t.index ["target_table_id"], name: "index_erd_relationships_on_target_table_id"
  end

  create_table "erd_tables", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.integer "erd_diagram_id", null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.float "x"
    t.float "y"
    t.float "z"
    t.index ["erd_diagram_id", "name"], name: "index_erd_tables_on_erd_diagram_id_and_name", unique: true
    t.index ["erd_diagram_id"], name: "index_erd_tables_on_erd_diagram_id"
  end

  create_table "history_events", force: :cascade do |t|
    t.string "category"
    t.datetime "created_at", null: false
    t.text "description"
    t.string "side"
    t.string "title"
    t.datetime "updated_at", null: false
    t.integer "year"
  end

  create_table "images", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "inventories", force: :cascade do |t|
    t.string "code"
    t.datetime "created_at", null: false
    t.string "location"
    t.string "name"
    t.text "notes"
    t.integer "quantity"
    t.string "unit"
    t.datetime "updated_at", null: false
  end

  create_table "items", force: :cascade do |t|
    t.boolean "active"
    t.datetime "created_at", null: false
    t.date "last_purchased_on"
    t.text "memo"
    t.string "name"
    t.integer "purchase_cycle_days"
    t.datetime "updated_at", null: false
  end

  create_table "journal_entries", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "created_by_id"
    t.text "description"
    t.date "entry_date", null: false
    t.string "entry_number", null: false
    t.integer "party_id"
    t.boolean "posted", default: false
    t.integer "reversal_of_id"
    t.boolean "reversed", default: false
    t.datetime "updated_at", null: false
    t.index ["created_by_id"], name: "index_journal_entries_on_created_by_id"
    t.index ["entry_date"], name: "index_journal_entries_on_entry_date"
    t.index ["entry_number"], name: "index_journal_entries_on_entry_number", unique: true
    t.index ["party_id"], name: "index_journal_entries_on_party_id"
    t.index ["posted"], name: "index_journal_entries_on_posted"
    t.index ["reversal_of_id"], name: "index_journal_entries_on_reversal_of_id"
  end

  create_table "line_items", force: :cascade do |t|
    t.integer "account_id", null: false
    t.datetime "created_at", null: false
    t.decimal "credit", precision: 15, scale: 2, default: "0.0"
    t.decimal "debit", precision: 15, scale: 2, default: "0.0"
    t.integer "journal_entry_id", null: false
    t.text "memo"
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_line_items_on_account_id"
    t.index ["journal_entry_id", "account_id"], name: "index_line_items_on_journal_entry_id_and_account_id"
    t.index ["journal_entry_id"], name: "index_line_items_on_journal_entry_id"
  end

  create_table "master_categories", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.integer "position", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_master_categories_on_name", unique: true
    t.index ["position"], name: "index_master_categories_on_position"
  end

  create_table "master_product_names", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.integer "position", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_master_product_names_on_name", unique: true
    t.index ["position"], name: "index_master_product_names_on_position"
  end

  create_table "master_products", force: :cascade do |t|
    t.integer "category_ref_id", null: false
    t.datetime "created_at", null: false
    t.text "notes"
    t.integer "position", default: 0, null: false
    t.decimal "price", precision: 10, scale: 2, default: "0.0", null: false
    t.integer "product_name_id", null: false
    t.string "sku", null: false
    t.string "status", default: "active", null: false
    t.integer "stock", default: 0, null: false
    t.integer "supplier_ref_id", null: false
    t.string "unit", default: "pcs", null: false
    t.datetime "updated_at", null: false
    t.index ["category_ref_id"], name: "index_master_products_on_category_ref_id"
    t.index ["position"], name: "index_master_products_on_position"
    t.index ["product_name_id"], name: "index_master_products_on_product_name_id"
    t.index ["sku"], name: "index_master_products_on_sku", unique: true
    t.index ["status"], name: "index_master_products_on_status"
    t.index ["supplier_ref_id"], name: "index_master_products_on_supplier_ref_id"
  end

  create_table "master_suppliers", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.integer "position", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_master_suppliers_on_name", unique: true
    t.index ["position"], name: "index_master_suppliers_on_position"
  end

  create_table "mice", force: :cascade do |t|
    t.string "author"
    t.text "content"
    t.datetime "created_at", null: false
    t.date "deadline"
    t.integer "status"
    t.string "title"
    t.datetime "updated_at", null: false
    t.string "worker"
  end

  create_table "parties", force: :cascade do |t|
    t.boolean "active", default: true
    t.text "address"
    t.datetime "created_at", null: false
    t.string "email"
    t.string "name", null: false
    t.string "party_type", default: "client", null: false
    t.string "phone"
    t.string "tax_id"
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_parties_on_active"
    t.index ["name"], name: "index_parties_on_name"
    t.index ["party_type"], name: "index_parties_on_party_type"
  end

  create_table "posts", force: :cascade do |t|
    t.text "body"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["user_id"], name: "index_posts_on_user_id"
  end

  create_table "sessions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "ip_address"
    t.datetime "updated_at", null: false
    t.string "user_agent"
    t.integer "user_id", null: false
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "statement_csv_import_1_column_1_5334_91_column_3_group", force: :cascade do |t|
    t.string "5334_91"
    t.date "column_1"
    t.integer "column_3"
    t.string "column_4"
    t.string "column_5"
    t.integer "column_6", null: false
    t.boolean "column_7"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "statement_csv_import_2_column_1_column_2_column_3", force: :cascade do |t|
    t.integer "1", null: false
    t.boolean "2", null: false
    t.date "column_1", null: false
    t.string "column_10", null: false
    t.string "column_2", null: false
    t.string "column_3", null: false
    t.string "column_4", null: false
    t.integer "column_5", null: false
    t.boolean "column_6", null: false
    t.integer "column_7", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "statement_csv_import_3_column_1_column_2_column_3", force: :cascade do |t|
    t.integer "2"
    t.boolean "3"
    t.date "column_1"
    t.string "column_10"
    t.string "column_2", null: false
    t.string "column_3"
    t.string "column_4"
    t.integer "column_5"
    t.boolean "column_6"
    t.integer "column_7"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "statement_csv_import_datasets", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "error_message"
    t.string "header_signature", null: false
    t.datetime "imported_at"
    t.text "inferred_columns"
    t.string "name", null: false
    t.text "normalized_headers"
    t.integer "row_count", default: 0, null: false
    t.text "sample_rows"
    t.text "source_filenames"
    t.integer "statement_csv_import_id", null: false
    t.integer "status", default: 0, null: false
    t.string "target_mode", default: "new_table", null: false
    t.string "target_table_name", null: false
    t.datetime "updated_at", null: false
    t.index ["header_signature"], name: "index_statement_csv_import_datasets_on_header_signature"
    t.index ["statement_csv_import_id"], name: "index_statement_csv_import_datasets_on_statement_csv_import_id"
    t.index ["status"], name: "index_statement_csv_import_datasets_on_status"
    t.index ["target_table_name"], name: "index_statement_csv_import_datasets_on_target_table_name"
  end

  create_table "statement_csv_import_files", force: :cascade do |t|
    t.string "col_sep", default: ",", null: false
    t.datetime "created_at", null: false
    t.text "error_message"
    t.boolean "header_row", default: true, null: false
    t.text "inferred_columns"
    t.text "normalized_headers"
    t.integer "row_count", default: 0, null: false
    t.text "sample_rows"
    t.string "source_filename", null: false
    t.integer "statement_csv_import_dataset_id"
    t.integer "statement_csv_import_id", null: false
    t.integer "status", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["statement_csv_import_dataset_id"], name: "idx_on_statement_csv_import_dataset_id_0de9f89d0a"
    t.index ["statement_csv_import_id"], name: "index_statement_csv_import_files_on_statement_csv_import_id"
    t.index ["status"], name: "index_statement_csv_import_files_on_status"
  end

  create_table "statement_csv_imports", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "error_message"
    t.datetime "imported_at"
    t.string "name", null: false
    t.integer "status", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["status"], name: "index_statement_csv_imports_on_status"
  end

  create_table "users", force: :cascade do |t|
    t.string "avatar_url"
    t.datetime "created_at", null: false
    t.string "email_address", null: false
    t.string "image_url"
    t.string "name"
    t.string "password_digest", null: false
    t.string "provider"
    t.string "uid"
    t.datetime "updated_at", null: false
    t.index ["provider", "uid"], name: "index_users_on_provider_and_uid", unique: true
  end

  create_table "vulnerabilities", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "japanese_summary"
    t.datetime "published_at"
    t.string "source"
    t.text "summary"
    t.string "title"
    t.datetime "updated_at", null: false
    t.string "url"
    t.index ["url"], name: "index_vulnerabilities_on_url"
  end

  create_table "webpush_subscriptions", force: :cascade do |t|
    t.string "auth_key"
    t.datetime "created_at", null: false
    t.string "endpoint"
    t.string "p256dh_key"
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["user_id"], name: "index_webpush_subscriptions_on_user_id"
  end

  add_foreign_key "accounts", "accounts", column: "parent_id"
  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "booking_reservations", "booking_slots"
  add_foreign_key "booking_slots", "booking_owners"
  add_foreign_key "comments", "posts"
  add_foreign_key "comments", "users"
  add_foreign_key "day085_subscriptions", "day085_categories", column: "category_id"
  add_foreign_key "day085_subscriptions", "users"
  add_foreign_key "erd_columns", "erd_tables"
  add_foreign_key "erd_relationships", "erd_diagrams"
  add_foreign_key "erd_relationships", "erd_tables", column: "source_table_id"
  add_foreign_key "erd_relationships", "erd_tables", column: "target_table_id"
  add_foreign_key "erd_tables", "erd_diagrams"
  add_foreign_key "journal_entries", "journal_entries", column: "reversal_of_id"
  add_foreign_key "journal_entries", "parties"
  add_foreign_key "journal_entries", "users", column: "created_by_id"
  add_foreign_key "line_items", "accounts"
  add_foreign_key "line_items", "journal_entries"
  add_foreign_key "master_products", "master_categories", column: "category_ref_id"
  add_foreign_key "master_products", "master_product_names", column: "product_name_id"
  add_foreign_key "master_products", "master_suppliers", column: "supplier_ref_id"
  add_foreign_key "posts", "users"
  add_foreign_key "sessions", "users"
  add_foreign_key "statement_csv_import_datasets", "statement_csv_imports"
  add_foreign_key "statement_csv_import_files", "statement_csv_import_datasets"
  add_foreign_key "statement_csv_import_files", "statement_csv_imports"
  add_foreign_key "webpush_subscriptions", "users"
end
