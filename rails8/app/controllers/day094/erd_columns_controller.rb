module Day094
  class ErdColumnsController < ApplicationController
    before_action :set_column, only: %i[edit update destroy]

    def create
      @column = ErdColumn.new(column_params)

      if @column.save
        redirect_to erd_path(diagram_id: @column.erd_table.erd_diagram_id), notice: "カラムを追加しました。"
      else
        redirect_to erd_path(diagram_id: diagram_id_from_column_params), alert: @column.errors.full_messages.to_sentence
      end
    end

    def edit
    end

    def update
      if @column.update(column_params)
        redirect_to erd_path(diagram_id: @column.erd_table.erd_diagram_id), notice: "カラムを更新しました。"
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      diagram_id = @column.erd_table.erd_diagram_id
      @column.destroy!
      redirect_to erd_path(diagram_id: diagram_id), notice: "カラムを削除しました。"
    end

    private

    def set_column
      @column = ErdColumn.find(params[:id])
    end

    def column_params
      params.require(:erd_column).permit(:erd_table_id, :name, :data_type, :null_allowed, :primary_key, :default_value)
    end

    def diagram_id_from_column_params
      @column.erd_table&.erd_diagram_id || ErdTable.find_by(id: params.dig(:erd_column, :erd_table_id))&.erd_diagram_id
    end
  end
end
