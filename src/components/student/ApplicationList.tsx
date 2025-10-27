import React, { useEffect, useState } from 'react';
import { getApplications } from '../../lib/api';
import { FileText, Calendar, MapPin, Clock } from 'lucide-react';

interface ApplicationListProps {
  studentProfileId: string | null;
}

export function ApplicationList({ studentProfileId }: ApplicationListProps) {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentProfileId) {
      loadApplications();
    }
  }, [studentProfileId]);

  const loadApplications = async () => {
    if (!studentProfileId) return;

    try {
      const data = await getApplications({ studentId: studentProfileId });
      setApplications(data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
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

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (!studentProfileId) {
    return (
      <div className="text-center py-12 text-gray-500">
        Please complete your profile first.
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading applications...</div>;
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <FileText className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-gray-600">No applications yet</p>
        <p className="text-sm text-gray-500 mt-2">Start applying to jobs to see them here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">My Applications</h2>

      <div className="grid gap-6">
        {applications.map((application) => {
          const job = application.job_postings;
          const company = job?.companies;
          const interview = application.interviews?.[0];

          return (
            <div
              key={application.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{job?.title}</h3>
                  <p className="text-gray-600">{company?.name}</p>
                  {company?.industry && (
                    <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {company.industry}
                    </span>
                  )}
                </div>

                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                  {getStatusLabel(application.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={16} />
                  {job?.job_location || 'Not specified'}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={16} />
                  Applied {new Date(application.applied_at).toLocaleDateString()}
                </div>

                <div className="text-sm text-gray-600">
                  <span className="font-medium">Eligibility:</span>{' '}
                  <span className={
                    application.eligibility_status === 'eligible' ? 'text-green-600' :
                    application.eligibility_status === 'conditional' ? 'text-yellow-600' : 'text-red-600'
                  }>
                    {getStatusLabel(application.eligibility_status)}
                  </span>
                </div>

                {application.eligibility_notes && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Note:</span> {application.eligibility_notes}
                  </div>
                )}
              </div>

              {interview && (
                <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="text-purple-600" size={18} />
                    <span className="font-medium text-purple-900">Interview Scheduled</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Date:</span>{' '}
                      <span className="text-gray-900 font-medium">
                        {new Date(interview.scheduled_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Time:</span>{' '}
                      <span className="text-gray-900 font-medium">
                        {new Date(interview.scheduled_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Mode:</span>{' '}
                      <span className="text-gray-900 font-medium capitalize">
                        {interview.mode || 'Not specified'}
                      </span>
                    </div>
                  </div>
                  {interview.location && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-600">Location:</span>{' '}
                      <span className="text-gray-900">{interview.location}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
