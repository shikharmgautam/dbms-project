package handlers

import (
	"backend/db"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetCompanies(c *gin.Context) {
	recruiter := c.Query("recruiter_id")
	filter := map[string]interface{}{}
	if recruiter != "" {
		filter["recruiter_id"] = recruiter
	}
	out, err := db.GetCompanies(filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "list failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": out})
}

func CreateCompany(c *gin.Context) {
	var co db.Company
	if err := c.BindJSON(&co); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid"})
		return
	}
	if co.ID == "" {
		co.ID = uuid.New().String()
	}
	co.CreatedAt = time.Now().Format(time.RFC3339)
	if err := db.CreateCompany(co); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "insert failed"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": co})
}

func UpdateCompany(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing id"})
		return
	}
	var patch map[string]interface{}
	if err := c.BindJSON(&patch); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid"})
		return
	}
	patch["updated_at"] = time.Now().Format(time.RFC3339)
	if err := db.UpdateCompany(id, patch); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": patch})
}
