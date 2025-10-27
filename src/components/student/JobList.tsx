import React, { useEffect, useState } from 'react';
import { getJobPostings, getResumes, createApplication, getApplications } from '../../lib/api';
import { Briefcase, MapPin, DollarSign, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface JobListProps {
  studentProfile: any;
}

export function JobList({ studentProfile }: JobListProps) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Record<string, any>>({});

  useEffect(() => {
    loadJobs();
    if (studentProfile) {
      loadApplications();
    }
  }, [studentProfile]);

  const loadJobs = async () => {
    try {
      const data = await getJobPostings();
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    if (!studentProfile) return;

    try {
      const data = await getApplications({ studentId: studentProfile.id });
      const applicationsMap: Record<string, any> = {};
      (data || []).forEach((app: any) => {
        applicationsMap[app.job_id] = app;
      });
      setApplications(applicationsMap);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const checkEligibility = (job: any) => {
    if (!studentProfile) return { eligible: false, reason: 'Profile incomplete' };

    const criteria = job.eligibility_criteria || {};

    if (criteria.minCGPA && studentProfile.cgpa < criteria.minCGPA) {
      return { eligible: false, reason: `CGPA below minimum (${criteria.minCGPA})` };
    }

    if (criteria.maxBacklogs !== undefined && studentProfile.backlogs > criteria.maxBacklogs) {
      return { eligible: false, reason: `Too many backlogs (max: ${criteria.maxBacklogs})` };
    }

    if (criteria.allowedBranches && criteria.allowedBranches.length > 0) {
      if (!criteria.allowedBranches.includes(studentProfile.branch)) {
        return { eligible: false, reason: 'Branch not eligible' };
      }
    }

    if (criteria.graduationYear && studentProfile.graduation_year !== criteria.graduationYear) {
      return { eligible: 'conditional', reason: 'Different graduation year' };
    }

    return { eligible: true, reason: 'All criteria met' };
  };

  const applyToJob = async (jobId: string) => {
    if (!studentProfile) {
      alert('Please complete your profile first');
      return;
    }

    const job = jobs.find(j => j.id === jobId);
    const eligibility = checkEligibility(job);

    try {
      const resumes = await getResumes(studentProfile.id);
      const primaryResume = Array.isArray(resumes) && resumes.length ? resumes[0] : null;
      await createApplication({ job_id: jobId, student_id: studentProfile.id, resume_id: primaryResume?.id || null, eligibility_status: eligibility.eligible === true ? 'eligible' : eligibility.eligible === 'conditional' ? 'conditional' : 'not_eligible', eligibility_notes: eligibility.reason });
      await loadApplications();
      alert('Application submitted successfully!');
    } catch (error: any) {
      console.error('Error applying to job:', error);
      alert(error.message || 'Failed to apply');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading jobs...</div>;
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Briefcase className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-gray-600">No active job postings available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Available Jobs</h2>

      <div className="grid gap-6">
        {jobs.map((job) => {
          const application = applications[job.id];
          const eligibility = checkEligibility(job);
          const company = job.companies;

          return (
            <div
              key={job.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                  <p className="text-gray-600 mt-1">{company?.name}</p>
                  {company?.industry && (
                    <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {company.industry}
                    </span>
                  )}
                </div>

                {application ? (
                  <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Applied
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    {eligibility.eligible === true && (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle size={16} />
                        Eligible
                      </span>
                    )}
                    {eligibility.eligible === false && (
                      <span className="flex items-center gap-1 text-red-600 text-sm">
                        <XCircle size={16} />
                        Not Eligible
                      </span>
                    )}
                    {eligibility.eligible === 'conditional' && (
                      <span className="flex items-center gap-1 text-yellow-600 text-sm">
                        <AlertCircle size={16} />
                        Conditional
                      </span>
                    )}
                  </div>
                )}
              </div>

              {job.description && (
                <p className="text-gray-700 mb-4">{job.description}</p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={16} />
                  {job.job_location || 'Not specified'}
                </div>

                {job.salary_min && job.salary_max && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign size={16} />
                    {job.salary_min / 100000}L - {job.salary_max / 100000}L
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase size={16} />
                  {job.openings} openings
                </div>

                {job.application_deadline && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} />
                    {new Date(job.application_deadline).toLocaleDateString()}
                  </div>
                )}
              </div>

              {!application && eligibility.eligible !== false && (
                <button
                  onClick={() => applyToJob(job.id)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Apply Now
                </button>
              )}

              {!application && eligibility.eligible === false && (
                <div className="text-sm text-red-600 p-3 bg-red-50 rounded">
                  {eligibility.reason}
                </div>
              )}

              {application && (
                <div className="text-sm p-3 bg-gray-50 rounded">
                  <p>
                    <span className="font-medium">Status:</span> {application.status}
                  </p>
                  <p>
                    <span className="font-medium">Eligibility:</span> {application.eligibility_status}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
