class CreateDay006Memos < ActiveRecord::Migration[8.1]
  def change
    create_table :day006_memos do |t|
      t.string :title
      t.text :body

      t.timestamps
    end
  end
end
