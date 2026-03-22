import { Controller } from "@hotwired/stimulus"

const STORAGE_KEY = "day081-roulette-state"
const SPIN_DURATION = 4800
const WHEEL_BASE_TURNS = 6

export default class extends Controller {
  static targets = [
    "wheel",
    "wheelLabels",
    "result",
    "resultMeta",
    "empty",
    "summary",
    "activeList",
    "usedList",
    "singleInput",
    "bulkInput",
    "spinButton"
  ]

  static values = {
    initialState: Object
  }

  connect() {
    this.rotation = 0
    this.spinning = false
    this.currentMode = "names"
    this.state = this.loadState()
    this.render()
  }

  switchMode(event) {
    if (this.spinning) return
    this.currentMode = event.params.mode
    this.render()
  }

  spin() {
    const activeItems = this.activeItems()
    if (this.spinning || activeItems.length === 0) return

    this.spinning = true
    const spinMode = this.currentMode
    this.spinButtonTarget.disabled = true

    const winnerIndex = Math.floor(Math.random() * activeItems.length)
    const winner = activeItems[winnerIndex]
    const segmentAngle = 360 / activeItems.length
    const targetAngle = 360 - (winnerIndex * segmentAngle + segmentAngle / 2)
    const extraTurns = 360 * WHEEL_BASE_TURNS

    this.rotation += extraTurns + targetAngle - (this.rotation % 360)
    this.wheelTarget.style.transform = `rotate(${this.rotation}deg)`

    window.clearTimeout(this.spinTimer)
    this.spinTimer = window.setTimeout(() => {
      this.markUsed(winner.id, true, spinMode)
      this.currentMode = spinMode
      this.resultTarget.textContent = winner.label
      this.resultMetaTarget.textContent = `${this.state[spinMode].label} で選ばれたので自動で除外しました。`
      this.spinning = false
      this.spinButtonTarget.disabled = false
      this.render()
    }, SPIN_DURATION)
  }

  addSingleItem(event) {
    event.preventDefault()
    const label = this.singleInputTarget.value.trim()
    if (label.length === 0) return

    this.itemsForMode().push(this.buildItem(label))
    this.singleInputTarget.value = ""
    this.persistAndRender()
  }

  addBulkItems(event) {
    event.preventDefault()
    const labels = this.bulkInputTarget.value
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean)

    if (labels.length === 0) return

    labels.forEach((label) => {
      this.itemsForMode().push(this.buildItem(label))
    })

    this.bulkInputTarget.value = ""
    this.persistAndRender()
  }

  toggleUsed(event) {
    this.markUsed(event.params.id, event.target.checked)
    this.persistAndRender()
  }

  removeItem(event) {
    const items = this.itemsForMode()
    const index = items.findIndex((item) => item.id === event.params.id)
    if (index === -1) return

    items.splice(index, 1)
    this.persistAndRender()
  }

  resetMode() {
    this.itemsForMode().forEach((item) => {
      item.used = false
    })
    this.resultTarget.textContent = "Ready"
    this.resultMetaTarget.textContent = "抽選すると、ここに結果が表示されます。"
    this.persistAndRender()
  }

  resetAll() {
    this.state = this.normalizeState(this.initialStateValue)
    this.currentMode = "names"
    this.rotation = 0
    this.wheelTarget.style.transform = "rotate(0deg)"
    this.resultTarget.textContent = "Ready"
    this.resultMetaTarget.textContent = "抽選すると、ここに結果が表示されます。"
    this.persistAndRender()
  }

  modeConfig() {
    return this.state[this.currentMode]
  }

  itemsForMode(mode = this.currentMode) {
    return this.state[mode].items
  }

  activeItems(mode = this.currentMode) {
    return this.itemsForMode(mode).filter((item) => !item.used)
  }

  usedItems(mode = this.currentMode) {
    return this.itemsForMode(mode).filter((item) => item.used)
  }

  buildItem(label) {
    return {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      label,
      used: false
    }
  }

  markUsed(id, used, mode = this.currentMode) {
    const item = this.itemsForMode(mode).find((entry) => entry.id === id)
    if (item) item.used = used
  }

  persistAndRender() {
    this.saveState()
    this.render()
  }

  render() {
    this.renderModeButtons()
    this.renderWheel()
    this.renderSummary()
    this.renderLists()
  }

  renderModeButtons() {
    this.element.querySelectorAll("[data-mode-tab]").forEach((button) => {
      const active = button.dataset.modeTab === this.currentMode
      button.dataset.active = active ? "true" : "false"
    })
  }

  renderWheel() {
    const items = this.activeItems()

    if (items.length === 0) {
      this.emptyTarget.classList.remove("hidden")
      this.emptyTarget.classList.add("flex")
      this.wheelLabelsTarget.innerHTML = ""
      this.wheelTarget.style.background = "linear-gradient(135deg, #f8fafc, #e2e8f0)"
      this.spinButtonTarget.disabled = true
      return
    }

    this.emptyTarget.classList.add("hidden")
    this.emptyTarget.classList.remove("flex")
    this.spinButtonTarget.disabled = this.spinning

    const palette = ["#fca5a5", "#fcd34d", "#86efac", "#93c5fd", "#a5b4fc", "#fdba74", "#99f6e4", "#f5d0fe"]
    const labelsMarkup = []
    const step = 360 / items.length
    const gradientStops = items.map((item, index) => {
      const start = index * step
      const finish = (index + 1) * step
      const color = palette[index % palette.length]
      const angle = start + step / 2

      labelsMarkup.push(
        `<div class="absolute left-1/2 top-1/2 origin-center -translate-x-1/2 -translate-y-1/2 text-center text-[11px] font-bold tracking-[0.12em] text-slate-900" style="width: 120px; transform: translate(-50%, -50%) rotate(${angle}deg) translateY(-148px) rotate(90deg);">${this.escapeHtml(item.label)}</div>`
      )

      return `${color} ${start}deg ${finish}deg`
    })

    this.wheelTarget.style.background = `conic-gradient(${gradientStops.join(", ")})`
    this.wheelLabelsTarget.innerHTML = labelsMarkup.join("")
  }

  renderSummary() {
    const config = this.modeConfig()
    const total = this.itemsForMode().length
    const remaining = this.activeItems().length
    const used = this.usedItems().length

    this.summaryTarget.innerHTML = `
      <div>
        <p class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">${this.escapeHtml(config.label)}</p>
        <p class="mt-2 text-sm text-slate-600">${this.escapeHtml(config.description)}</p>
      </div>
      <div class="grid grid-cols-3 gap-3 text-center">
        <div class="rounded-2xl bg-slate-100 px-3 py-4">
          <div class="text-xs uppercase tracking-[0.2em] text-slate-500">Total</div>
          <div class="mt-1 text-2xl font-semibold text-slate-900">${total}</div>
        </div>
        <div class="rounded-2xl bg-emerald-50 px-3 py-4">
          <div class="text-xs uppercase tracking-[0.2em] text-emerald-700">Remain</div>
          <div class="mt-1 text-2xl font-semibold text-emerald-900">${remaining}</div>
        </div>
        <div class="rounded-2xl bg-rose-50 px-3 py-4">
          <div class="text-xs uppercase tracking-[0.2em] text-rose-700">Used</div>
          <div class="mt-1 text-2xl font-semibold text-rose-900">${used}</div>
        </div>
      </div>
    `
  }

  renderLists() {
    this.activeListTarget.innerHTML = this.renderItems(this.activeItems(), false)
    this.usedListTarget.innerHTML = this.renderItems(this.usedItems(), true)
  }

  renderItems(items, used) {
    if (items.length === 0) {
      return `<div class="rounded-2xl border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500">${used ? "まだ使用済みはありません。" : "追加するか、リセットしてください。"}</div>`
    }

    return items.map((item) => `
      <label class="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <span class="flex items-center gap-3">
          <input
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
            ${used ? "checked" : ""}
            data-action="change->day081-roulette#toggleUsed"
            data-day081-roulette-id-param="${item.id}"
          >
          <span class="font-medium text-slate-800">${this.escapeHtml(item.label)}</span>
        </span>
        <button
          type="button"
          class="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 transition hover:border-slate-400 hover:text-slate-900"
          data-action="click->day081-roulette#removeItem"
          data-day081-roulette-id-param="${item.id}"
        >
          Remove
        </button>
      </label>
    `).join("")
  }

  loadState() {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return this.normalizeState(this.initialStateValue)

    try {
      return this.normalizeState(JSON.parse(saved))
    } catch (_error) {
      return this.normalizeState(this.initialStateValue)
    }
  }

  saveState() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state))
  }

  normalizeState(rawState) {
    const baseState = this.initialStateValue

    return Object.fromEntries(
      Object.keys(baseState).map((key) => {
        const config = rawState[key] || baseState[key]
        const items = (config.items || []).map((item) => {
          if (typeof item === "string") {
            return this.buildItem(item)
          }

          return {
            id: item.id || this.buildItem(item.label).id,
            label: item.label,
            used: Boolean(item.used)
          }
        })

        return [key, {
          label: config.label,
          description: config.description,
          items
        }]
      })
    )
  }

  escapeHtml(value) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;")
  }
}
