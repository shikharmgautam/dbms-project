package handlers

import (
	"backend/db"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetProfiles(c *gin.Context) {
	// support ?id=eq.<id> or ?user_id=<id>
	q := c.Query("id")
	filter := map[string]interface{}{}
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

	out, err := db.ListProfiles(filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
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
	if err := db.CreateProfile(p); err != nil {
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
	if err := db.UpdateProfile(id, patch); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": patch})
}
