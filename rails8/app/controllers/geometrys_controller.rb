class GeometrysController < ApplicationController
  # GET /geometrys
  def index
    @shapes = ["circle", "square", "triangle", "rectangle", "hexagon", "star"]
  end

  # GET /geometrys/overlap
  def overlap
    @shapes = [
      { "type" => "circle", "cx" => 120, "cy" => 120, "r" => 80, "color" => "#3498db" },
      { "type" => "circle", "cx" => 180, "cy" => 120, "r" => 60, "color" => "#e74c3c" },
      { "type" => "rectangle", "x" => 100, "y" => 80, "width" => 120, "height" => 100, "color" => "#2ecc71" }
    ]
    @ruby_code = area_calculation_code(@shapes)
    @highlighted_code = highlight_ruby(@ruby_code)
    @area_results = calculate_areas(@shapes)
  end

  # GET /geometrys/:shape
  def show
    @shape = params[:shape]
    render inline: svg_for(@shape), content_type: "image/svg+xml"
  end

  private

  def overlapping_svgs(shapes)
    size = 300
    svg_elements = shapes.map do |shape|
      case shape["type"]
      when "circle"
        "<circle cx=\"#{shape['cx']}\" cy=\"#{shape['cy']}\" r=\"#{shape['r']}\" fill=\"#{shape['color']}\" opacity=\"0.6\" stroke=\"#2c3e50\" stroke-width=\"2\"/>"
      when "rectangle"
        "<rect x=\"#{shape['x']}\" y=\"#{shape['y']}\" width=\"#{shape['width']}\" height=\"#{shape['height']}\" fill=\"#{shape['color']}\" opacity=\"0.6\" stroke=\"#2c3e50\" stroke-width=\"2\"/>"
      end
    end.join("\n        ")

    <<~SVG
      <svg width="#{size}" height="#{size}" viewBox="0 0 #{size} #{size}" xmlns="http://www.w3.org/2000/svg">
        #{svg_elements}
      </svg>
    SVG
  end

  def area_calculation_code(shapes)
    code = "# 面積計算Rubyコード\n"
    code += "# このコードを実行して面積を計算できます\n\n"

    shapes.each_with_index do |shape, i|
      case shape["type"]
      when "circle"
        code += "# 図形#{i + 1}: 円 (半径 #{shape['r']})\n"
        code += "radius_#{i + 1} = #{shape['r']}\n"
        code += "area_#{i + 1} = Math::PI * radius_#{i + 1} ** 2\n"
        code += "puts \"円#{i + 1}の面積: \#{area_#{i + 1}.round(2)}\"\n\n"
      when "rectangle"
        code += "# 図形#{i + 1}: 長方形 (幅 #{shape['width']}, 高さ #{shape['height']})\n"
        code += "width_#{i + 1} = #{shape['width']}\n"
        code += "height_#{i + 1} = #{shape['height']}\n"
        code += "area_#{i + 1} = width_#{i + 1} * height_#{i + 1}\n"
        code += "puts \"長方形#{i + 1}の面積: \#{area_#{i + 1}}\"\n\n"
      end
    end

    total = shapes.sum do |shape|
      case shape["type"]
      when "circle" then Math::PI * shape["r"] ** 2
      when "rectangle" then shape["width"] * shape["height"]
      else 0
      end
    end

    code += "# 合計面積\n"
    code += "total_area = [#{shapes.map.with_index { |_, i| "area_#{i + 1}" }.join(', ')}].sum\n"
    code += "puts \"合計面積: \#{total_area.round(2)}\"\n"
    code += "# => 結果: #{total.round(2)}"
    code
  end

  def highlight_ruby(code)
    require "rouge"
    Rouge.highlight(code, "ruby", "html").strip
  end

  def calculate_areas(shapes)
    results = []
    total = 0

    shapes.each_with_index do |shape, i|
      case shape["type"]
      when "circle"
        area = Math::PI * shape["r"] ** 2
        results << { name: "円#{i + 1}", formula: "π × #{shape['r']}²", area: area }
        total += area
      when "rectangle"
        area = shape["width"] * shape["height"]
        results << { name: "長方形#{i + 1}", formula: "#{shape['width']} × #{shape['height']}", area: area }
        total += area
      end
    end

    { individual: results, total: total }
  end

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
