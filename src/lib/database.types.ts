export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'student' | 'recruiter' | 'admin'
          full_name: string
          email: string
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role: 'student' | 'recruiter' | 'admin'
          full_name: string
          email: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'student' | 'recruiter' | 'admin'
          full_name?: string
          email?: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      student_profiles: {
        Row: {
          id: string
          user_id: string
          roll_number: string
          cgpa: number | null
          branch: string | null
          graduation_year: number | null
          skills: Json
          projects: Json
          internships: Json
          backlogs: number
          gap_months: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          roll_number: string
          cgpa?: number | null
          branch?: string | null
          graduation_year?: number | null
          skills?: Json
          projects?: Json
          internships?: Json
          backlogs?: number
          gap_months?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          roll_number?: string
          cgpa?: number | null
          branch?: string | null
          graduation_year?: number | null
          skills?: Json
          projects?: Json
          internships?: Json
          backlogs?: number
          gap_months?: number
          created_at?: string
          updated_at?: string
        }
      }
      resumes: {
        Row: {
          id: string
          student_id: string
          file_name: string
          file_url: string
          parsed_data: Json
          raw_text: string | null
          is_primary: boolean
          uploaded_at: string
        }
        Insert: {
          id?: string
          student_id: string
          file_name: string
          file_url: string
          parsed_data?: Json
          raw_text?: string | null
          is_primary?: boolean
          uploaded_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          file_name?: string
          file_url?: string
          parsed_data?: Json
          raw_text?: string | null
          is_primary?: boolean
          uploaded_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          recruiter_id: string
          name: string
          description: string | null
          website: string | null
          industry: string | null
          verified: boolean
          created_at: string
        }
        Insert: {
          id?: string
          recruiter_id: string
          name: string
          description?: string | null
          website?: string | null
          industry?: string | null
          verified?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          recruiter_id?: string
          name?: string
          description?: string | null
          website?: string | null
          industry?: string | null
          verified?: boolean
          created_at?: string
        }
      }
      job_postings: {
        Row: {
          id: string
          company_id: string
          title: string
          description: string | null
          role: string
          openings: number
          salary_min: number | null
          salary_max: number | null
          job_location: string | null
          bond_terms: string | null
          eligibility_criteria: Json
          application_deadline: string | null
          status: 'active' | 'closed' | 'draft'
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          title: string
          description?: string | null
          role: string
          openings?: number
          salary_min?: number | null
          salary_max?: number | null
          job_location?: string | null
          bond_terms?: string | null
          eligibility_criteria?: Json
          application_deadline?: string | null
          status?: 'active' | 'closed' | 'draft'
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          title?: string
          description?: string | null
          role?: string
          openings?: number
          salary_min?: number | null
          salary_max?: number | null
          job_location?: string | null
          bond_terms?: string | null
          eligibility_criteria?: Json
          application_deadline?: string | null
          status?: 'active' | 'closed' | 'draft'
          created_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          job_id: string
          student_id: string
          resume_id: string | null
          status: 'applied' | 'shortlisted' | 'interview_scheduled' | 'selected' | 'rejected' | 'offer_accepted' | 'offer_rejected'
          eligibility_status: 'eligible' | 'not_eligible' | 'conditional'
          eligibility_notes: string | null
          applied_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          student_id: string
          resume_id?: string | null
          status?: 'applied' | 'shortlisted' | 'interview_scheduled' | 'selected' | 'rejected' | 'offer_accepted' | 'offer_rejected'
          eligibility_status?: 'eligible' | 'not_eligible' | 'conditional'
          eligibility_notes?: string | null
          applied_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          student_id?: string
          resume_id?: string | null
          status?: 'applied' | 'shortlisted' | 'interview_scheduled' | 'selected' | 'rejected' | 'offer_accepted' | 'offer_rejected'
          eligibility_status?: 'eligible' | 'not_eligible' | 'conditional'
          eligibility_notes?: string | null
          applied_at?: string
          updated_at?: string
        }
      }
      interviews: {
        Row: {
          id: string
          application_id: string
          scheduled_at: string
          location: string | null
          mode: 'online' | 'offline' | null
          status: 'scheduled' | 'completed' | 'cancelled'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          application_id: string
          scheduled_at: string
          location?: string | null
          mode?: 'online' | 'offline' | null
          status?: 'scheduled' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          scheduled_at?: string
          location?: string | null
          mode?: 'online' | 'offline' | null
          status?: 'scheduled' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'interview' | 'shortlist' | 'offer' | 'general' | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: 'interview' | 'shortlist' | 'offer' | 'general' | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'interview' | 'shortlist' | 'offer' | 'general' | null
          read?: boolean
          created_at?: string
        }
      }
      placement_stats: {
        Row: {
          id: string
          student_id: string
          company_id: string
          job_id: string
          package: number | null
          placement_date: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          company_id: string
          job_id: string
          package?: number | null
          placement_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          company_id?: string
          job_id?: string
          package?: number | null
          placement_date?: string
          created_at?: string
        }
      }
    }
  }
}
