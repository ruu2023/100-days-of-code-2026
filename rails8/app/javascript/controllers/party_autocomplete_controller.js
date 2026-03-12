import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "results", "hiddenId", "quickAddFrame"]
  static values = {
    searchUrl: String,
    partyType: { type: String, default: "client" }
  }

  connect() {
    this.timeout = null
    this._boundCloseResults = this.closeResults.bind(this)
    document.addEventListener("click", this._boundCloseResults)
  }

  disconnect() {
    document.removeEventListener("click", this._boundCloseResults)
  }

  async search(event) {
    const query = this.inputTarget.value.trim()

    // Clear previous timeout
    if (this.timeout) {
      clearTimeout(this.timeout)
    }

    // Hide if input is empty
    if (query.length === 0) {
      this.hideResults()
      return
    }

    // Debounce search
    this.timeout = setTimeout(() => {
      this.performSearch(query)
    }, 150)
  }

  async performSearch(query) {
    try {
      const url = new URL(this.searchUrlValue)
      url.searchParams.set("query", query)
      url.searchParams.set("type", this.partyTypeValue)

      const response = await fetch(url.toString(), {
        headers: {
          "Accept": "text/html"
        }
      })

      if (response.ok) {
        const html = await response.text()
        this.resultsTarget.innerHTML = html
        this.showResults()
      }
    } catch (error) {
      console.error("Search error:", error)
    }
  }

  selectParty(event) {
    const partyId = event.currentTarget.dataset.partyId
    const partyName = event.currentTarget.dataset.partyName

    this.inputTarget.value = partyName
    this.hiddenIdTarget.value = partyId
    this.hideResults()

    // Trigger change event for any listeners
    this.hiddenIdTarget.dispatchEvent(new Event("change", { bubbles: true }))
  }

  async quickAdd(event) {
    event.preventDefault()
    event.stopPropagation()

    const name = this.inputTarget.value.trim()
    if (!name) return

    // Open quick add in turbo frame
    const url = new URL("/parties/quick_new", window.location.origin)
    url.searchParams.set("name", name)
    url.searchParams.set("party_type", this.partyTypeValue)

    // Navigate the turbo frame to the quick add form
    const frame = this.quickAddFrameTarget
    if (frame) {
      frame.src = url.toString()
      frame.classList.remove("hidden")
    }
  }

  handleQuickCreateSuccess(event) {
    const party = event.detail

    if (party && party.id && party.name) {
      this.inputTarget.value = party.name
      this.hiddenIdTarget.value = party.id
      this.hideResults()

      // Hide the quick add frame
      if (this.quickAddFrameTarget) {
        this.quickAddFrameTarget.classList.add("hidden")
        this.quickAddFrameTarget.src = ""
      }
    }
  }

  showResults() {
    this.resultsTarget.classList.remove("hidden")
  }

  hideResults() {
    this.resultsTarget.classList.add("hidden")
  }

  closeResults(event) {
    if (!this.element.contains(event.target)) {
      this.hideResults()
    }
  }

  // Called when turbo frame loads
  onFrameLoad() {
    // Focus the name field in the quick add form
    const nameInput = this.quickAddFrameTarget?.contentDocument?.querySelector('input[name="party[name]"]')
    if (nameInput) {
      nameInput.focus()
    }
  }
}
