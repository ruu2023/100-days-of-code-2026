package main

import (
	"crypto/rand"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

var db *sql.DB

type GenerateRequest struct {
	Length         int  `json:"length"`
	IncludeSymbols bool `json:"includeSymbols"`
	IncludeNumbers bool `json:"includeNumbers"`
}

type GenerateResponse struct {
	Password string `json:"password"`
}

type SavedPassword struct {
	ID        string    `json:"id"`
	Service   string    `json:"service"`
	Password  string    `json:"password"`
	CreatedAt time.Time `json:"createdAt"`
}

type SaveRequest struct {
	Service  string `json:"service"`
	Password string `json:"password"`
}

func main() {
	var err error
	// Open SQLite database
	db, err = sql.Open("sqlite3", "./passwords.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Create table if not exists
	sqlStmt := `
	CREATE TABLE IF NOT EXISTS passwords (
		id TEXT PRIMARY KEY,
		service TEXT,
		password TEXT,
		created_at DATETIME
	);
	`
	_, err = db.Exec(sqlStmt)
	if err != nil {
		log.Printf("%q: %s\n", err, sqlStmt)
		return
	}

	http.HandleFunc("/api/generate", handleGenerate)
	http.HandleFunc("/api/passwords", handlePasswords)

	// Wrap with CORS middleware
	handler := corsMiddleware(http.DefaultServeMux)

	port := ":8080"
	fmt.Printf("Server starting on %s...\n", port)
	log.Fatal(http.ListenAndServe(port, handler))
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Allow all origins for development
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func handleGenerate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req GenerateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Defaults
	if req.Length == 0 {
		req.Length = 12
	}

	password, err := generateRandomPassword(req.Length, req.IncludeNumbers, req.IncludeSymbols)
	if err != nil {
		http.Error(w, "Failed to generate password", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(GenerateResponse{Password: password})
}

func handlePasswords(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	switch r.Method {
	case http.MethodGet:
		rows, err := db.Query("SELECT id, service, password, created_at FROM passwords ORDER BY created_at DESC")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var results []SavedPassword
		for rows.Next() {
			var p SavedPassword
			if err := rows.Scan(&p.ID, &p.Service, &p.Password, &p.CreatedAt); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			results = append(results, p)
		}
		// If empty, ensure we return [] instead of null
		if results == nil {
			results = []SavedPassword{}
		}
		json.NewEncoder(w).Encode(results)

	case http.MethodPost:
		var req SaveRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if req.Service == "" || req.Password == "" {
			http.Error(w, "Service and Password are required", http.StatusBadRequest)
			return
		}

		newEntry := SavedPassword{
			ID:        fmt.Sprintf("%d", time.Now().UnixNano()),
			Service:   req.Service,
			Password:  req.Password,
			CreatedAt: time.Now(),
		}

		stmt, err := db.Prepare("INSERT INTO passwords(id, service, password, created_at) values(?, ?, ?, ?)")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer stmt.Close()

		_, err = stmt.Exec(newEntry.ID, newEntry.Service, newEntry.Password, newEntry.CreatedAt)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(newEntry)

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func generateRandomPassword(length int, includeNumbers, includeSymbols bool) (string, error) {
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	const numbers = "0123456789"
	const symbols = "!@#$%^&*()-_=+[]{}<>?"

	chars := letters
	if includeNumbers {
		chars += numbers
	}
	if includeSymbols {
		chars += symbols
	}

	result := make([]byte, length)
	for i := 0; i < length; i++ {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(chars))))
		if err != nil {
			return "", err
		}
		result[i] = chars[num.Int64()]
	}

	return string(result), nil
}
