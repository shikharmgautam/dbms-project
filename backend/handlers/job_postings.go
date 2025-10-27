package handlers

import (
	"backend/db"
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
)

func GetJobPostings(c *gin.Context) {
	col := db.DB.Collection("job_postings")
	cur, err := col.Find(context.Background(), bson.M{"status": "active"})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "list failed"})
		return
	}
	var out []db.JobPosting
	if err := cur.All(context.Background(), &out); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "decode failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": out})
}

func CreateJobPosting(c *gin.Context) {
	var j db.JobPosting
	if err := c.BindJSON(&j); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid"})
		return
	}
	if j.ID == "" {
		j.ID = uuid.New().String()
	}
	if j.Status == "" {
		j.Status = "active"
	}
	j.CreatedAt = time.Now().Format(time.RFC3339)
	_, err := db.DB.Collection("job_postings").InsertOne(context.Background(), j)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "insert failed"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": j})
}
