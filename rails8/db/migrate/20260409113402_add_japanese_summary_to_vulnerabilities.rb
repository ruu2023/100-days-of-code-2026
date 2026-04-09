class AddJapaneseSummaryToVulnerabilities < ActiveRecord::Migration[8.1]
  def change
    add_column :vulnerabilities, :japanese_summary, :text
  end
end
