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

func GetStudentProfiles(c *gin.Context) {
	user := c.Query("user_id")
	filter := bson.M{}
	if user != "" {
		filter["user_id"] = user
	}
	col := db.DB.Collection("student_profiles")
	cur, err := col.Find(context.Background(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list"})
		return
	}
	var out []db.StudentProfile
	if err := cur.All(context.Background(), &out); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "decode"})
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
	_, err := db.DB.Collection("student_profiles").InsertOne(context.Background(), sp)
	if err != nil {
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

	col := db.DB.Collection("student_profiles")
	if id == "" {
		// try to find by user_id in patch
		if u, ok := patch["user_id"].(string); ok && u != "" {
			// find record for user with non-empty id
			res := col.FindOne(context.Background(), bson.M{"user_id": u, "_id": bson.M{"$ne": ""}})
			var existing db.StudentProfile
			if err := res.Decode(&existing); err == nil {
				id = existing.ID
			}
		}
	}
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing id"})
		return
	}
	_, err := col.UpdateOne(context.Background(), bson.M{"_id": id}, bson.M{"$set": patch})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": patch})
}
