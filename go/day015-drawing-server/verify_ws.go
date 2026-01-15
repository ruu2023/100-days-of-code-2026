package main

import (
	"log"
	"time"

	"github.com/gorilla/websocket"
)

func main() {
	url := "ws://localhost:8080/ws"

	// Client 1
	c1, _, err := websocket.DefaultDialer.Dial(url, nil)
	if err != nil {
		log.Fatal("Client 1 connect error:", err)
	}
	defer c1.Close()

	// Client 2
	c2, _, err := websocket.DefaultDialer.Dial(url, nil)
	if err != nil {
		log.Fatal("Client 2 connect error:", err)
	}
	defer c2.Close()

	log.Println("Both clients connected")

	// Read loop for Client 2
	done := make(chan bool)
	go func() {
		defer close(done)
		_, message, err := c2.ReadMessage()
		if err != nil {
			log.Println("Client 2 read error:", err)
			return
		}
		log.Printf("Client 2 received: %s", message)
	}()

	// Client 1 sends message
	msg := []byte(`{"x":100,"y":100,"prevX":90,"prevY":90,"color":"#000000","isDrawing":true}`)
	log.Println("Client 1 sending message...")
	err = c1.WriteMessage(websocket.TextMessage, msg)
	if err != nil {
		log.Fatal("Client 1 write error:", err)
	}

	// Wait for Client 2 to receive
	select {
	case <-done:
		log.Println("Test Passed: Client 2 received message")
	case <-time.After(2 * time.Second):
		log.Fatal("Test Failed: Timeout waiting for message")
	}
}
