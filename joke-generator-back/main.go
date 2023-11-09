package main

import (
	"log"
	"math/rand"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
)

// Joke model
type Joke struct {
	gorm.Model
	Text string `json:"text" gorm:"unique"`
}

var db *gorm.DB
var err error

func main() {
	// Connect to the PostgreSQL database
	db, err = gorm.Open("postgres", "host=localhost port=5432 user=goapp dbname=jokedb sslmode=disable password=password")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// AutoMigrate will create the table based on the Joke struct
	db.AutoMigrate(&Joke{})
	db = db.Set("gorm:table_options", "DISABLE_ROWLEVEL_SECURITY")

	// Initialize the Gin router
	router := gin.Default()
	router.Use(cors.Default())

	// Define routes
	router.POST("/addjoke", addJoke)
	router.GET("/getrandomjoke", getRandomJoke)

	// Start the server
	router.Run(":8080")
}

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

	// Save the new joke to the database
	if err := db.Create(&newJoke).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		log.Println("error: couldnt save to DB")
		return
	}

	c.JSON(http.StatusCreated, newJoke)
}

func getRandomJoke(c *gin.Context) {
	var joke Joke

	// Get the total number of jokes in the database
	var count int
	db.Model(&Joke{}).Count(&count)

	// Generate a random number within the range of the total number of jokes
	randomID := rand.Intn(count) + 1

	// Retrieve a random joke from the database
	db.First(&joke, randomID)

	log.Println("Randomly picked joke:", joke.Text, "from DB")

	c.JSON(http.StatusOK, joke)
}
