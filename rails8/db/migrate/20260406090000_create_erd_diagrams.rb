class CreateErdDiagrams < ActiveRecord::Migration[8.1]
  def change
    create_table :erd_diagrams do |t|
      t.string :name, null: false
      t.text :description

      t.timestamps
    end

    create_table :erd_tables do |t|
      t.references :erd_diagram, null: false, foreign_key: true
      t.string :name, null: false
      t.text :description
      t.float :x
      t.float :y
      t.float :z

      t.timestamps
    end

    create_table :erd_columns do |t|
      t.references :erd_table, null: false, foreign_key: true
      t.string :name, null: false
      t.string :data_type, null: false
      t.boolean :null_allowed, null: false, default: true
      t.boolean :primary_key, null: false, default: false
      t.string :default_value

      t.timestamps
    end

    create_table :erd_relationships do |t|
      t.references :erd_diagram, null: false, foreign_key: true
      t.references :source_table, null: false, foreign_key: { to_table: :erd_tables }
      t.references :target_table, null: false, foreign_key: { to_table: :erd_tables }
      t.integer :cardinality, null: false, default: 1
      t.string :source_column
      t.string :target_column
      t.string :name

      t.timestamps
    end

    add_index :erd_tables, [:erd_diagram_id, :name], unique: true
    add_index :erd_columns, [:erd_table_id, :name], unique: true
    add_index :erd_relationships, [:erd_diagram_id, :source_table_id, :target_table_id, :name], unique: true, name: "index_erd_relationships_on_diagram_and_tables"
  end
end
