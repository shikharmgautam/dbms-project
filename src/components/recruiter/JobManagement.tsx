import React, { useEffect, useState } from 'react';
import { getJobPostings, updateJobPosting, deleteJobPosting } from '../../lib/api';
import { Briefcase, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';

interface JobManagementProps {
  companyId: string | null;
}

export function JobManagement({ companyId }: JobManagementProps) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (companyId) {
      loadJobs();
    }
  }, [companyId]);

  const loadJobs = async () => {
    if (!companyId) return;

    try {
      const data = await getJobPostings(companyId);
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (jobId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';

    try {
      await updateJobPosting(jobId, { status: newStatus });
      await loadJobs();
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;

    try {
      await deleteJobPosting(jobId);
      await loadJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      closed: 'bg-gray-100 text-gray-700',
      draft: 'bg-yellow-100 text-yellow-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (!companyId) {
    return (
      <div className="text-center py-12 text-gray-500">
        Please create your company profile first.
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading jobs...</div>;
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Briefcase className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-gray-600">No job postings yet</p>
        <p className="text-sm text-gray-500 mt-2">Create your first job posting to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Manage Job Postings</h2>

      <div className="grid gap-6">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                <p className="text-gray-600 mt-1">{job.role}</p>
                <div className="flex gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {job.applications_count || 0} Applications
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleStatus(job.id, job.status)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                  title={job.status === 'active' ? 'Close job' : 'Activate job'}
                >
                  {job.status === 'active' ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <button
                  onClick={() => deleteJob(job.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  title="Delete job"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            {job.description && (
              <p className="text-gray-700 mb-4">{job.description}</p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Openings:</span>{' '}
                <span className="font-medium">{job.openings}</span>
              </div>

              {job.salary_min && job.salary_max && (
                <div>
                  <span className="text-gray-600">Salary:</span>{' '}
                  <span className="font-medium">
                    {job.salary_min / 100000}L - {job.salary_max / 100000}L
                  </span>
                </div>
              )}

              {job.job_location && (
                <div>
                  <span className="text-gray-600">Location:</span>{' '}
                  <span className="font-medium">{job.job_location}</span>
                </div>
              )}

              {job.application_deadline && (
                <div>
                  <span className="text-gray-600">Deadline:</span>{' '}
                  <span className="font-medium">
                    {new Date(job.application_deadline).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {job.eligibility_criteria && Object.keys(job.eligibility_criteria).length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Eligibility Criteria:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                  {job.eligibility_criteria.minCGPA && (
                    <div>Min CGPA: {job.eligibility_criteria.minCGPA}</div>
                  )}
                  {job.eligibility_criteria.maxBacklogs !== undefined && (
                    <div>Max Backlogs: {job.eligibility_criteria.maxBacklogs}</div>
                  )}
                  {job.eligibility_criteria.graduationYear && (
                    <div>Grad Year: {job.eligibility_criteria.graduationYear}</div>
                  )}
                  {job.eligibility_criteria.allowedBranches && (
                    <div className="md:col-span-4">
                      Branches: {job.eligibility_criteria.allowedBranches.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
