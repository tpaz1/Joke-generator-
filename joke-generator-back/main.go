package main

import (
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
)

// Joke model represents the structure of the Joke entity in the database.
type Joke struct {
	gorm.Model
	Text string `json:"text" gorm:"unique"`
}

const maxRetries = 5

var db *gorm.DB
var err error

func main() {
	// Attempt to connect to the PostgreSQL database with retries
	retryCount := 0
	retryDelaySeconds := 1
	for retryCount < maxRetries {
		db, err = gorm.Open("postgres", "host=postgres port=5432 user=goapp dbname=jokedb sslmode=disable password=password")
		if err == nil {
			break
		}

		log.Printf("Error connecting to the database (retry %d/%d): %s", retryCount+1, maxRetries, err.Error())
		time.Sleep(time.Duration(retryDelaySeconds) * time.Second)
		retryDelaySeconds = 2 * retryDelaySeconds
		retryCount++
	}

	if err != nil {
		log.Fatalf("Failed to connect to the database after %d retries. Exiting.", maxRetries)
	}
	defer db.Close()

	log.SetOutput(os.Stdout)

	// AutoMigrate will create the table based on the Joke struct
	db.AutoMigrate(&Joke{})
	db = db.Set("gorm:table_options", "DISABLE_ROWLEVEL_SECURITY")

	// Initialize the Gin router
	router := gin.Default()
	router.Use(cors.Default())

	// Define routes
	router.POST("/api/addjoke", addJoke)
	router.GET("/api/getrandomjoke", getRandomJoke)

	// Start the server
	router.Run("0.0.0.0:8080")
}

// addJoke handles the HTTP POST request to add a new joke to the database.
func addJoke(c *gin.Context) {
	var jokeText struct {
		Text string `json:"addjoke"`
	}

	// Bind the JSON body to the jokeText struct
	if err := c.BindJSON(&jokeText); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if the joke with the same text already exists
	existingJoke := Joke{}
	if err := db.Where("text = ?", jokeText.Text).First(&existingJoke).Error; err == nil {
		// Joke with the same text already exists
		c.JSON(http.StatusConflict, gin.H{"error": "Joke with the same text already exists"})
		log.Println("error: Joke with the same text already exists")
		return
	}

	// Create a new joke with the provided text
	newJoke := Joke{
		Text: jokeText.Text,
	}
	log.Println("The joke - ", jokeText.Text, "was added successfully")

	// Save the new joke to the database
	if err := db.Create(&newJoke).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		log.Println("error: couldn't save to DB")
		return
	}

	c.JSON(http.StatusCreated, newJoke)
}

// getRandomJoke handles the HTTP GET request to retrieve a random joke from the database.
func getRandomJoke(c *gin.Context) {
	var joke Joke

	// Get the total number of jokes in the database
	var count int
	db.Model(&Joke{}).Count(&count)

	if count <= 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No jokes found"})
		return
	}

	// Generate a random number within the range of the total number of jokes
	randomID := rand.Intn(count) + 1

	// Retrieve a random joke from the database
	db.First(&joke, randomID)

	log.Println("Randomly picked joke:", joke.Text, "from DB")

	c.JSON(http.StatusOK, joke)
}
