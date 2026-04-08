self.addEventListener("push", async (event) => {
  console.log("Push event received", event);
  let payload = {};
  if (event.data) {
    try {
      payload = await event.data.json();
      console.log("Push payload:", payload);
    } catch (e) {
      console.error("Failed to parse push data as JSON:", e);
      payload = { title: "Error", options: { body: event.data.text() } };
    }
  }

  const title = payload.title || "Day083 Diary"
  const options = payload.options || {
    body: "1日の記録を残す時間です。",
    data: { path: "/day083" }
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => console.log("Notification shown"))
      .catch((err) => console.error("Failed to show notification:", err))
  );
})

self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked", event);
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
