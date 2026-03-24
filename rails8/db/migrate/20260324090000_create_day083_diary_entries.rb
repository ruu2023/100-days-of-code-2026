class CreateDay083DiaryEntries < ActiveRecord::Migration[8.1]
  def change
    create_table :day083_diary_entries do |t|
      t.string :title
      t.text :body, null: false
      t.string :mood, null: false, default: "reflective"
      t.date :entry_on, null: false

      t.timestamps
    end

    add_index :day083_diary_entries, :entry_on
    add_index :day083_diary_entries, :created_at
  end
end
