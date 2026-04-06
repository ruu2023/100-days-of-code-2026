ActiveRecord::Schema[8.1].define(version: 2026_04_06_090000) do
  create_table "users", force: :cascade do |t|
    t.string "email", null: false
    t.string "name"
    t.datetime "created_at", null: false
  end

  create_table "posts", force: :cascade do |t|
    t.string "title", null: false
    t.text "body"
    t.integer "user_id", null: false
    t.datetime "created_at", null: false
  end

  add_foreign_key "posts", "users"
end
