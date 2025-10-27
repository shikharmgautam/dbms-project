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

func GetCompanies(c *gin.Context) {
	col := db.DB.Collection("companies")
	cur, err := col.Find(context.Background(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "list failed"})
		return
	}
	var out []db.Company
	if err := cur.All(context.Background(), &out); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "decode failed"})
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
	_, err := db.DB.Collection("companies").InsertOne(context.Background(), co)
	if err != nil {
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
	_, err := db.DB.Collection("companies").UpdateOne(context.Background(), bson.M{"_id": id}, bson.M{"$set": patch})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": patch})
}
