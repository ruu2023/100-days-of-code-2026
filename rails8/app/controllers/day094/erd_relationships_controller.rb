module Day094
  class ErdRelationshipsController < ApplicationController
    before_action :set_relationship, only: %i[edit update destroy]

    def create
      @relationship = ErdRelationship.new(relationship_params)

      if @relationship.save
        redirect_to day094_path(diagram_id: @relationship.erd_diagram_id), notice: "リレーションを追加しました。"
      else
        redirect_to day094_path(diagram_id: params.dig(:erd_relationship, :erd_diagram_id)), alert: @relationship.errors.full_messages.to_sentence
      end
    end

    def edit
    end

    def update
      if @relationship.update(relationship_params)
        redirect_to day094_path(diagram_id: @relationship.erd_diagram_id), notice: "リレーションを更新しました。"
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      diagram_id = @relationship.erd_diagram_id
      @relationship.destroy!
      redirect_to day094_path(diagram_id: diagram_id), notice: "リレーションを削除しました。"
    end

    private

    def set_relationship
      @relationship = ErdRelationship.find(params[:id])
    end

    def relationship_params
      params.require(:erd_relationship).permit(:erd_diagram_id, :source_table_id, :target_table_id, :cardinality, :source_column, :target_column, :name)
    end
  end
end
