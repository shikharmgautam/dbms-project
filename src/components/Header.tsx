import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, LogOut } from 'lucide-react';

export function Header() {
  const { profile, signOut, updateUserRole } = useAuth();

  const handleSignOut = async () => {
    try {              
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <GraduationCap className="text-blue-600" size={32} />
            <div>
              <h1 className="text-lg font-bold text-gray-900">Campus Placement Portal</h1>
              <p className="text-xs text-gray-500 capitalize">{profile?.role} Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
              <p className="text-xs text-gray-500">{profile?.email}</p>
            </div>
            {/* Dev-only role switcher for testing (not shown in production) */}
            {import.meta.env.DEV && (
              <div className="mr-4 flex items-center gap-2">
                <button onClick={() => updateUserRole('student')} className="px-2 py-1 text-sm bg-gray-100 rounded">Student</button>
                <button onClick={() => updateUserRole('recruiter')} className="px-2 py-1 text-sm bg-gray-100 rounded">Recruiter</button>
                <button onClick={() => updateUserRole('admin')} className="px-2 py-1 text-sm bg-gray-100 rounded">Admin</button>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="Sign out"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
