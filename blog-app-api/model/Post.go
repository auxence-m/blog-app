package model

import (
	"blog-app/database"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Post struct {
	gorm.Model
	AuthorID int    `json:"authorId"`
	Title    string `json:"title"`
	Content  string `json:"content"`
	Category string `json:"category"`
}

func CreatePost(context *gin.Context) {
	// Parse JSON request body into Post struct
	var post Post
	if err := context.ShouldBindJSON(&post); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Migrate the database schema
	err := database.DB.AutoMigrate(&Post{})
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Insert post into database using gorm
	result := database.DB.Create(&post)
	if result.Error != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": result.Error.Error()})
		return
	}

	// Confirm post has been created
	context.JSON(http.StatusOK, gin.H{"message": "Blog post created successfully", "postID": post.ID})
}

func ListPosts(context *gin.Context) {
	// Create a slice of Posts
	var posts []Post

	// Migrate the database schema
	err := database.DB.AutoMigrate(&Post{})
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Query database for posts
	result := database.DB.Find(&posts)
	if result.Error != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": result.Error.Error()})
		return
	}

	// Check if there are posts
	if result.RowsAffected == 0 {
		context.JSON(http.StatusNotFound, gin.H{"error": "Blog posts not found"})
		return
	}

	// Return slice of posts
	context.JSON(http.StatusOK, gin.H{"posts": posts})
}

func GetPost(context *gin.Context) {
	// Get id param from gin context
	var id = context.Param("id")

	// Create a new post
	var post Post

	// Migrate the database schema
	err := database.DB.AutoMigrate(&Post{})
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Query database for the post
	result := database.DB.First(&post, id)
	if result.Error != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Blog post not found"})
		return
	}

	// Return the post
	context.JSON(http.StatusOK, gin.H{"message": "Blog post found", "post": post})
}

func UpdatePost(context *gin.Context) {
	// Get id param from gin context
	var id = context.Param("id")

	// Create a new post
	var post Post

	// Migrate the database schema
	err := database.DB.AutoMigrate(&Post{})
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Query database for the post
	result := database.DB.First(&post, id)
	if result.Error != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Blog post not found"})
		return
	}

	// Parse JSON updated post request body into Post struct
	var updatedPost Post
	if err := context.ShouldBindJSON(&updatedPost); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	post.Title = updatedPost.Title
	post.Content = updatedPost.Content

	if err := database.DB.Save(&post).Error; err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update blog post"})
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Blog post updated", "postID": post.ID})
}

func DeletePost(context *gin.Context) {
	// Get id param from gin context
	var id = context.Param("id")

	// Create a new post
	var post Post

	// Migrate the database schema
	err := database.DB.AutoMigrate(&User{})
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Query database for the post
	result := database.DB.First(&post, id)
	if result.Error != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Blog post not found"})
		return
	}

	// Delete Post from database using gorm
	result = database.DB.Delete(&post, id)
	if result.Error != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Failed to delete blog post"})
		return
	}

	// Confirm Post has been deleted
	context.JSON(http.StatusOK, gin.H{"message": "Blog post deleted", "postID": post.ID})
}
