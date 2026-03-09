class CreateDay067Posts < ActiveRecord::Migration[8.1]
  def change
    create_table :day067_posts do |t|
      t.string :title
      t.text :body

      t.timestamps
    end
  end
end
