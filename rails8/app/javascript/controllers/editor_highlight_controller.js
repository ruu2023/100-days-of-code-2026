import { Controller } from "@hotwired/stimulus"

const KEYWORDS = /\b(?:BEGIN|END|alias|and|begin|break|case|class|def|defined\?|do|else|elsif|end|ensure|false|for|if|in|module|next|nil|not|or|redo|rescue|retry|return|self|super|then|true|undef|unless|until|when|while|yield|require|puts)\b/g
const COMMENTS = /#[^\n]*/g
const STRINGS = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g
const SYMBOLS = /:\w+[!?=]?/g
const CONSTANTS = /\b[A-Z][A-Za-z0-9_:]*\b/g
const NUMBERS = /\b\d+(?:\.\d+)?\b/g

export default class extends Controller {
  static targets = ["input", "preview"]

  connect() {
    this.render()
  }

  render() {
    const code = this.inputTarget.value

    this.previewTarget.innerHTML = this.highlight(code)
    this.syncScroll()
  }

  syncScroll() {
    this.previewTarget.scrollTop = this.inputTarget.scrollTop
    this.previewTarget.scrollLeft = this.inputTarget.scrollLeft
  }

  highlight(code) {
    const tokens = []
    let html = this.escape(code)

    const patterns = [
      [STRINGS, "token-string"],
      [COMMENTS, "token-comment"],
      [SYMBOLS, "token-symbol"],
      [KEYWORDS, "token-keyword"],
      [CONSTANTS, "token-constant"],
      [NUMBERS, "token-number"]
    ]

    patterns.forEach(([pattern, className]) => {
      html = html.replace(pattern, (match) => {
        const key = `__token_${tokens.length}__`
        tokens.push(`<span class="${className}">${match}</span>`)
        return key
      })
    })

    tokens.forEach((token, index) => {
      html = html.replace(`__token_${index}__`, token)
    })

    return `${html}\n`
  }

  escape(code) {
    return code
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
  }
}
