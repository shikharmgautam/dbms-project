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

func GetProfiles(c *gin.Context) {
	// support ?id=eq.<id> or ?user_id=<id>
	q := c.Query("id")
	filter := bson.M{}
	if q != "" {
		// expect eq.<id>
		if len(q) > 3 && q[:3] == "eq." {
			filter["_id"] = q[3:]
		} else {
			filter["_id"] = q
		}
	} else if u := c.Query("user_id"); u != "" {
		filter["_id"] = u
	}

	col := db.DB.Collection("profiles")
	cur, err := col.Find(context.Background(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list"})
		return
	}
	var out []db.Profile
	if err := cur.All(context.Background(), &out); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to decode"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": out})
}

func CreateProfile(c *gin.Context) {
	var p db.Profile
	if err := c.BindJSON(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid"})
		return
	}
	if p.ID == "" {
		p.ID = uuid.New().String()
	}
	now := time.Now().Format(time.RFC3339)
	p.CreatedAt = now
	p.UpdatedAt = now
	_, err := db.DB.Collection("profiles").InsertOne(context.Background(), p)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "insert failed"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": p})
}

func UpdateProfile(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing id"})
		return
	}
	var patch map[string]interface{}
	if err := c.BindJSON(&patch); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	patch["updated_at"] = time.Now().Format(time.RFC3339)
	_, err := db.DB.Collection("profiles").UpdateOne(context.Background(), bson.M{"_id": id}, bson.M{"$set": patch})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": patch})
}
