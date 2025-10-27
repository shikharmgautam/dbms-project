import React, { useEffect, useState } from 'react';
import { getCompanies, updateCompany } from '../../lib/api';
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react';

export function CompanyApprovals() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const data = await getCompanies();
      const normalized = (data || []).map((c: any) => {
        const rawId = c.id || c._id || (c._id && c._id.$oid) || c.ID || null;
        return { ...c, id: rawId };
      });
      setCompanies(normalized);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveCompany = async (companyId: string) => {
    if (!companyId) {
      console.warn('approveCompany called with missing id');
      return;
    }
    try {
      console.info('approve click', companyId);
      await updateCompany(companyId, { verified: true });
      await loadCompanies();
    } catch (error) {
      console.error('Error approving company:', error);
    }
  };

  const rejectCompany = async (companyId: string) => {
    if (!confirm('Are you sure you want to reject this company? This will remove their verification status.')) return;

    try {
      await updateCompany(companyId, { verified: false });
      await loadCompanies();
    } catch (error) {
      console.error('Error rejecting company:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading companies...</div>;
  }

  const pendingCompanies = companies.filter(c => !c.verified);
  const verifiedCompanies = companies.filter(c => c.verified);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Approvals</h2>
        {pendingCompanies.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No pending approvals</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingCompanies.map((company) => (
              <div
                key={company.id}
                className="border border-yellow-200 bg-yellow-50 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                    <p className="text-gray-600">{company.industry}</p>
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm mt-1"
                      >
                        {company.website}
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                    Pending
                  </span>
                </div>

                {company.description && (
                  <p className="text-gray-700 mb-4">{company.description}</p>
                )}

                <div className="mb-4 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">Recruiter:</span> {company.profiles?.full_name}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Email:</span> {company.profiles?.email}
                  </p>
                  {company.profiles?.phone && (
                    <p className="text-gray-600">
                      <span className="font-medium">Phone:</span> {company.profiles.phone}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => approveCompany(company.id)}
                    disabled={!company.id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    title={!company.id ? 'Missing company id' : 'Approve company'}
                  >
                    <CheckCircle size={18} />
                    Approve
                  </button>
                  <button
                    onClick={() => rejectCompany(company.id)}
                    disabled={!company.id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    title={!company.id ? 'Missing company id' : 'Reject company'}
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Verified Companies</h2>
        {verifiedCompanies.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No verified companies</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {verifiedCompanies.map((company) => (
              <div
                key={company.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                    <p className="text-gray-600">{company.industry}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      Verified
                    </span>
                    <button
                      onClick={() => rejectCompany(company.id)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded"
                      title="Revoke verification"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <p>Job Postings: {company.job_postings?.[0]?.count || 0}</p>
                  <p>Recruiter: {company.profiles?.full_name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
