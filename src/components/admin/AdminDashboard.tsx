import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CompanyApprovals } from './CompanyApprovals';
import { Analytics } from './Analytics';
import { CampusManagement } from './CampusManagement';
import { BarChart3, Building2, Settings } from 'lucide-react';

type TabType = 'approvals' | 'analytics' | 'settings';

export function AdminDashboard() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('approvals');

  const tabs = [
    { id: 'approvals' as TabType, label: 'Company Approvals', icon: Building2 },
    { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart3 },
    { id: 'settings' as TabType, label: 'Campus Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Placement Officer Dashboard</h1>
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
            {activeTab === 'approvals' && <CompanyApprovals />}
            {activeTab === 'analytics' && <Analytics />}
            {activeTab === 'settings' && <CampusManagement />}
          </div>
        </div>
      </div>
    </div>
  );
}
