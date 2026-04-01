class CreateDay090Tasks < ActiveRecord::Migration[8.1]
  def change
    create_table :day090_tasks do |t|
      t.string :content
      t.date :scheduled_on
      t.datetime :completed_at

      t.timestamps
    end
  end
end
