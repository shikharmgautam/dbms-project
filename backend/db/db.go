package db

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var DB *mongo.Database

// Profile represents a simple user profile stored in Mongo
type Profile struct {
	ID        string `bson:"_id,omitempty" json:"id"`
	Email     string `bson:"email,omitempty" json:"email"`
	FullName  string `bson:"full_name,omitempty" json:"full_name"`
	Role      string `bson:"role,omitempty" json:"role"`
	CreatedAt string `bson:"created_at,omitempty" json:"created_at"`
	UpdatedAt string `bson:"updated_at,omitempty" json:"updated_at"`
}

// StudentProfile represents student-specific data
type StudentProfile struct {
	ID             string      `bson:"_id,omitempty" json:"id"`
	UserID         string      `bson:"user_id" json:"user_id"`
	RollNumber     string      `bson:"roll_number,omitempty" json:"roll_number"`
	CGPA           float64     `bson:"cgpa,omitempty" json:"cgpa"`
	Branch         string      `bson:"branch,omitempty" json:"branch"`
	GraduationYear int         `bson:"graduation_year,omitempty" json:"graduation_year"`
	Skills         interface{} `bson:"skills,omitempty" json:"skills"`
	Projects       interface{} `bson:"projects,omitempty" json:"projects"`
	Internships    interface{} `bson:"internships,omitempty" json:"internships"`
	CreatedAt      string      `bson:"created_at,omitempty" json:"created_at"`
	UpdatedAt      string      `bson:"updated_at,omitempty" json:"updated_at"`
}

// Generic minimal models for companies, jobs, resumes, applications
type Company struct {
	ID        string `bson:"_id,omitempty" json:"id"`
	Name      string `bson:"name" json:"name"`
	Email     string `bson:"email" json:"email"`
	Approved  bool   `bson:"approved" json:"approved"`
	CreatedAt string `bson:"created_at,omitempty" json:"created_at"`
}

type JobPosting struct {
	ID                  string      `bson:"_id,omitempty" json:"id"`
	CompanyID           string      `bson:"company_id" json:"company_id"`
	Title               string      `bson:"title" json:"title"`
	Description         string      `bson:"description" json:"description"`
	EligibilityCriteria interface{} `bson:"eligibility_criteria,omitempty" json:"eligibility_criteria"`
	Status              string      `bson:"status" json:"status"`
	CreatedAt           string      `bson:"created_at,omitempty" json:"created_at"`
}

type Resume struct {
	ID        string `bson:"_id,omitempty" json:"id"`
	StudentID string `bson:"student_id" json:"student_id"`
	FileURL   string `bson:"file_url" json:"file_url"`
	CreatedAt string `bson:"created_at,omitempty" json:"created_at"`
}

type Application struct {
	ID        string `bson:"_id,omitempty" json:"id"`
	JobID     string `bson:"job_id" json:"job_id"`
	StudentID string `bson:"student_id" json:"student_id"`
	Status    string `bson:"status" json:"status"`
	CreatedAt string `bson:"created_at,omitempty" json:"created_at"`
}

func Init() {
	uri := os.Getenv("MONGO_URI")
	if uri == "" {
		uri = "mongodb://localhost:27017"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOpts := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(ctx, clientOpts)
	if err != nil {
		log.Fatal("failed to connect to mongo:", err)
	}

	if err := client.Ping(ctx, nil); err != nil {
		log.Fatal("failed to ping mongo:", err)
	}

	dbName := os.Getenv("MONGO_DB")
	if dbName == "" {
		dbName = "placement_portal"
	}

	DB = client.Database(dbName)
}
