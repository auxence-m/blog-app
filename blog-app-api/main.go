package main

import (
	"blog-app/database"
	"blog-app/model"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	// Connect to database
	database.ConnectDB()

	// Create the Gin router
	router := gin.Default()

	// Login endpoint
	router.POST("/login", model.GetUser)

	// Creation endpoint
	router.POST("/users", model.CreateUser)
	router.POST("/posts", model.CreatePost)

	// Listing endpoints
	router.GET("/posts", model.ListPosts)
	router.GET("/posts/:id", model.GetPost)

	//Editing endpoints
	router.PUT("/posts/:id", model.UpdatePost)

	// Deletion endpoints
	router.DELETE("/posts/:id", model.DeletePost)

	err := router.SetTrustedProxies(nil)
	if err != nil {
		return
	}

	err = router.Run(":8080")
	if err != nil {
		log.Fatal(err)
	}
}
