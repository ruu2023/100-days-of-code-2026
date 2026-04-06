module Api
  module Day094
    class ErdDiagramsController < ApplicationController
      def graph
        diagram = ErdDiagram.find(params[:id])
        render json: ::Day094::GraphBuilder.new(diagram).as_json
      end
    end
  end
end
