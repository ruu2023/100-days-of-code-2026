import { Controller } from "@hotwired/stimulus"

const PERMISSION_KEY = "day083-diary-notification-permission"
const TIME_KEY = "day083-diary-reminder-time"

export default class extends Controller {
  static targets = ["permissionButton", "reminderTime", "status"]
  static values = {
    reminderTitle: String,
    reminderBody: String
  }

  connect() {
    this.timeoutId = null
    this.loadReminderTime()
    this.updateStatus()
    this.registerServiceWorker()
    this.scheduleReminder()
  }

  disconnect() {
    if (this.timeoutId) clearTimeout(this.timeoutId)
  }

  async requestPermission() {
    if (!("Notification" in window)) {
      this.statusTarget.textContent = "このブラウザは通知 API に対応していません。"
      return
    }

    const result = await Notification.requestPermission()
    localStorage.setItem(PERMISSION_KEY, result)
    this.updateStatus()
    this.scheduleReminder()
  }

  saveReminderTime() {
    localStorage.setItem(TIME_KEY, this.reminderTimeTarget.value)
    this.updateStatus()
    this.scheduleReminder()
  }

  async sendTestNotification() {
    if (!this.notificationGranted()) {
      await this.requestPermission()
      if (!this.notificationGranted()) return
    }

    await this.showNotification("Day083 Diary", {
      body: "通知は有効です。思いついた今のうちに1行書いておきましょう。",
      tag: "day083-diary-test",
      data: { path: "/day083" }
    })
  }

  loadReminderTime() {
    const saved = localStorage.getItem(TIME_KEY)
    if (saved) this.reminderTimeTarget.value = saved
  }

  updateStatus() {
    const permission = this.currentPermission()
    const time = this.reminderTimeTarget.value

    if (permission === "unsupported") {
      this.statusTarget.textContent = "このブラウザは通知に対応していません。"
      this.permissionButtonTarget.textContent = "通知は未対応です"
      return
    }

    if (permission === "granted") {
      this.statusTarget.textContent = `${time} に通知する設定です。`
      this.permissionButtonTarget.textContent = "通知は有効です"
      return
    }

    if (permission === "denied") {
      this.statusTarget.textContent = "通知が拒否されています。ブラウザ設定から再度許可してください。"
      this.permissionButtonTarget.textContent = "通知が拒否されています"
      return
    }

    this.statusTarget.textContent = `${time} の通知を使うには許可が必要です。`
    this.permissionButtonTarget.textContent = "通知を有効化"
  }

  notificationGranted() {
    return this.currentPermission() === "granted"
  }

  currentPermission() {
    if (!("Notification" in window)) return "unsupported"

    return Notification.permission || localStorage.getItem(PERMISSION_KEY) || "default"
  }

  async registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return

    try {
      this.serviceWorkerRegistration = await navigator.serviceWorker.register("/service-worker")
    } catch (error) {
      console.error("Failed to register service worker", error)
    }
  }

  scheduleReminder() {
    if (this.timeoutId) clearTimeout(this.timeoutId)
    if (!this.notificationGranted()) return

    const [hours, minutes] = this.reminderTimeTarget.value.split(":").map(Number)
    const now = new Date()
    const nextReminder = new Date()

    nextReminder.setHours(hours, minutes, 0, 0)
    if (nextReminder <= now) nextReminder.setDate(nextReminder.getDate() + 1)

    const delay = nextReminder.getTime() - now.getTime()

    this.timeoutId = setTimeout(() => {
      this.showNotification(this.reminderTitleValue, {
        body: this.reminderBodyValue,
        tag: "day083-diary-reminder",
        data: { path: "/day083" }
      })
      this.scheduleReminder()
    }, delay)

    this.updateStatus()
  }

  async showNotification(title, options) {
    if (this.serviceWorkerRegistration) {
      await this.serviceWorkerRegistration.showNotification(title, options)
      return
    }

    new Notification(title, options)
  }
}
