package db

import (
	"context"
	"errors"
	"log"
	"os"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var DB *mongo.Database
var UseInMemory bool

var mu sync.RWMutex
var inMemoryProfiles map[string]Profile
var inMemoryStudentProfiles map[string]StudentProfile
var inMemoryCompanies map[string]Company
var inMemoryJobPostings map[string]JobPosting
var inMemoryResumes map[string]Resume
var inMemoryApplications map[string]Application
var inMemoryInterviews map[string]map[string]interface{}

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
	ID          string `bson:"_id,omitempty" json:"id"`
	Name        string `bson:"name" json:"name"`
	Email       string `bson:"email,omitempty" json:"email"`
	RecruiterID string `bson:"recruiter_id,omitempty" json:"recruiter_id"`
	Description string `bson:"description,omitempty" json:"description"`
	Website     string `bson:"website,omitempty" json:"website"`
	Industry    string `bson:"industry,omitempty" json:"industry"`
	Approved    bool   `bson:"approved" json:"approved"`
	Verified    bool   `bson:"verified,omitempty" json:"verified"`
	CreatedAt   string `bson:"created_at,omitempty" json:"created_at"`
	UpdatedAt   string `bson:"updated_at,omitempty" json:"updated_at"`
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
	ID                string `bson:"_id,omitempty" json:"id"`
	JobID             string `bson:"job_id" json:"job_id"`
	StudentID         string `bson:"student_id" json:"student_id"`
	Status            string `bson:"status" json:"status"`
	ResumeID          string `bson:"resume_id,omitempty" json:"resume_id"`
	EligibilityStatus string `bson:"eligibility_status,omitempty" json:"eligibility_status"`
	EligibilityNotes  string `bson:"eligibility_notes,omitempty" json:"eligibility_notes"`
	AppliedAt         string `bson:"applied_at,omitempty" json:"applied_at"`
	CreatedAt         string `bson:"created_at,omitempty" json:"created_at"`
	UpdatedAt         string `bson:"updated_at,omitempty" json:"updated_at"`
}

func Init() {
	uri := os.Getenv("MONGO_URI")
	if uri == "" {
		// prefer 127.0.0.1 to avoid IPv6 (::1) resolution issues on some systems
		uri = "mongodb://127.0.0.1:27017"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOpts := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(ctx, clientOpts)
	if err != nil {
		log.Println("warning: failed to connect to mongo, switching to in-memory DB:", err)
		switchToInMemory()
		return
	}

	if err := client.Ping(ctx, nil); err != nil {
		log.Println("warning: failed to ping mongo, switching to in-memory DB:", err)
		switchToInMemory()
		return
	}

	dbName := os.Getenv("MONGO_DB")
	if dbName == "" {
		dbName = "placement_portal"
	}

	DB = client.Database(dbName)

	// Log successful connection so it's obvious in startup logs whether
	// the app is using MongoDB or the in-memory fallback.
	log.Println("connected to mongo:", uri, "db:", dbName)
}

func switchToInMemory() {
	UseInMemory = true
	inMemoryProfiles = make(map[string]Profile)
	inMemoryStudentProfiles = make(map[string]StudentProfile)
	inMemoryCompanies = make(map[string]Company)
	inMemoryJobPostings = make(map[string]JobPosting)
	inMemoryResumes = make(map[string]Resume)
	inMemoryApplications = make(map[string]Application)
	inMemoryInterviews = make(map[string]map[string]interface{})
	log.Println("Using in-memory DB (development fallback)")
}

// Companies
func GetCompanies(filter map[string]interface{}) ([]Company, error) {
	if UseInMemory {
		mu.RLock()
		defer mu.RUnlock()
		out := make([]Company, 0)
		if rid, ok := filter["recruiter_id"].(string); ok && rid != "" {
			for _, c := range inMemoryCompanies {
				if c.RecruiterID == rid {
					// keep verified in sync with approved for older entries
					if !c.Verified && c.Approved {
						c.Verified = true
					}
					out = append(out, c)
				}
			}
			return out, nil
		}
		for _, c := range inMemoryCompanies {
			if !c.Verified && c.Approved {
				c.Verified = true
			}
			out = append(out, c)
		}
		return out, nil
	}
	col := DB.Collection("companies")
	cur, err := col.Find(context.Background(), filter)
	if err != nil {
		return nil, err
	}
	var out []Company
	if err := cur.All(context.Background(), &out); err != nil {
		return nil, err
	}
	return out, nil
}

func CreateCompany(c Company) error {
	if UseInMemory {
		mu.Lock()
		defer mu.Unlock()
		inMemoryCompanies[c.ID] = c
		return nil
	}
	_, err := DB.Collection("companies").InsertOne(context.Background(), c)
	return err
}

func UpdateCompany(id string, patch map[string]interface{}) error {
	if UseInMemory {
		mu.Lock()
		defer mu.Unlock()
		co, ok := inMemoryCompanies[id]
		if !ok {
			return errors.New("not found")
		}
		if v, ok := patch["name"].(string); ok {
			co.Name = v
		}
		if v, ok := patch["approved"].(bool); ok {
			co.Approved = v
		}
		// support 'verified' patch key used by frontend admin UI
		if v, ok := patch["verified"].(bool); ok {
			co.Verified = v
			// keep approved in sync for legacy/alternate naming
			co.Approved = v
		}
		if v, ok := patch["description"].(string); ok {
			co.Description = v
		}
		if v, ok := patch["website"].(string); ok {
			co.Website = v
		}
		if v, ok := patch["industry"].(string); ok {
			co.Industry = v
		}
		if v, ok := patch["email"].(string); ok {
			co.Email = v
		}
		if v, ok := patch["recruiter_id"].(string); ok {
			co.RecruiterID = v
		}
		if v, ok := patch["updated_at"].(string); ok {
			co.UpdatedAt = v
		}
		inMemoryCompanies[id] = co
		return nil
	}
	_, err := DB.Collection("companies").UpdateOne(context.Background(), bson.M{"_id": id}, bson.M{"$set": patch})
	return err
}

// Job postings
func GetJobPostings(filter map[string]interface{}) ([]JobPosting, error) {
	if UseInMemory {
		mu.RLock()
		defer mu.RUnlock()
		out := make([]JobPosting, 0)
		if cid, ok := filter["company_id"].(string); ok && cid != "" {
			for _, j := range inMemoryJobPostings {
				if j.CompanyID == cid {
					out = append(out, j)
				}
			}
			return out, nil
		}
		for _, j := range inMemoryJobPostings {
			out = append(out, j)
		}
		return out, nil
	}
	col := DB.Collection("job_postings")
	cur, err := col.Find(context.Background(), filter)
	if err != nil {
		return nil, err
	}
	var out []JobPosting
	if err := cur.All(context.Background(), &out); err != nil {
		return nil, err
	}
	return out, nil
}

func CreateJobPosting(j JobPosting) error {
	if UseInMemory {
		mu.Lock()
		defer mu.Unlock()
		inMemoryJobPostings[j.ID] = j
		return nil
	}
	_, err := DB.Collection("job_postings").InsertOne(context.Background(), j)
	return err
}

func UpdateJobPosting(id string, patch map[string]interface{}) error {
	if UseInMemory {
		mu.Lock()
		defer mu.Unlock()
		jp, ok := inMemoryJobPostings[id]
		if !ok {
			return errors.New("not found")
		}
		if v, ok := patch["status"].(string); ok {
			jp.Status = v
		}
		inMemoryJobPostings[id] = jp
		return nil
	}
	_, err := DB.Collection("job_postings").UpdateOne(context.Background(), bson.M{"_id": id}, bson.M{"$set": patch})
	return err
}

func DeleteJobPosting(id string) error {
	if UseInMemory {
		mu.Lock()
		defer mu.Unlock()
		delete(inMemoryJobPostings, id)
		return nil
	}
	_, err := DB.Collection("job_postings").DeleteOne(context.Background(), bson.M{"_id": id})
	return err
}

// Resumes
func GetResumes(filter map[string]interface{}) ([]Resume, error) {
	if UseInMemory {
		mu.RLock()
		defer mu.RUnlock()
		out := make([]Resume, 0)
		if sid, ok := filter["student_id"].(string); ok && sid != "" {
			for _, r := range inMemoryResumes {
				if r.StudentID == sid {
					out = append(out, r)
				}
			}
			return out, nil
		}
		for _, r := range inMemoryResumes {
			out = append(out, r)
		}
		return out, nil
	}
	col := DB.Collection("resumes")
	cur, err := col.Find(context.Background(), filter)
	if err != nil {
		return nil, err
	}
	var out []Resume
	if err := cur.All(context.Background(), &out); err != nil {
		return nil, err
	}
	return out, nil
}

func CreateResume(r Resume) error {
	if UseInMemory {
		mu.Lock()
		defer mu.Unlock()
		inMemoryResumes[r.ID] = r
		return nil
	}
	_, err := DB.Collection("resumes").InsertOne(context.Background(), r)
	return err
}

// Applications
func GetApplications(filter map[string]interface{}) ([]Application, error) {
	if UseInMemory {
		mu.RLock()
		defer mu.RUnlock()
		out := make([]Application, 0)
		if sid, ok := filter["student_id"].(string); ok && sid != "" {
			for _, a := range inMemoryApplications {
				if a.StudentID == sid {
					out = append(out, a)
				}
			}
			return out, nil
		}
		for _, a := range inMemoryApplications {
			out = append(out, a)
		}
		return out, nil
	}
	col := DB.Collection("applications")
	cur, err := col.Find(context.Background(), filter)
	if err != nil {
		return nil, err
	}
	var out []Application
	if err := cur.All(context.Background(), &out); err != nil {
		return nil, err
	}
	return out, nil
}

func CreateApplication(a Application) error {
	if UseInMemory {
		mu.Lock()
		defer mu.Unlock()
		// ensure applied_at/created_at exist for in-memory entries
		if a.AppliedAt == "" {
			a.AppliedAt = time.Now().Format(time.RFC3339)
		}
		if a.CreatedAt == "" {
			a.CreatedAt = a.AppliedAt
		}
		if a.Status == "" {
			a.Status = "applied"
		}
		inMemoryApplications[a.ID] = a
		return nil
	}
	_, err := DB.Collection("applications").InsertOne(context.Background(), a)
	return err
}

func UpdateApplication(id string, patch map[string]interface{}) error {
	if UseInMemory {
		mu.Lock()
		defer mu.Unlock()
		ap, ok := inMemoryApplications[id]
		if !ok {
			return errors.New("not found")
		}
		if v, ok := patch["status"].(string); ok {
			ap.Status = v
		}
		if v, ok := patch["eligibility_status"].(string); ok {
			ap.EligibilityStatus = v
		}
		if v, ok := patch["eligibility_notes"].(string); ok {
			ap.EligibilityNotes = v
		}
		if v, ok := patch["updated_at"].(string); ok {
			ap.UpdatedAt = v
		}
		if v, ok := patch["applied_at"].(string); ok {
			ap.AppliedAt = v
		}
		inMemoryApplications[id] = ap
		return nil
	}
	_, err := DB.Collection("applications").UpdateOne(context.Background(), bson.M{"_id": id}, bson.M{"$set": patch})
	return err
}

// Interviews
func CreateInterviewRecord(rec map[string]interface{}) error {
	if UseInMemory {
		mu.Lock()
		defer mu.Unlock()
		id, _ := rec["id"].(string)
		if id == "" {
			id = time.Now().Format(time.RFC3339Nano)
		}
		rec["id"] = id
		inMemoryInterviews[id] = rec
		// update related application status if provided
		if aid, ok := rec["application_id"].(string); ok && aid != "" {
			if ap, ok := inMemoryApplications[aid]; ok {
				ap.Status = "interview_scheduled"
				inMemoryApplications[aid] = ap
			}
		}
		return nil
	}
	_, err := DB.Collection("interviews").InsertOne(context.Background(), rec)
	return err
}

// GetProfile returns a profile by id. If in-memory mode is enabled it reads the map.
func GetProfile(id string) (Profile, error) {
	if UseInMemory {
		mu.RLock()
		defer mu.RUnlock()
		if p, ok := inMemoryProfiles[id]; ok {
			return p, nil
		}
		return Profile{}, errors.New("not found")
	}
	var p Profile
	coll := DB.Collection("profiles")
	err := coll.FindOne(context.Background(), bson.M{"_id": id}).Decode(&p)
	if err != nil {
		return Profile{}, err
	}
	return p, nil
}

func CreateProfile(p Profile) error {
	if UseInMemory {
		mu.Lock()
		defer mu.Unlock()
		inMemoryProfiles[p.ID] = p
		return nil
	}
	_, err := DB.Collection("profiles").InsertOne(context.Background(), p)
	return err
}

func UpdateProfile(id string, patch map[string]interface{}) error {
	if UseInMemory {
		mu.Lock()
		defer mu.Unlock()
		p, ok := inMemoryProfiles[id]
		if !ok {
			return errors.New("not found")
		}
		// apply patch for a few fields
		if v, ok := patch["role"].(string); ok {
			p.Role = v
		}
		if v, ok := patch["full_name"].(string); ok {
			p.FullName = v
		}
		if v, ok := patch["email"].(string); ok {
			p.Email = v
		}
		if v, ok := patch["updated_at"].(string); ok {
			p.UpdatedAt = v
		}
		inMemoryProfiles[id] = p
		return nil
	}
	_, err := DB.Collection("profiles").UpdateOne(context.Background(), bson.M{"_id": id}, bson.M{"$set": patch})
	return err
}

func ListProfiles(filter map[string]interface{}) ([]Profile, error) {
	if UseInMemory {
		mu.RLock()
		defer mu.RUnlock()
		out := make([]Profile, 0)
		if id, ok := filter["_id"].(string); ok && id != "" {
			if p, ok := inMemoryProfiles[id]; ok {
				out = append(out, p)
			}
			return out, nil
		}
		for _, p := range inMemoryProfiles {
			out = append(out, p)
		}
		return out, nil
	}
	coll := DB.Collection("profiles")
	cur, err := coll.Find(context.Background(), filter)
	if err != nil {
		return nil, err
	}
	var out []Profile
	if err := cur.All(context.Background(), &out); err != nil {
		return nil, err
	}
	return out, nil
}

// Student profile helpers
func GetStudentProfiles(filter map[string]interface{}) ([]StudentProfile, error) {
	if UseInMemory {
		mu.RLock()
		defer mu.RUnlock()
		out := make([]StudentProfile, 0)
		// if filter contains user_id or _id, handle quickly
		if uid, ok := filter["user_id"].(string); ok && uid != "" {
			for _, sp := range inMemoryStudentProfiles {
				if sp.UserID == uid {
					out = append(out, sp)
				}
			}
			return out, nil
		}
		if id, ok := filter["_id"].(string); ok && id != "" {
			if sp, ok := inMemoryStudentProfiles[id]; ok {
				out = append(out, sp)
			}
			return out, nil
		}
		for _, sp := range inMemoryStudentProfiles {
			out = append(out, sp)
		}
		return out, nil
	}
	coll := DB.Collection("student_profiles")
	cur, err := coll.Find(context.Background(), filter)
	if err != nil {
		return nil, err
	}
	var out []StudentProfile
	if err := cur.All(context.Background(), &out); err != nil {
		return nil, err
	}
	return out, nil
}

func CreateStudentProfile(sp StudentProfile) error {
	if UseInMemory {
		mu.Lock()
		defer mu.Unlock()
		inMemoryStudentProfiles[sp.ID] = sp
		return nil
	}
	_, err := DB.Collection("student_profiles").InsertOne(context.Background(), sp)
	return err
}

func UpdateStudentProfile(id string, patch map[string]interface{}) error {
	if UseInMemory {
		mu.Lock()
		defer mu.Unlock()
		sp, ok := inMemoryStudentProfiles[id]
		if !ok {
			return errors.New("not found")
		}
		if v, ok := patch["roll_number"].(string); ok {
			sp.RollNumber = v
		}
		if v, ok := patch["cgpa"].(float64); ok {
			sp.CGPA = v
		}
		if v, ok := patch["branch"].(string); ok {
			sp.Branch = v
		}
		if v, ok := patch["graduation_year"].(float64); ok {
			sp.GraduationYear = int(v)
		}
		if v, ok := patch["skills"]; ok {
			sp.Skills = v
		}
		if v, ok := patch["updated_at"].(string); ok {
			sp.UpdatedAt = v
		}
		inMemoryStudentProfiles[id] = sp
		return nil
	}
	_, err := DB.Collection("student_profiles").UpdateOne(context.Background(), bson.M{"_id": id}, bson.M{"$set": patch})
	return err
}
