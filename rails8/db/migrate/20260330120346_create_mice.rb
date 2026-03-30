class CreateMice < ActiveRecord::Migration[8.1]
  def change
    create_table :mice do |t|
      t.string :title
      t.text :content
      t.integer :status
      t.date :deadline
      t.string :author
      t.string :worker

      t.timestamps
    end
  end
end
