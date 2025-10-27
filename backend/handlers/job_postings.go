package handlers

import (
	"backend/db"
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func GetJobPostings(c *gin.Context) {
	company := c.Query("company_id")

	// If using in-memory, return simple list from db helpers
	if db.UseInMemory {
		filter := map[string]interface{}{}
		if company != "" {
			filter["company_id"] = company
		}
		out, err := db.GetJobPostings(filter)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "list failed"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"data": out})
		return
	}

	// Build aggregation pipeline to lookup company details
	col := db.DB.Collection("job_postings")
	pipeline := mongo.Pipeline{
		{{"$match", bson.D{{"status", "active"}}}},
		{{"$lookup", bson.D{{"from", "companies"}, {"localField", "company_id"}, {"foreignField", "_id"}, {"as", "companies"}}}},
		{{"$unwind", bson.D{{"path", "$companies"}, {"preserveNullAndEmptyArrays", true}}}},
		// lookup applications to compute count
		{{"$lookup", bson.D{{"from", "applications"}, {"localField", "_id"}, {"foreignField", "job_id"}, {"as", "applications"}}}},
		{{"$addFields", bson.D{{"applications_count", bson.D{{"$size", "$applications"}}}}}},
	}

	if company != "" {
		// add additional match by company id
		oid := company
		pipeline = append(pipeline, bson.D{{"$match", bson.D{{"company_id", oid}}}})
	}
	// sort by created_at desc
	pipeline = append(pipeline, bson.D{{"$sort", bson.D{{"created_at", -1}}}})

	cur, err := col.Aggregate(context.Background(), pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "aggregate failed"})
		return
	}
	var out []map[string]interface{}
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
	if err := db.CreateJobPosting(j); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "insert failed"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": j})
}

func UpdateJobPosting(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id required"})
		return
	}
	var patch map[string]interface{}
	if err := c.BindJSON(&patch); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid"})
		return
	}
	if err := db.UpdateJobPosting(id, patch); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": patch})
}

func DeleteJobPosting(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id required"})
		return
	}
	if err := db.DeleteJobPosting(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "delete failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": "deleted"})
}
