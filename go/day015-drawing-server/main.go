package main

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

// Upgrade HTTP connection to WebSocket
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for development
	},
}

// Message represents a drawing event
type Message struct {
	X         float64 `json:"x"`
	Y         float64 `json:"y"`
	PrevX     float64 `json:"prevX"`
	PrevY     float64 `json:"prevY"`
	Color     string  `json:"color"`
	IsDrawing bool    `json:"isDrawing"`
}

// Hub maintains the set of active clients and broadcasts messages
type Hub struct {
	clients    map[*websocket.Conn]bool
	broadcast  chan Message
	register   chan *websocket.Conn
	unregister chan *websocket.Conn
}

func newHub() *Hub {
	return &Hub{
		clients:    make(map[*websocket.Conn]bool),
		broadcast:  make(chan Message),
		register:   make(chan *websocket.Conn),
		unregister: make(chan *websocket.Conn),
	}
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
			log.Printf("Client registered. Total clients: %d", len(h.clients))
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				client.Close()
				log.Printf("Client unregistered. Total clients: %d", len(h.clients))
			}
		case message := <-h.broadcast:
			// log.Printf("Broadcasting message to %d clients", len(h.clients))
			for client := range h.clients {
				err := client.WriteJSON(message)
				if err != nil {
					log.Printf("error: %v", err)
					client.Close()
					delete(h.clients, client)
				}
			}
		}
	}
}

var hub = newHub()

func handleConnections(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer ws.Close()

	hub.register <- ws

	for {
		var msg Message
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Printf("error: %v", err)
			hub.unregister <- ws
			break
		}
		hub.broadcast <- msg
	}
}

func main() {
	go hub.run()

	http.HandleFunc("/ws", handleConnections)

	log.Println("Server started on :8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
