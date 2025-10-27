import React, { useEffect, useState } from 'react';
import { getJobPostings, getApplications, updateApplicationStatus as apiUpdateApplicationStatus, createInterview } from '../../lib/api';
import { Users, Filter, Download, Mail, Calendar } from 'lucide-react';

interface ApplicantsListProps {
  companyId: string | null;
}

export function ApplicantsList({ companyId }: ApplicantsListProps) {
  const [applications, setApplications] = useState<any[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    if (companyId) {
      loadJobs();
      loadApplications();
    }
  }, [companyId]);

  useEffect(() => {
    filterApplications();
  }, [applications, selectedJob, selectedStatus]);

  const loadJobs = async () => {
    if (!companyId) return;

    try {
      const data = await getJobPostings(companyId);
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const loadApplications = async () => {
    if (!companyId) return;

    try {
      const data = await getApplications({ companyId });
      setApplications(data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = [...applications];

    if (selectedJob !== 'all') {
      filtered = filtered.filter(app => app.job_id === selectedJob);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(app => app.status === selectedStatus);
    }

    setFilteredApplications(filtered);
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      await apiUpdateApplicationStatus(applicationId, { status: newStatus, updated_at: new Date().toISOString() });
      await loadApplications();
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const scheduleInterview = async (applicationId: string) => {
    const scheduledAt = prompt('Enter interview date and time (YYYY-MM-DD HH:MM):');
    if (!scheduledAt) return;

    const location = prompt('Enter interview location or link:');
    const mode = prompt('Enter mode (online/offline):');

    try {
      await createInterview({ application_id: applicationId, scheduled_at: new Date(scheduledAt).toISOString(), location: location || null, mode });
      await updateApplicationStatus(applicationId, 'interview_scheduled');
      alert('Interview scheduled successfully!');
    } catch (error: any) {
      console.error('Error scheduling interview:', error);
      alert(error.message || 'Failed to schedule interview');
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Roll Number', 'CGPA', 'Branch', 'Job', 'Status', 'Applied Date'];
    const rows = filteredApplications.map(app => [
      app.student_profiles?.profiles?.full_name || '',
      app.student_profiles?.profiles?.email || '',
      app.student_profiles?.roll_number || '',
      app.student_profiles?.cgpa || '',
      app.student_profiles?.branch || '',
      app.job_postings?.title || '',
      app.status,
      new Date(app.applied_at).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applicants-${Date.now()}.csv`;
    a.click();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      applied: 'bg-blue-100 text-blue-700',
      shortlisted: 'bg-yellow-100 text-yellow-700',
      interview_scheduled: 'bg-purple-100 text-purple-700',
      selected: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      offer_accepted: 'bg-emerald-100 text-emerald-700',
      offer_rejected: 'bg-gray-100 text-gray-700',
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
    return <div className="text-center py-12 text-gray-500">Loading applicants...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Applicants</h2>
        <button
          onClick={exportToCSV}
          disabled={filteredApplications.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Job
          </label>
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Jobs</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="applied">Applied</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview_scheduled">Interview Scheduled</option>
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600">No applicants found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredApplications.map((application) => {
            const student = application.student_profiles;
            const profile = student?.profiles;

            return (
              <div
                key={application.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{profile?.full_name}</h3>
                    <p className="text-gray-600">{student?.roll_number}</p>
                    <p className="text-sm text-gray-500">{application.job_postings?.title}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                    {application.status.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-600">CGPA:</span>{' '}
                    <span className="font-medium">{student?.cgpa || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Branch:</span>{' '}
                    <span className="font-medium">{student?.branch || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Backlogs:</span>{' '}
                    <span className="font-medium">{student?.backlogs || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Applied:</span>{' '}
                    <span className="font-medium">{new Date(application.applied_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {student?.skills && Array.isArray(student.skills) && student.skills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {student.skills.map((skill: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => updateApplicationStatus(application.id, 'shortlisted')}
                    disabled={application.status === 'shortlisted'}
                    className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 disabled:opacity-50"
                  >
                    Shortlist
                  </button>
                  <button
                    onClick={() => scheduleInterview(application.id)}
                    disabled={application.status === 'interview_scheduled'}
                    className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:opacity-50"
                  >
                    <Calendar size={14} />
                    Schedule Interview
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(application.id, 'selected')}
                    disabled={application.status === 'selected'}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    Select
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(application.id, 'rejected')}
                    disabled={application.status === 'rejected'}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
