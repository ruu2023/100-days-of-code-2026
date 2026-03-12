import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["container", "template"]

  add(event) {
    event.preventDefault()

    const template = this.templateTarget.innerHTML
    const container = this.containerTarget
    const index = container.children.length

    // Replace template placeholder with actual index
    let newItem = template.replace(/TEMPLATE_INDEX/g, index)
    newItem = newItem.replace(/journal_entry\[line_items_attributes\]\[TEMPLATE_INDEX\]/g,
      `journal_entry[line_items_attributes][${index}]`)
    newItem = newItem.replace(/\[TEMPLATE_INDEX\]/g, `[${index}]`)

    // Add the new line item
    container.insertAdjacentHTML("beforeend", newItem)
  }

  remove(event) {
    event.preventDefault()

    const row = event.currentTarget.closest(".line-item-row")
    const container = this.containerTarget

    // If there are more than 2 items, remove this one
    if (container.children.length > 2) {
      row.remove()
    } else {
      // Just clear the values instead of removing
      const debitInput = row.querySelector(".debit-input")
      const creditInput = row.querySelector(".credit-input")
      const accountSelect = row.querySelector("select")

      if (debitInput) debitInput.value = ""
      if (creditInput) creditInput.value = ""
      if (accountSelect) accountSelect.value = ""
    }

    // Recalculate totals
    this.dispatch("totals-changed")
  }
}
