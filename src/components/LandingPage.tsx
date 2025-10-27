import React from 'react';
import { LoginForm } from './auth/LoginForm';
import { GraduationCap, Briefcase, BarChart3, Users } from 'lucide-react';

export function LandingPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GraduationCap size={48} className="text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Campus Placement Portal</h1>
          </div>
          <p className="text-xl text-gray-600">
            Streamline your campus recruitment process with our comprehensive placement automation system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">For Students</h3>
            </div>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>Create and manage your profile</li>
              <li>Upload multiple resumes with parsing</li>
              <li>Browse and apply to job postings</li>
              <li>Track application status</li>
              <li>Receive interview notifications</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Briefcase className="text-green-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">For Recruiters</h3>
            </div>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>Create company profile</li>
              <li>Post job opportunities</li>
              <li>Set eligibility criteria</li>
              <li>View and filter applicants</li>
              <li>Schedule interviews</li>
              <li>Export candidate data</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="text-purple-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">For Admins</h3>
            </div>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>Approve company registrations</li>
              <li>View placement analytics</li>
              <li>Manage campus drives</li>
              <li>Track placement statistics</li>
              <li>Generate reports</li>
            </ul>
          </div>
        </div>

        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
            Welcome Back
          </h2>
          <LoginForm />
        </div>

        <div className="mt-12 text-center text-gray-600 text-sm">
          <p>Campus Placement Automation Portal</p>
          <p className="mt-1">Manage recruitment, applications, and analytics in one place</p>
        </div>
      </div>
    </div>
  );
}
