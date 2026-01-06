import { Controller } from "@hotwired/stimulus";

// Connects to data-controller="submit-on-enter"
export default class extends Controller {
  // フォーム内の Enter キーを監視
  submit(event) {
    // IME入力中（日本語変換確定など）のEnterは無視する
    if (event.isComposing) return;

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      // 直近のフォームを探して送信（requestSubmitを使うとTurboが反応する）
      this.element.form.requestSubmit();
    }
  }
}
