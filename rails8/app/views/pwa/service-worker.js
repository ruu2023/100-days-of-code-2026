self.addEventListener("push", async (event) => {
  const payload = event.data ? await event.data.json() : {}
  const title = payload.title || "Day083 Diary"
  const options = payload.options || {
    body: "1日の記録を残す時間です。",
    data: { path: "/day083" }
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      const targetPath = event.notification.data?.path || "/day083"

      for (const client of clientList) {
        const clientPath = new URL(client.url).pathname

        if (clientPath === targetPath && "focus" in client) {
          return client.focus()
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetPath)
      }
    })
  )
})
