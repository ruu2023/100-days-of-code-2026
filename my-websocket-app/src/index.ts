import { Hono } from 'hono'
import { cors } from 'hono/cors'

// -----------------------------------------------------------------------------
// Type Definitions
// -----------------------------------------------------------------------------

type Bindings = {
  CHAT_ROOM: DurableObjectNamespace
}

// -----------------------------------------------------------------------------
// Hono Application Setup
// -----------------------------------------------------------------------------

const app = new Hono<{ Bindings: Bindings }>()

// Apply CORS middleware globally
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}))

// WebSocket Upgrade Endpoint
app.get('/ws', async (c) => {
  const upgradeHeader = c.req.header('Upgrade')
  if (upgradeHeader !== 'websocket') {
    return c.text('Not a websocket request', 426)
  }

  // Use a stable ID for the global chat room
  const id = c.env.CHAT_ROOM.idFromName('global-room')
  const obj = c.env.CHAT_ROOM.get(id)

  return obj.fetch(c.req.raw)
})

export default app

// -----------------------------------------------------------------------------
// Durable Object: ChatRoom
// -----------------------------------------------------------------------------

export class ChatRoom implements DurableObject {
  private sessions = new Set<WebSocket>()

  constructor(private ctx: DurableObjectState, private env: Bindings) {
    // Initialize SQLite database schema
    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
  }

  async fetch(request: Request) {
    const pair = new WebSocketPair()
    const [client, server] = Object.values(pair)
    
    this.handleSession(server)
    
    return new Response(null, { status: 101, webSocket: client })
  }

  /**
   * Broadcasts a message to all connected clients.
   * Removes visible disconnected sessions during the process.
   */
  broadcast(data: object) {
    const payload = JSON.stringify(data)
    for (const session of this.sessions) {
      try {
        session.send(payload)
      } catch (e) {
        this.sessions.delete(session)
      }
    }
  }

  /**
   * Handles a new WebSocket session.
   */
  handleSession(ws: WebSocket) {
    ws.accept()
    this.sessions.add(ws)

    // Retrieve recent message history from SQLite
    const history = this.ctx.storage.sql.exec(
      "SELECT content FROM messages ORDER BY id DESC LIMIT 10"
    )

    // Send history to the new client (oldest first)
    for (const row of Array.from(history).reverse()) {
      ws.send(JSON.stringify({ type: 'msg', value: row.content }))
    }

    // Broadcast updated user count
    this.broadcast({ type: 'count', value: this.sessions.size })

    ws.addEventListener('message', (event) => {
      const msgText = `${event.data}`

      if (msgText === '/clear') {
        // Clear all messages from SQLite
        this.ctx.storage.sql.exec("DELETE FROM messages")
        // Broadcast clear event to all clients
        this.broadcast({ type: 'clear' })
      } else {
        // Persist message to SQLite
        this.ctx.storage.sql.exec(
          "INSERT INTO messages (content) VALUES (?)",
          msgText
        )
        // Broadcast the new message
        this.broadcast({ type: 'msg', value: msgText })
      }
    })

    ws.addEventListener('close', () => {
      this.sessions.delete(ws)
      this.broadcast({ type: 'count', value: this.sessions.size })
    })
  }
}