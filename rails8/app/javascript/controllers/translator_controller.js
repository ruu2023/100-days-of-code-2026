import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["text", "language", "result"];

  connect() {
    console.log("translator connected");
    this.eventSource = null;
  }

  disconnect() {
    this.closeStream();
  }

  submit(event) {
    event.preventDefault();
    console.log("submit intercepted");

    const text = this.textTarget.value.trim();
    const language = this.languageTarget.value;

    if (!text) return;

    this.resultTarget.textContent = "";
    this.closeStream();

    const params = new URLSearchParams({ text, language });
    this.eventSource = new EventSource(`/convert/stream?${params.toString()}`);

    this.eventSource.onmessage = (event) => {
      this.resultTarget.textContent += event.data;
    };

    this.eventSource.addEventListener("done", () => {
      this.closeStream();
    });

    this.eventSource.addEventListener("error", () => {
      this.closeStream();
    });
  }

  closeStream() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}
