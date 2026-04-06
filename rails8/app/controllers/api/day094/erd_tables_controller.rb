module Api
  module Day094
    class ErdTablesController < ApplicationController
      protect_from_forgery with: :null_session

      def position
        table = ErdTable.find(params[:id])

        if table.update(position_params)
          render json: { ok: true, table_id: table.id }
        else
          render json: { ok: false, errors: table.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def position_params
        params.require(:erd_table).permit(:x, :y, :z)
      end
    end
  end
end
