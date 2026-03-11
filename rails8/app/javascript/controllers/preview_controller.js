import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["output"]

  connect() {
    this.urls = []
  }

  display(event) {
    const input = event.target
    const files = Array.from(input.files)

    // Revoke old URLs to prevent memory leaks
    this.urls.forEach(url => URL.revokeObjectURL(url))
    this.urls = []

    if (files.length === 0) return

    // Clear previous previews
    this.outputTarget.innerHTML = ""

    files.forEach((file, index) => {
      const url = URL.createObjectURL(file)
      this.urls.push(url)

      const container = document.createElement("div")
      container.className = "relative group"

      if (file.type.startsWith("image/")) {
        const img = document.createElement("img")
        img.src = url
        img.className = "w-full h-32 object-cover rounded-lg"
        img.alt = "Image preview"
        container.appendChild(img)
      } else if (file.type.startsWith("video/")) {
        const video = document.createElement("video")
        video.src = url
        video.className = "w-full h-32 max-h-32 object-cover rounded-lg"
        video.controls = true
        video.loop = true
        video.muted = true
        video.playsInline = true
        video.preload = "metadata"
        container.appendChild(video)
      }

      // Remove button
      const removeBtn = document.createElement("button")
      removeBtn.type = "button"
      removeBtn.innerHTML = "&times;"
      removeBtn.className = "absolute top-1 right-1 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
      removeBtn.onclick = (e) => {
        e.preventDefault()
        this.removeFile(index)
      }
      container.appendChild(removeBtn)

      this.outputTarget.appendChild(container)
    })
  }

  removeFile(index) {
    // Revoke the URL being removed
    if (this.urls[index]) {
      URL.revokeObjectURL(this.urls[index])
      this.urls.splice(index, 1)
    }

    const input = this.element.querySelector('input[type="file"]')
    const dt = new DataTransfer()

    Array.from(input.files).forEach((file, i) => {
      if (i !== index) dt.items.add(file)
    })

    input.files = dt.files
    this.display({ target: input })
  }

  resetForm(event) {
    if (event.detail.success) {
      // Reset the form
      this.element.reset()

      // Clear preview area
      this.outputTarget.innerHTML = ""

      // Revoke all URLs
      this.urls.forEach(url => URL.revokeObjectURL(url))
      this.urls = []
    }
  }

  disconnect() {
    // Clean up URLs when controller is disconnected
    this.urls.forEach(url => URL.revokeObjectURL(url))
    this.urls = []
  }
}
