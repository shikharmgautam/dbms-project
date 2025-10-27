package handlers

import (
	"backend/db"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
)

func GetStudentProfiles(c *gin.Context) {
	user := c.Query("user_id")
	filter := bson.M{}
	if user != "" {
		filter["user_id"] = user
	}
	out, err := db.GetStudentProfiles(filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": out})
}

func CreateStudentProfile(c *gin.Context) {
	var sp db.StudentProfile
	if err := c.BindJSON(&sp); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid"})
		return
	}
	if sp.ID == "" {
		sp.ID = uuid.New().String()
	}
	now := time.Now().Format(time.RFC3339)
	sp.CreatedAt = now
	sp.UpdatedAt = now
	if err := db.CreateStudentProfile(sp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "insert failed"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": sp})
}

func UpdateStudentProfile(c *gin.Context) {
	id := c.Param("id")
	var patch map[string]interface{}
	if err := c.BindJSON(&patch); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid"})
		return
	}
	patch["updated_at"] = time.Now().Format(time.RFC3339)

	if id == "" {
		if u, ok := patch["user_id"].(string); ok && u != "" {
			// try to find existing student profile for user
			rows, err := db.GetStudentProfiles(map[string]interface{}{"user_id": u})
			if err == nil && len(rows) > 0 {
				id = rows[0].ID
			}
		}
	}
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing id"})
		return
	}
	if err := db.UpdateStudentProfile(id, patch); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": patch})
}
