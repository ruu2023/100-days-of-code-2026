module Day094
  class ErdDiagramsController < ApplicationController
    before_action :set_diagram, only: %i[edit update destroy]
    before_action :set_index_state, only: :index

    def index
    end

    def new
      @diagram = ErdDiagram.new
    end

    def create
      @diagram = ErdDiagram.new(diagram_params)

      if @diagram.save
        redirect_to erd_path(diagram_id: @diagram.id), notice: "ER 図を作成しました。"
      else
        set_index_state(new_diagram: @diagram)
        render :index, status: :unprocessable_entity
      end
    end

    def edit
    end

    def update
      if @diagram.update(diagram_params)
        redirect_to erd_path(diagram_id: @diagram.id), notice: "ER 図を更新しました。"
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      @diagram.destroy!
      redirect_to erd_path, notice: "ER 図を削除しました。"
    end

    private

    def set_diagram
      @diagram = ErdDiagram.find(params[:id])
    end

    def set_index_state(new_diagram: nil)
      @diagrams = ErdDiagram.includes(erd_tables: :erd_columns).order(updated_at: :desc)
      @diagram = if params[:diagram_id].present?
                   @diagrams.find { |diagram| diagram.id == params[:diagram_id].to_i }
                 else
                   @diagrams.first
                 end
      @diagram ||= @diagrams.first

      @new_diagram = new_diagram || ErdDiagram.new
      @erd_table = @diagram ? @diagram.erd_tables.build : ErdTable.new
      @erd_column = ErdColumn.new
      @erd_relationship = ErdRelationship.new(cardinality: :one_to_many)
    end

    def diagram_params
      params.require(:erd_diagram).permit(:name, :description)
    end
  end
end
