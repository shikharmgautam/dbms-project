import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api, { getStudentProfiles } from '../../lib/api';
import { ProfileForm } from './ProfileForm';
import { ResumeManager } from './ResumeManager';
import { JobList } from './JobList';
import { ApplicationList } from './ApplicationList';
import { User, Briefcase, FileText, CheckCircle } from 'lucide-react';

type TabType = 'profile' | 'resumes' | 'jobs' | 'applications';

export function StudentDashboard() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentProfile();
  }, [profile]);

  const loadStudentProfile = async () => {
    if (!profile) {
      setLoading(false);
      return null;
    }

    try {
      // fetch all profiles for this user and prefer one with a non-empty id
      const profiles = await getStudentProfiles(profile.id) as any[];
      // prefer a profile with a truthy id
      let userProfile = profiles.find((p: any) => p.user_id === profile.id && p.id) || profiles[0] || null;

      if (userProfile) {
        // normalize id field
        userProfile.id = userProfile.id || userProfile._id || userProfile.ID || null;
      }

  console.info('getStudentProfiles response:', { data: profiles });
      console.info('matched userProfile:', userProfile);

      setStudentProfile(userProfile);
      return userProfile;
    } catch (error) {
      console.error('Error loading student profile:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'resumes' as TabType, label: 'Resumes', icon: FileText },
    { id: 'jobs' as TabType, label: 'Job Postings', icon: Briefcase },
    { id: 'applications' as TabType, label: 'My Applications', icon: CheckCircle },
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
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {profile?.full_name}</p>
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
            {activeTab === 'profile' && (
              <ProfileForm studentProfile={studentProfile} onUpdate={loadStudentProfile} />
            )}
            {activeTab === 'resumes' && (
              <ResumeManager studentProfileId={studentProfile?.id} />
            )}
            {activeTab === 'jobs' && (
              <JobList studentProfile={studentProfile} />
            )}
            {activeTab === 'applications' && (
              <ApplicationList studentProfileId={studentProfile?.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
