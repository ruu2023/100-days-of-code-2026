class CreateVulnerabilities < ActiveRecord::Migration[8.1]
  def change
    create_table :vulnerabilities do |t|
      t.string :title
      t.string :url
      t.text :summary
      t.string :source
      t.datetime :published_at

      t.timestamps
    end
    add_index :vulnerabilities, :url
  end
end
