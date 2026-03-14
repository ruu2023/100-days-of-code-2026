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
    this.resultTarget.classList.add("text-gray-400");
    this.closeStream();

    const params = new URLSearchParams({ text, language });
    this.eventSource = new EventSource(`/convert/stream?${params.toString()}`);

    this.eventSource.onmessage = (event) => {
      if (this.resultTarget.classList.contains("text-gray-400")) {
        this.resultTarget.textContent = "";
        this.resultTarget.classList.remove("text-gray-400");
      }
      this.resultTarget.textContent += event.data;
    };

    this.eventSource.addEventListener("done", () => {
      this.closeStream();
    });

    this.eventSource.addEventListener("error", (event) => {
      console.error("EventSource error:", event);
      if (this.resultTarget.textContent === "Translating...") {
        this.resultTarget.textContent = "Error occurred during translation.";
        this.resultTarget.classList.add("text-red-500");
      }
      this.closeStream();
    });
  }

  copy(event) {
    const text = this.resultTarget.textContent;
    if (!text || text === "Translating..." || text.startsWith("Error")) return;

    const button = event.currentTarget;
    navigator.clipboard.writeText(text).then(() => {
      const originalContent = button.innerHTML;
      button.innerHTML = `
        <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
        Copied!
      `;
      button.classList.add("text-green-600", "bg-green-50");
      button.classList.remove("text-blue-600", "hover:bg-blue-50");

      setTimeout(() => {
        button.innerHTML = originalContent;
        button.classList.remove("text-green-600", "bg-green-50");
        button.classList.add("text-blue-600", "hover:bg-blue-50");
      }, 2000);
    });
  }

  closeStream() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}
