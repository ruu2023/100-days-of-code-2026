module Api
  module Erd
    class ErdDiagramsController < ApplicationController
      def graph
        diagram = ErdDiagram.find(params[:id])
        render json: ::Erd::GraphBuilder.new(diagram).as_json
      end
    end
  end
end
