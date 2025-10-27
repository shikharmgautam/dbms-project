Project: Placement Portal (Concise Implementation Report)

Overview

This document summarizes the main features of the Placement Portal project and how each feature is implemented across the frontend, backend, and database layers.

Core features

1. Authentication & Authorization
- Frontend: Login and auth flow live in `src/components/auth/LoginForm.tsx` and `src/contexts/AuthContext.tsx`. Uses Firebase (see `src/lib/firebase.ts`) or backend session tokens depending on configuration.
- Backend: Handlers in `backend/handlers/auth.go` and middleware in `backend/middleware/auth.go` validate tokens and enforce role-based access (student, recruiter, admin).
- Database: User records and roles are stored in the primary database (Mongo collections managed in `backend/db/db.go`). Firebase may be used for identity and storage where configured (`backend/firebase_service_account.json`, `FIREBASE_INTEGRATION.md`).

2. Role-based Dashboards
- Frontend: Separate dashboard components under `src/components/admin`, `src/components/recruiter`, and `src/components/student` (e.g., `AdminDashboard.tsx`, `RecruiterDashboard.tsx`, `StudentDashboard.tsx`). UI adapts to role via `AuthContext`.
- Backend: Role-specific endpoints implemented in `backend/handlers/*` (companies, job_postings, applications, interviews, profiles). Authorization enforced in middleware.
- Database: Collections/tables for users, companies, job_postings, applications, interviews and student_profiles. SQL migrations for Supabase are in `supabase/migrations/` if using Supabase for relational data.

3. Job Posting & Management
- Frontend: Recruiter UI components in `src/components/recruiter/JobPostingForm.tsx` and `JobManagement.tsx` to create, edit and view postings.
- Backend: `backend/handlers/job_postings.go` implements CRUD for postings and searches.
- Database: Job postings stored in a collection/table with fields for title, description, company_id, deadlines, eligibility, and status.

4. Applications & Applicant Tracking
- Frontend: Students apply via `src/components/student/JobList.tsx` and `ApplicationList.tsx`. Recruiters view applicants in `src/components/recruiter/ApplicantsList.tsx`.
- Backend: `backend/handlers/applications.go` and `backend/handlers/interviews.go` manage application submission, status changes, and interview scheduling.
- Database: Application documents store student_id, job_posting_id, resume refs, status history, and interview records.

5. Student Profiles & Resume Management
- Frontend: `src/components/student/ProfileForm.tsx` and `ResumeManager.tsx` enable profile editing and resume uploads. File storage handled via Firebase Storage or an equivalent.
- Backend: `backend/handlers/profiles.go` and `resumes.go` provide endpoints for profile read/write and resume uploads/downloads.
- Database: Student profiles collection and resume metadata (file path, uploaded_at, owner_id). Large binary files kept in cloud storage (Firebase/other) with references in DB.

6. Admin & Campus Management
- Frontend: Admin views in `src/components/admin/*` (e.g., `CampusManagement.tsx`, `CompanyApprovals.tsx`, `Analytics.tsx`).
- Backend: Admin endpoints in `backend/handlers/companies.go` and admin routes in other handlers.
- Database: Admin actions operate on the same collections, plus audit logs where appropriate.

Supporting infrastructure & tech stack

- Frontend: React + TypeScript (Vite). Key files: `src/main.tsx`, `src/App.tsx`, `src/contexts/AuthContext.tsx`.
- Backend: Go (modules in `backend/go.mod`). Entry point: `backend/main.go`. Database access helpers in `backend/db/db.go`. Route handlers under `backend/handlers/`.
- Databases: MongoDB for primary document storage (access in `backend/db`), Supabase/SQL migrations present in `supabase/migrations/` for relational schema where used. Firebase used for authentication and file storage if enabled (`FIREBASE_INTEGRATION.md`).

Deployment & notes

- Configuration: Service account and secrets are expected in `backend/firebase_service_account.json` (example provided). Environment and connection strings are configured in backend start-up.
- Extensibility: Handlers in `backend/handlers/` follow a clear separation per resource (profiles, job_postings, applications). The frontend uses modular components per role.
- Edge cases & validations: Backend includes auth middleware, basic input validation, and a `mongo_ping_check.go` for health checks.

Contact / Where to look

- Frontend components: `src/components/` and `src/contexts/AuthContext.tsx`.
- Backend handlers: `backend/handlers/*.go` and `backend/main.go`.
- Database code and migrations: `backend/db/db.go` and `supabase/migrations/`.
- Firebase integration: `FIREBASE_INTEGRATION.md` and `backend/firebase_service_account.json` (example).

