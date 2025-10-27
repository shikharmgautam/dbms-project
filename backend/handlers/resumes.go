package handlers

import (
	"backend/db"
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func UploadResume(c *gin.Context) {
	// accept multipart form
	file, _, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file required"})
		return
	}
	defer file.Close()

	// For demo, we won't persist the file. We'll return a fake URL and store metadata.
	id := uuid.New().String()
	url := fmt.Sprintf("/uploads/%s.pdf", id)

	studentID := c.PostForm("student_id")
	if studentID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "student_id required"})
		return
	}

	r := db.Resume{
		ID:        id,
		StudentID: studentID,
		FileURL:   url,
		CreatedAt: time.Now().Format(time.RFC3339),
	}
	_, err = db.DB.Collection("resumes").InsertOne(context.Background(), r)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "insert failed"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": r})
}

func GetResumes(c *gin.Context) {
	student := c.Query("student_id")
	filter := map[string]interface{}{}
	if student != "" {
		filter["student_id"] = student
	}
	cur, err := db.DB.Collection("resumes").Find(context.Background(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "list failed"})
		return
	}
	var out []db.Resume
	if err := cur.All(context.Background(), &out); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "decode failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": out})
}
