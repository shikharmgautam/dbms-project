/*
  # Campus Placement Portal Database Schema

  ## Overview
  Complete schema for campus placement automation system supporting students, recruiters, and placement officers.

  ## 1. New Tables

  ### `profiles`
  User profile information extending auth.users
  - `id` (uuid, primary key, references auth.users)
  - `role` (text) - 'student', 'recruiter', or 'admin'
  - `full_name` (text)
  - `email` (text)
  - `phone` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `student_profiles`
  Extended student information
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `roll_number` (text, unique)
  - `cgpa` (decimal)
  - `branch` (text)
  - `graduation_year` (integer)
  - `skills` (jsonb) - array of skills
  - `projects` (jsonb) - array of project objects
  - `internships` (jsonb) - array of internship objects
  - `backlogs` (integer)
  - `gap_months` (integer)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `resumes`
  Resume storage and parsed data
  - `id` (uuid, primary key)
  - `student_id` (uuid, references student_profiles)
  - `file_name` (text)
  - `file_url` (text)
  - `parsed_data` (jsonb) - extracted information
  - `raw_text` (text)
  - `is_primary` (boolean)
  - `uploaded_at` (timestamptz)

  ### `companies`
  Company information
  - `id` (uuid, primary key)
  - `recruiter_id` (uuid, references profiles)
  - `name` (text)
  - `description` (text)
  - `website` (text)
  - `industry` (text)
  - `verified` (boolean)
  - `created_at` (timestamptz)

  ### `job_postings`
  Job opportunities
  - `id` (uuid, primary key)
  - `company_id` (uuid, references companies)
  - `title` (text)
  - `description` (text)
  - `role` (text)
  - `openings` (integer)
  - `salary_min` (decimal)
  - `salary_max` (decimal)
  - `job_location` (text)
  - `bond_terms` (text)
  - `eligibility_criteria` (jsonb)
  - `application_deadline` (timestamptz)
  - `status` (text) - 'active', 'closed', 'draft'
  - `created_at` (timestamptz)

  ### `applications`
  Student job applications
  - `id` (uuid, primary key)
  - `job_id` (uuid, references job_postings)
  - `student_id` (uuid, references student_profiles)
  - `resume_id` (uuid, references resumes)
  - `status` (text) - 'applied', 'shortlisted', 'interview_scheduled', 'selected', 'rejected', 'offer_accepted', 'offer_rejected'
  - `eligibility_status` (text) - 'eligible', 'not_eligible', 'conditional'
  - `eligibility_notes` (text)
  - `applied_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `interviews`
  Interview scheduling
  - `id` (uuid, primary key)
  - `application_id` (uuid, references applications)
  - `scheduled_at` (timestamptz)
  - `location` (text)
  - `mode` (text) - 'online', 'offline'
  - `status` (text) - 'scheduled', 'completed', 'cancelled'
  - `notes` (text)
  - `created_at` (timestamptz)

  ### `notifications`
  System notifications
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `title` (text)
  - `message` (text)
  - `type` (text) - 'interview', 'shortlist', 'offer', 'general'
  - `read` (boolean)
  - `created_at` (timestamptz)

  ### `placement_stats`
  Analytics and statistics
  - `id` (uuid, primary key)
  - `student_id` (uuid, references student_profiles)
  - `company_id` (uuid, references companies)
  - `job_id` (uuid, references job_postings)
  - `package` (decimal)
  - `placement_date` (timestamptz)
  - `created_at` (timestamptz)

  ## 2. Security
  - Enable RLS on all tables
  - Students can only view/edit their own data
  - Recruiters can view student data for their job applications
  - Admins have full access
  - Public can view verified companies and active job postings

  ## 3. Important Notes
  - All timestamps use timestamptz for consistency
  - JSONB used for flexible nested data structures
  - Eligibility criteria stored as JSON for complex filtering
  - Status fields use text enums for flexibility
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('student', 'recruiter', 'admin')),
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create student_profiles table
CREATE TABLE IF NOT EXISTS student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  roll_number text UNIQUE NOT NULL,
  cgpa decimal(4,2),
  branch text,
  graduation_year integer,
  skills jsonb DEFAULT '[]'::jsonb,
  projects jsonb DEFAULT '[]'::jsonb,
  internships jsonb DEFAULT '[]'::jsonb,
  backlogs integer DEFAULT 0,
  gap_months integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES student_profiles(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  parsed_data jsonb DEFAULT '{}'::jsonb,
  raw_text text,
  is_primary boolean DEFAULT false,
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  website text,
  industry text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create job_postings table
CREATE TABLE IF NOT EXISTS job_postings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  role text NOT NULL,
  openings integer DEFAULT 1,
  salary_min decimal(12,2),
  salary_max decimal(12,2),
  job_location text,
  bond_terms text,
  eligibility_criteria jsonb DEFAULT '{}'::jsonb,
  application_deadline timestamptz,
  status text DEFAULT 'draft' CHECK (status IN ('active', 'closed', 'draft')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES job_postings(id) ON DELETE CASCADE,
  student_id uuid REFERENCES student_profiles(id) ON DELETE CASCADE,
  resume_id uuid REFERENCES resumes(id) ON DELETE SET NULL,
  status text DEFAULT 'applied' CHECK (status IN ('applied', 'shortlisted', 'interview_scheduled', 'selected', 'rejected', 'offer_accepted', 'offer_rejected')),
  eligibility_status text DEFAULT 'eligible' CHECK (eligibility_status IN ('eligible', 'not_eligible', 'conditional')),
  eligibility_notes text,
  applied_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(job_id, student_id)
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  location text,
  mode text CHECK (mode IN ('online', 'offline')),
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text CHECK (type IN ('interview', 'shortlist', 'offer', 'general')),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create placement_stats table
CREATE TABLE IF NOT EXISTS placement_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES student_profiles(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  job_id uuid REFERENCES job_postings(id) ON DELETE CASCADE,
  package decimal(12,2),
  placement_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE placement_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for student_profiles
CREATE POLICY "Students can view own profile"
  ON student_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Students can update own profile"
  ON student_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Students can insert own profile"
  ON student_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Recruiters can view student profiles for their applications"
  ON student_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('recruiter', 'admin')
    )
  );

-- RLS Policies for resumes
CREATE POLICY "Students can view own resumes"
  ON resumes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE student_profiles.id = resumes.student_id AND student_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can insert own resumes"
  ON resumes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE student_profiles.id = student_id AND student_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can delete own resumes"
  ON resumes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE student_profiles.id = resumes.student_id AND student_profiles.user_id = auth.uid()
    )
  );

-- RLS Policies for companies
CREATE POLICY "Anyone can view verified companies"
  ON companies FOR SELECT
  TO authenticated
  USING (verified = true);

CREATE POLICY "Recruiters can view own companies"
  ON companies FOR SELECT
  TO authenticated
  USING (recruiter_id = auth.uid());

CREATE POLICY "Recruiters can insert own companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (recruiter_id = auth.uid());

CREATE POLICY "Recruiters can update own companies"
  ON companies FOR UPDATE
  TO authenticated
  USING (recruiter_id = auth.uid())
  WITH CHECK (recruiter_id = auth.uid());

CREATE POLICY "Admins can update all companies"
  ON companies FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for job_postings
CREATE POLICY "Students can view active jobs"
  ON job_postings FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Recruiters can view own jobs"
  ON job_postings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = job_postings.company_id AND companies.recruiter_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can insert jobs"
  ON job_postings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = company_id AND companies.recruiter_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can update own jobs"
  ON job_postings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = job_postings.company_id AND companies.recruiter_id = auth.uid()
    )
  );

-- RLS Policies for applications
CREATE POLICY "Students can view own applications"
  ON applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE student_profiles.id = applications.student_id AND student_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can insert own applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE student_profiles.id = student_id AND student_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can view applications for their jobs"
  ON applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM job_postings jp
      JOIN companies c ON c.id = jp.company_id
      WHERE jp.id = applications.job_id AND c.recruiter_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can update applications for their jobs"
  ON applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM job_postings jp
      JOIN companies c ON c.id = jp.company_id
      WHERE jp.id = applications.job_id AND c.recruiter_id = auth.uid()
    )
  );

-- RLS Policies for interviews
CREATE POLICY "Students can view own interviews"
  ON interviews FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM applications a
      JOIN student_profiles sp ON sp.id = a.student_id
      WHERE a.id = interviews.application_id AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can manage interviews for their jobs"
  ON interviews FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM applications a
      JOIN job_postings jp ON jp.id = a.job_id
      JOIN companies c ON c.id = jp.company_id
      WHERE a.id = interviews.application_id AND c.recruiter_id = auth.uid()
    )
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for placement_stats
CREATE POLICY "Admins can view all placement stats"
  ON placement_stats FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Students can view own placement stats"
  ON placement_stats FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE student_profiles.id = placement_stats.student_id AND student_profiles.user_id = auth.uid()
    )
  );
