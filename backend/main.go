package main

import (
	"backend/db"
	"backend/handlers"
	"backend/middleware"
	"log"
	"os"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// load .env if present so developers can keep local settings in backend/.env
	loadDotEnv()

	// init DB
	db.Init()

	// init firebase and jwt
	middleware.InitFirebase()

	r := gin.Default()

	// CORS
	allowed := []string{"http://localhost:5173", "http://localhost:5174"}
	if v := os.Getenv("FRONTEND_ORIGINS"); v != "" {
		// split comma-separated origins and trim spaces
		parts := strings.Split(v, ",")
		allowed = make([]string, 0, len(parts))
		for _, p := range parts {
			p = strings.TrimSpace(p)
			if p != "" {
				allowed = append(allowed, p)
			}
		}
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
		api.GET("/health", handlers.Health)
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
		api.PUT("/job_postings/:id", handlers.UpdateJobPosting)
		api.DELETE("/job_postings/:id", handlers.DeleteJobPosting)

		// resumes
		api.POST("/resumes/upload", handlers.UploadResume)
		api.GET("/resumes", handlers.GetResumes)

		// applications
		api.GET("/applications", handlers.GetApplications)
		api.POST("/applications", handlers.CreateApplication)
		api.PUT("/applications/:id", handlers.UpdateApplication)

		// interviews
		api.POST("/interviews", handlers.CreateInterview)
	}

	port := os.Getenv("PORT")
	if port == "" {
		// default to 8081 for local development to match frontend VITE_API_URL
		port = "8081"
	}
	log.Println("listening on :", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}

// loadDotEnv reads a simple KEY=VALUE .env file in the backend folder and sets
// the values into the process environment. It is intentionally small and
// dependency-free to avoid adding a new module just for local development.
func loadDotEnv() {
	data, err := os.ReadFile(".env")
	if err != nil {
		return
	}
	lines := strings.Split(string(data), "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		// split on first '=' only
		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}
		key := strings.TrimSpace(parts[0])
		val := strings.TrimSpace(parts[1])
		// strip surrounding quotes if present
		if len(val) >= 2 && ((val[0] == '"' && val[len(val)-1] == '"') || (val[0] == '\'' && val[len(val)-1] == '\'')) {
			val = val[1 : len(val)-1]
		}
		if key != "" {
			_ = os.Setenv(key, val)
		}
	}
}
