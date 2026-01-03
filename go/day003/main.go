package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
)

// Response defines the JSON structure for our base API response
type Response struct {
	Message string `json:"message"`
}

// Question represents a quiz question
type Question struct {
	ID       string   `json:"id"`
	Question string   `json:"question"`
	Options  []string `json:"options"`
	Answer   string   `json:"-"` // Hide answer from JSON output
}

// AnswerRequest represents the user's submitted answer
type AnswerRequest struct {
	ID     string `json:"id"`
	Answer string `json:"answer"`
}

// AnswerResponse represents the result of the answer check
type AnswerResponse struct {
	Correct     bool   `json:"correct"`
	Explanation string `json:"explanation"`
}

var questions = []Question{
	{
		ID:       "1",
		Question: "実行中のコンテナ 'web-app' に入ってシェル操作をするための正しいコマンドは？",
		Options:  []string{"docker attach web-app", "docker exec -it web-app /bin/bash", "docker run -it web-app /bin/bash", "docker enter web-app"},
		Answer:   "docker exec -it web-app /bin/bash",
	},
	{
		ID:       "2",
		Question: "Docker Composeで、設定ファイルの変更後にコンテナを再作成して起動し直すコマンドは？",
		Options:  []string{"docker-compose up", "docker-compose up --build", "docker-compose restart", "docker-compose reload"},
		Answer:   "docker-compose up --build",
	},
	{
		ID:       "3",
		Question: "ホストのポート8080をコンテナのポート80にバインドして起動する場合の正しいオプションは？",
		Options:  []string{"-p 8080:80", "-p 80:8080", "-P 8080", "--expose 8080:80"},
		Answer:   "-p 8080:80",
	},
	{
		ID:       "4",
		Question: "Dockerfileで定義した環境変数を、docker run時に上書きするためのオプションは？",
		Options:  []string{"-e KEY=VALUE", "--env-file .env", "-v KEY:VALUE", "--arg KEY=VALUE"},
		Answer:   "-e KEY=VALUE",
	},
	{
		ID:       "5",
		Question: "不要になった停止中のコンテナ、未使用のネットワーク、danglingイメージを一括削除するコマンドは？",
		Options:  []string{"docker clean --all", "docker system prune", "docker rm -f $(docker ps -aq)", "docker image prune -a"},
		Answer:   "docker system prune",
	},
}

func main() {
	// Seed the random number generator
	// rand.Seed(time.Now().UnixNano())
	// Go 1.2.0 以降は rand.Seed() が不要になったらしい。コメントアウトします。

	// Define handlers are registered in mux below

	// Start server
	port := ":8080"
	fmt.Printf("Server starting on http://localhost%s\n", port)
	
	mux := http.NewServeMux()
	mux.HandleFunc("/", homeHandler)
	mux.HandleFunc("/api/hello", helloHandler)
	mux.HandleFunc("/quiz", quizHandler)
	mux.HandleFunc("/quiz/check", checkHandler)
	
	// Wrap with CORS middleware
	handler := enableCORS(mux)

	if err := http.ListenAndServe(port, handler); err != nil {
		log.Fatal(err)
	}
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000") // Allow Next.js dev server
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// Handle preflight requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	fmt.Fprintf(w, "Welcome to the Day 3 Go API! Try /api/hello or /quiz")
}

func helloHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	response := Response{Message: "Hello from Go!"}

	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func quizHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Select a random question
	q := questions[rand.Intn(len(questions))]

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(q); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func checkHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req AnswerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var found bool
	var correct bool
	var explanation string

	for _, q := range questions {
		if q.ID == req.ID {
			found = true
			if q.Answer == req.Answer {
				correct = true
				explanation = "正解です！"
			} else {
				correct = false
				explanation = fmt.Sprintf("不正解です... 正しい答えは「%s」でした。", q.Answer)
			}
			break
		}
	}

	if !found {
		http.Error(w, "Question not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	resp := AnswerResponse{
		Correct:     correct,
		Explanation: explanation,
	}

	if err := json.NewEncoder(w).Encode(resp); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
