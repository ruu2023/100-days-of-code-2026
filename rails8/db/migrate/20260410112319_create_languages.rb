class CreateLanguages < ActiveRecord::Migration[8.1]
  def change
    create_table :languages do |t|
      t.string :name
      t.string :appeared
      t.string :developer
      t.text :purpose
      t.text :competitors

      t.timestamps
    end
  end
end
