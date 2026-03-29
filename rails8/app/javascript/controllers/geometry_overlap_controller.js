import { Controller } from "@hotwired/stimulus"

export default class GeometryOverlapController extends Controller {
  static targets = [
    "svg", "shape1", "shape2", "shape3",
    "label1", "label2", "label3",
    "input1", "input2", "input3",
    "val1r", "val1cx", "val1cy",
    "val2r", "val2cx", "val2cy",
    "val3width", "val3height", "val3x", "val3y",
    "area1", "area2", "area3", "total",
    "formula1", "formula2", "formula3",
    "color1", "color2", "color3",
    "size1", "size2", "size3",
    "code1", "code2", "code3",
    "result1", "result2", "result3",
    "code"
  ]

  connect() {
    this.shape1Params = { cx: 120, cy: 120, r: 80, color: "#3498db" }
    this.shape2Params = { cx: 180, cy: 120, r: 60, color: "#e74c3c" }
    this.shape3Params = { x: 100, y: 80, width: 120, height: 100, color: "#2ecc71" }
  }

  updateShape1(event) {
    const param = event.target.dataset.shapeParam
    const value = event.target.type === "color" ? event.target.value : parseInt(event.target.value)
    this.shape1Params[param] = value
    this.render()
    this.updateLabels()
    this.recalculate()
  }

  updateShape2(event) {
    const param = event.target.dataset.shapeParam
    const value = event.target.type === "color" ? event.target.value : parseInt(event.target.value)
    this.shape2Params[param] = value
    this.render()
    this.updateLabels()
    this.recalculate()
  }

  updateShape3(event) {
    const param = event.target.dataset.shapeParam
    const value = event.target.type === "color" ? event.target.value : parseInt(event.target.value)
    this.shape3Params[param] = value
    this.render()
    this.updateLabels()
    this.recalculate()
  }

  render() {
    // Update SVG
    this.shape1Target.setAttribute("cx", this.shape1Params.cx)
    this.shape1Target.setAttribute("cy", this.shape1Params.cy)
    this.shape1Target.setAttribute("r", this.shape1Params.r)
    this.shape1Target.setAttribute("fill", this.shape1Params.color)

    this.shape2Target.setAttribute("cx", this.shape2Params.cx)
    this.shape2Target.setAttribute("cy", this.shape2Params.cy)
    this.shape2Target.setAttribute("r", this.shape2Params.r)
    this.shape2Target.setAttribute("fill", this.shape2Params.color)

    this.shape3Target.setAttribute("x", this.shape3Params.x)
    this.shape3Target.setAttribute("y", this.shape3Params.y)
    this.shape3Target.setAttribute("width", this.shape3Params.width)
    this.shape3Target.setAttribute("height", this.shape3Params.height)
    this.shape3Target.setAttribute("fill", this.shape3Params.color)

    // Update color indicators
    this.color1Target.style.backgroundColor = this.shape1Params.color
    this.color2Target.style.backgroundColor = this.shape2Params.color
    this.color3Target.style.backgroundColor = this.shape3Params.color
  }

  updateLabels() {
    this.label1Target.textContent = `円 (半径${this.shape1Params.r})`
    this.label1Target.style.backgroundColor = this.shape1Params.color + "33"
    this.label1Target.style.color = this.shape1Params.color

    this.label2Target.textContent = `円 (半径${this.shape2Params.r})`
    this.label2Target.style.backgroundColor = this.shape2Params.color + "33"
    this.label2Target.style.color = this.shape2Params.color

    this.label3Target.textContent = `長方形 (${this.shape3Params.width}×${this.shape3Params.height})`
    this.label3Target.style.backgroundColor = this.shape3Params.color + "33"
    this.label3Target.style.color = this.shape3Params.color

    // Update value displays
    this.val1rTarget.textContent = this.shape1Params.r
    this.val1cxTarget.textContent = this.shape1Params.cx
    this.val1cyTarget.textContent = this.shape1Params.cy

    this.val2rTarget.textContent = this.shape2Params.r
    this.val2cxTarget.textContent = this.shape2Params.cx
    this.val2cyTarget.textContent = this.shape2Params.cy

    this.val3widthTarget.textContent = this.shape3Params.width
    this.val3heightTarget.textContent = this.shape3Params.height
    this.val3xTarget.textContent = this.shape3Params.x
    this.val3yTarget.textContent = this.shape3Params.y

    // Update size info in breakdown
    this.size1Target.textContent = `半径 ${this.shape1Params.r}`
    this.size2Target.textContent = `半径 ${this.shape2Params.r}`
    this.size3Target.textContent = `${this.shape3Params.width} × ${this.shape3Params.height}`
  }

  recalculate() {
    const area1 = Math.PI * this.shape1Params.r ** 2
    const area2 = Math.PI * this.shape2Params.r ** 2
    const area3 = this.shape3Params.width * this.shape3Params.height
    const total = area1 + area2 + area3

    this.area1Target.textContent = area1.toFixed(2)
    this.area2Target.textContent = area2.toFixed(2)
    this.area3Target.textContent = area3.toFixed(2)
    this.totalTarget.textContent = total.toFixed(2)

    this.formula1Target.textContent = `公式: π × ${this.shape1Params.r}²`
    this.formula2Target.textContent = `公式: π × ${this.shape2Params.r}²`
    this.formula3Target.textContent = `公式: ${this.shape3Params.width} × ${this.shape3Params.height}`

    this.code1Target.textContent = `π × ${this.shape1Params.r}²`
    this.code2Target.textContent = `π × ${this.shape2Params.r}²`
    this.code3Target.textContent = `${this.shape3Params.width} × ${this.shape3Params.height}`

    this.result1Target.textContent = `= ${area1.toFixed(2)}`
    this.result2Target.textContent = `= ${area2.toFixed(2)}`
    this.result3Target.textContent = `= ${area3.toFixed(2)}`
  }

  regenerateCode() {
    const shapes = [
      { type: "circle", ...this.shape1Params },
      { type: "circle", ...this.shape2Params },
      { type: "rectangle", ...this.shape3Params }
    ]

    let code = "# 面積計算Rubyコード\n"
    code += "# このコードを実行して面積を計算できます\n\n"

    let areaNum = 1
    shapes.forEach((shape, i) => {
      if (shape.type === "circle") {
        code += `# 図形${i + 1}: 円 (半径 ${shape.r})\n`
        code += `radius_${areaNum} = ${shape.r}\n`
        code += `area_${areaNum} = Math::PI * radius_${areaNum} ** 2\n`
        code += `puts "円${areaNum}の面積: \#{area_${areaNum}.round(2)}"\n\n`
        areaNum++
      } else if (shape.type === "rectangle") {
        code += `# 図形${i + 1}: 長方形 (幅 ${shape.width}, 高さ ${shape.height})\n`
        code += `width_${areaNum} = ${shape.width}\n`
        code += `height_${areaNum} = ${shape.height}\n`
        code += `area_${areaNum} = width_${areaNum} * height_${areaNum}\n`
        code += `puts "長方形${areaNum}の面積: \#{area_${areaNum}}"\n\n`
        areaNum++
      }
    })

    const totalArea = (Math.PI * this.shape1Params.r ** 2) +
                       (Math.PI * this.shape2Params.r ** 2) +
                       (this.shape3Params.width * this.shape3Params.height)

    const areas = []
    let n = 1
    shapes.forEach((shape) => {
      if (shape.type === "circle" || shape.type === "rectangle") {
        areas.push(`area_${n}`)
        n++
      }
    })

    code += "# 合計面積\n"
    code += `total_area = [${areas.join(', ')}].sum\n`
    code += `puts "合計面積: \#{total_area.round(2)}"\n`
    code += `# => 結果: ${totalArea.toFixed(2)}`

    // Syntax highlight with simple formatting
    const highlighted = this.highlightRuby(code)
    this.codeTarget.innerHTML = highlighted
  }

  highlightRuby(code) {
    // Simple Ruby syntax highlighting
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/(#.*)$/gm, '<span class="text-slate-500">$1</span>')
      .replace(/\b(Math::PI|puts|def|end|class)\b/g, '<span class="text-purple-400">$1</span>')
      .replace(/\b(radius_\d|area_\d|width_\d|height_\d|total_area)\b/g, '<span class="text-yellow-400">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="text-cyan-400">$1</span>')
      .replace(/(["'][^"']*["'])/g, '<span class="text-emerald-400">$1</span>')
  }
}
