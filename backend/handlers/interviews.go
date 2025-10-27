package handlers

import (
	"backend/db"
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Interview struct {
	ID            string `bson:"_id,omitempty" json:"id"`
	ApplicationID string `bson:"application_id" json:"application_id"`
	ScheduledAt   string `bson:"scheduled_at" json:"scheduled_at"`
	Location      string `bson:"location,omitempty" json:"location"`
	Mode          string `bson:"mode,omitempty" json:"mode"`
	CreatedAt     string `bson:"created_at,omitempty" json:"created_at"`
}

// CreateInterview creates an interview record and marks application as interview_scheduled
func CreateInterview(c *gin.Context) {
	var in Interview
	if err := c.BindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid"})
		return
	}
	if in.ID == "" {
		in.ID = uuid.New().String()
	}
	in.CreatedAt = time.Now().Format(time.RFC3339)

	rec := map[string]interface{}{
		"id":             in.ID,
		"application_id": in.ApplicationID,
		"scheduled_at":   in.ScheduledAt,
		"location":       in.Location,
		"mode":           in.Mode,
		"created_at":     in.CreatedAt,
	}

	if db.UseInMemory {
		if err := db.CreateInterviewRecord(rec); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "insert failed"})
			return
		}
	} else {
		_, err := db.DB.Collection("interviews").InsertOne(context.Background(), in)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "insert failed"})
			return
		}
		// update application status in Mongo
		if in.ApplicationID != "" {
			_, _ = db.DB.Collection("applications").UpdateOne(context.Background(), map[string]interface{}{"_id": in.ApplicationID}, map[string]interface{}{"$set": map[string]interface{}{"status": "interview_scheduled", "updated_at": time.Now().Format(time.RFC3339)}})
		}
	}

	c.JSON(http.StatusCreated, gin.H{"data": in})
}
