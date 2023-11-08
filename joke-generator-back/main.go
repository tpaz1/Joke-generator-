package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"

	_ "github.com/lib/pq"
)

const (
	host     = "localhost"
	port     = 5432
	user     = "tompaz"
	password = "password"
	dbname   = "jokedb"
        )

type Joke struct {
	ID   int    `json:"id"`
	Text string `json:"text"`
}

var db *sql.DB

func init() {
	// Replace with your MySQL connection information.
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s "+
    "password=%s dbname=%s sslmode=disable",
    host, port, user, password, dbname)
}
	db, err := sql.Open("mysql", "username:password@tcp(your_mysql_host:your_mysql_port)/your_database")
	if err != nil {
		panic(err)
	}

	// Check the connection
	err = db.Ping()
	if err != nil {
		panic(err)
	}
	fmt.Println("Connected to the database")
}

func AddJoke(w http.ResponseWriter, r *http.Request) {
	var newJoke Joke
	if err := json.NewDecoder(r.Body).Decode(&newJoke); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	_, err := db.Exec("INSERT INTO jokes (text) VALUES (?)", newJoke.Text)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func GetRandomJoke(w http.ResponseWriter, r *http.Request) {
	var joke Joke
	err := db.QueryRow("SELECT * FROM jokes ORDER BY RAND() LIMIT 1").Scan(&joke.ID, &joke.Text)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Encode and send the joke as JSON response
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(joke); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func main() {
	r := mux.NewRouter()

	r.HandleFunc("/addjoke", AddJoke).Methods("POST")
	r.HandleFunc("/getrandomjoke", GetRandomJoke).Methods("GET")

	http.Handle("/", r)
	http.ListenAndServe(":8080", nil)
}
