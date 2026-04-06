module Day094
  class ErdTablesController < ApplicationController
    before_action :set_table, only: %i[edit update destroy]

    def create
      @table = ErdTable.new(table_params)

      if @table.save
        redirect_to erd_path(diagram_id: @table.erd_diagram_id), notice: "テーブルを追加しました。"
      else
        redirect_to erd_path(diagram_id: @table.erd_diagram_id), alert: @table.errors.full_messages.to_sentence
      end
    end

    def edit
    end

    def update
      if @table.update(table_params)
        redirect_to erd_path(diagram_id: @table.erd_diagram_id), notice: "テーブルを更新しました。"
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      diagram_id = @table.erd_diagram_id
      @table.destroy!
      redirect_to erd_path(diagram_id: diagram_id), notice: "テーブルを削除しました。"
    end

    private

    def set_table
      @table = ErdTable.find(params[:id])
    end

    def table_params
      params.require(:erd_table).permit(:erd_diagram_id, :name, :description, :x, :y, :z)
    end
  end
end
