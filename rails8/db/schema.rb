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

ActiveRecord::Schema[8.1].define(version: 2026_03_12_000004) do
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

  create_table "comments", force: :cascade do |t|
    t.text "body"
    t.datetime "created_at", null: false
    t.integer "post_id", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["post_id"], name: "index_comments_on_post_id"
    t.index ["user_id"], name: "index_comments_on_user_id"
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

  create_table "users", force: :cascade do |t|
    t.string "avatar_url"
    t.datetime "created_at", null: false
    t.string "email_address", null: false
    t.string "password_digest", null: false
    t.datetime "updated_at", null: false
    t.index ["email_address"], name: "index_users_on_email_address", unique: true
  end

  add_foreign_key "accounts", "accounts", column: "parent_id"
  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "comments", "posts"
  add_foreign_key "comments", "users"
  add_foreign_key "journal_entries", "journal_entries", column: "reversal_of_id"
  add_foreign_key "journal_entries", "parties"
  add_foreign_key "journal_entries", "users", column: "created_by_id"
  add_foreign_key "line_items", "accounts"
  add_foreign_key "line_items", "journal_entries"
  add_foreign_key "posts", "users"
  add_foreign_key "sessions", "users"
end
