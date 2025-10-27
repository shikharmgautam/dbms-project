package main

import (
	"backend/db"
	"backend/handlers"
	"backend/middleware"
	"log"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// init DB
	db.Init()

	// init firebase and jwt
	middleware.InitFirebase()

	r := gin.Default()

	// CORS
	allowed := []string{"http://localhost:5173", "http://localhost:5174"}
	if v := os.Getenv("FRONTEND_ORIGINS"); v != "" {
		// simple split by comma
		allowed = []string{v}
	}
	r.Use(cors.New(cors.Config{
		AllowOrigins:     allowed,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	api := r.Group("/api")
	{
		api.POST("/auth/google", handlers.GoogleAuth)

		// public-ish profiles listing
		api.GET("/profiles", handlers.GetProfiles)
		api.POST("/profiles", handlers.CreateProfile)
		api.PUT("/profiles/:id", handlers.UpdateProfile)

		// student profiles
		api.GET("/student_profiles", handlers.GetStudentProfiles)
		api.POST("/student_profiles", handlers.CreateStudentProfile)
		api.PUT("/student_profiles/:id", handlers.UpdateStudentProfile)

		// companies
		api.GET("/companies", handlers.GetCompanies)
		api.POST("/companies", handlers.CreateCompany)
		api.PUT("/companies/:id", handlers.UpdateCompany)

		// jobs
		api.GET("/job_postings", handlers.GetJobPostings)
		api.POST("/job_postings", handlers.CreateJobPosting)

		// resumes
		api.POST("/resumes/upload", handlers.UploadResume)
		api.GET("/resumes", handlers.GetResumes)

		// applications
		api.GET("/applications", handlers.GetApplications)
		api.POST("/applications", handlers.CreateApplication)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Println("listening on :", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}
