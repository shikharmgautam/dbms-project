package handlers

import (
	"backend/db"
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetApplications(c *gin.Context) {
	student := c.Query("student_id")
	filter := map[string]interface{}{}
	if student != "" {
		filter["student_id"] = student
	}
	cur, err := db.DB.Collection("applications").Find(context.Background(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "list failed"})
		return
	}
	var out []db.Application
	if err := cur.All(context.Background(), &out); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "decode failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": out})
}

func CreateApplication(c *gin.Context) {
	var a db.Application
	if err := c.BindJSON(&a); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid"})
		return
	}
	if a.ID == "" {
		a.ID = uuid.New().String()
	}
	a.CreatedAt = time.Now().Format(time.RFC3339)
	_, err := db.DB.Collection("applications").InsertOne(context.Background(), a)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "insert failed"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": a})
}
