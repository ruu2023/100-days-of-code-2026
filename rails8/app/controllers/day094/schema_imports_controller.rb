module Day094
  class SchemaImportsController < ApplicationController
    def create
      result = ::Day094::SchemaImporter.new(
        schema_path: import_params[:schema_path],
        diagram_name: import_params[:diagram_name]
      ).import!

      redirect_to erd_path(diagram_id: result.diagram.id),
                  notice: "schema.rb を取り込みました。#{result.table_count} テーブル / #{result.relationship_count} リレーション"
    rescue ::Day094::SchemaImporter::ImportError, ActiveRecord::RecordInvalid => error
      redirect_to erd_path, alert: error.message
    end

    private

    def import_params
      params.require(:schema_import).permit(:schema_path, :diagram_name)
    end
  end
end
