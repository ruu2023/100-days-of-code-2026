class CreateHistoryEvents < ActiveRecord::Migration[8.1]
  def change
    create_table :history_events do |t|
      t.integer :year
      t.string :title
      t.text :description
      t.string :category
      t.string :side

      t.timestamps
    end
  end
end
