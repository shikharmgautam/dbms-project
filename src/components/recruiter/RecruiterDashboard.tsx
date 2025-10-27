import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { CompanyProfile } from './CompanyProfile';
import { JobPostingForm } from './JobPostingForm';
import { JobManagement } from './JobManagement';
import { ApplicantsList } from './ApplicantsList';
import { Building2, Briefcase, Users, PlusCircle } from 'lucide-react';

type TabType = 'company' | 'jobs' | 'create-job' | 'applicants';

export function RecruiterDashboard() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('company');
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompany();
  }, [profile]);

  const loadCompany = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('recruiter_id', profile.id)
        .maybeSingle();

      if (error) throw error;
      setCompany(data);
    } catch (error) {
      console.error('Error loading company:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'company' as TabType, label: 'Company Profile', icon: Building2 },
    { id: 'jobs' as TabType, label: 'Manage Jobs', icon: Briefcase },
    { id: 'create-job' as TabType, label: 'Create Job', icon: PlusCircle },
    { id: 'applicants' as TabType, label: 'Applicants', icon: Users },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Recruiter Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {profile?.full_name}</p>
          {company && !company.verified && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                Your company profile is pending verification by the placement officer.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'company' && (
              <CompanyProfile company={company} onUpdate={loadCompany} />
            )}
            {activeTab === 'jobs' && (
              <JobManagement companyId={company?.id} />
            )}
            {activeTab === 'create-job' && (
              <JobPostingForm companyId={company?.id} onSuccess={() => setActiveTab('jobs')} />
            )}
            {activeTab === 'applicants' && (
              <ApplicantsList companyId={company?.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
