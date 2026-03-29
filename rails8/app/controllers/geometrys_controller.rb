class GeometrysController < ApplicationController
  # GET /geometrys
  def index
    @shapes = ["circle", "square", "triangle", "rectangle", "hexagon", "star"]
  end

  # GET /geometrys/:shape
  def show
    @shape = params[:shape]
    render inline: svg_for(@shape), content_type: "image/svg+xml"
  end

  private

  def svg_for(shape)
    size = 200
    case shape
    when "circle"
      <<~SVG
        <svg width="#{size}" height="#{size}" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" fill="#3498db" stroke="#2c3e50" stroke-width="4"/>
        </svg>
      SVG
    when "square"
      <<~SVG
        <svg width="#{size}" height="#{size}" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="20" width="160" height="160" fill="#e74c3c" stroke="#2c3e50" stroke-width="4"/>
        </svg>
      SVG
    when "triangle"
      <<~SVG
        <svg width="#{size}" height="#{size}" xmlns="http://www.w3.org/2000/svg">
          <polygon points="100,20 180,180 20,180" fill="#2ecc71" stroke="#2c3e50" stroke-width="4"/>
        </svg>
      SVG
    when "rectangle"
      <<~SVG
        <svg width="#{size}" height="#{size}" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="60" width="160" height="100" fill="#9b59b6" stroke="#2c3e50" stroke-width="4"/>
        </svg>
      SVG
    when "hexagon"
      <<~SVG
        <svg width="#{size}" height="#{size}" xmlns="http://www.w3.org/2000/svg">
          <polygon points="100,20 170,60 170,140 100,180 30,140 30,60" fill="#f39c12" stroke="#2c3e50" stroke-width="4"/>
        </svg>
      SVG
    when "star"
      <<~SVG
        <svg width="#{size}" height="#{size}" xmlns="http://www.w3.org/2000/svg">
          <polygon points="100,10 123,75 190,75 137,115 155,180 100,140 45,180 63,115 10,75 77,75" fill="#f1c40f" stroke="#2c3e50" stroke-width="3"/>
        </svg>
      SVG
    else
      <<~SVG
        <svg width="#{size}" height="#{size}" xmlns="http://www.w3.org/2000/svg">
          <text x="50%" y="50%" text-anchor="middle" fill="#333">Unknown shape</text>
        </svg>
      SVG
    end
  end
end
