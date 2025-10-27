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
	// Support listing applications with optional filters: student_id or company_id
	student := c.Query("student_id")
	company := c.Query("company_id")
	// If in-memory, use db helper for simple listing. Company-aggregations are only supported against Mongo.
	if db.UseInMemory {
		filter := map[string]interface{}{}
		if student != "" {
			filter["student_id"] = student
		}
		out, err := db.GetApplications(filter)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "list failed"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"data": out})
		return
	}

	col := db.DB.Collection("applications")

	// If company filter is provided, use aggregation to join job_postings and student_profiles
	if company != "" {
		pipeline := mongoPipelineForCompanyApplications(company)
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
		return
	}

	// Default simple listing (optionally filtered by student_id)
	filter := map[string]interface{}{}
	if student != "" {
		filter["student_id"] = student
	}
	cur, err := col.Find(context.Background(), filter)
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
	// set timestamps and sensible defaults
	if a.AppliedAt == "" {
		a.AppliedAt = time.Now().Format(time.RFC3339)
	}
	if a.CreatedAt == "" {
		a.CreatedAt = a.AppliedAt
	}
	if a.Status == "" {
		a.Status = "applied"
	}
	if err := db.CreateApplication(a); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "insert failed"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": a})
}

func UpdateApplication(c *gin.Context) {
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
	// set updated_at if not provided
	if _, ok := patch["updated_at"]; !ok {
		patch["updated_at"] = time.Now().Format(time.RFC3339)
	}
	if err := db.UpdateApplication(id, patch); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": patch})
}

// Helper: build aggregation pipeline to join applications -> job_postings -> student_profiles -> profiles
func mongoPipelineForCompanyApplications(company string) []interface{} {
	return []interface{}{
		// lookup job_postings
		map[string]interface{}{"$lookup": map[string]interface{}{
			"from":         "job_postings",
			"localField":   "job_id",
			"foreignField": "_id",
			"as":           "job_postings",
		}},
		// unwind job_postings
		map[string]interface{}{"$unwind": map[string]interface{}{"path": "$job_postings", "preserveNullAndEmptyArrays": true}},
		// match company
		map[string]interface{}{"$match": map[string]interface{}{"job_postings.company_id": company}},
		// lookup student_profiles
		map[string]interface{}{"$lookup": map[string]interface{}{
			"from":         "student_profiles",
			"localField":   "student_id",
			"foreignField": "_id",
			"as":           "student_profiles",
		}},
		map[string]interface{}{"$unwind": map[string]interface{}{"path": "$student_profiles", "preserveNullAndEmptyArrays": true}},
		// lookup profiles for student_profiles.user_id
		map[string]interface{}{"$lookup": map[string]interface{}{
			"from":         "profiles",
			"localField":   "student_profiles.user_id",
			"foreignField": "_id",
			"as":           "student_profiles.profiles",
		}},
		map[string]interface{}{"$unwind": map[string]interface{}{"path": "$student_profiles.profiles", "preserveNullAndEmptyArrays": true}},
		// sort by created_at desc
		map[string]interface{}{"$sort": map[string]interface{}{"created_at": -1}},
	}
}
