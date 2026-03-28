import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["division", "modal", "modalTitle", "modalContent", "agentCard", "searchInput", "tabButton"]

  connect() {
    this.currentDivision = "engineering"
    this.showDivision(this.currentDivision)
  }

  // 部門切り替え
  change(event) {
    this.currentDivision = event.currentTarget.dataset.divisionId
    this.searchInputTarget.value = "" // 切り替え時に検索をリセット
    this.showDivision(this.currentDivision)
  }

  // 検索機能
  search() {
    const query = this.searchInputTarget.value.toLowerCase()
    
    if (query.length > 0) {
      // 検索中：全部門からヒットするものを表示
      this.divisionTargets.forEach(el => el.classList.remove("hidden"))
      this.agentCardTargets.forEach(card => {
        const text = card.dataset.searchText
        if (text.includes(query)) {
          card.classList.remove("hidden")
        } else {
          card.classList.add("hidden")
        }
      })
      // タブの選択解除
      this.tabButtonTargets.forEach(btn => btn.classList.remove("bg-indigo-600", "text-white", "shadow-md"))
    } else {
      // 検索なし：現在の部門のみ表示
      this.showDivision(this.currentDivision)
    }
  }

  showDivision(divisionId) {
    this.divisionTargets.forEach((el) => {
      if (el.dataset.divisionId === divisionId) {
        el.classList.remove("hidden")
      } else {
        el.classList.add("hidden")
      }
    })

    // 全カードを表示（hiddenを解除）
    this.agentCardTargets.forEach(card => card.classList.remove("hidden"))

    // アクティブなタブのスタイル更新
    this.tabButtonTargets.forEach((btn) => {
      if (btn.dataset.divisionId === divisionId) {
        btn.classList.add("bg-indigo-600", "text-white", "shadow-md")
        btn.classList.remove("bg-white", "text-slate-600")
      } else {
        btn.classList.remove("bg-indigo-600", "text-white", "shadow-md")
        btn.classList.add("bg-white", "text-slate-600")
      }
    })
  }

  // モーダル操作
  openModal(event) {
    const name = event.currentTarget.dataset.agentName
    const prompt = event.currentTarget.dataset.agentPrompt
    this.modalTitleTarget.textContent = `${name} の指示書`
    this.modalContentTarget.textContent = prompt
    this.modalTarget.classList.remove("hidden")
    this.modalTarget.classList.add("flex")
    document.body.classList.add("overflow-hidden")
  }

  closeModal() {
    this.modalTarget.classList.add("hidden")
    this.modalTarget.classList.remove("flex")
    document.body.classList.remove("overflow-hidden")
  }

  copyPrompt() {
    const text = this.modalContentTarget.textContent
    navigator.clipboard.writeText(text).then(() => {
      const btn = this.element.querySelector("[data-action*='copyPrompt']")
      const originalText = btn.textContent
      btn.textContent = "コピー完了！"
      setTimeout(() => { btn.textContent = originalText }, 2000)
    })
  }
}
