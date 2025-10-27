import React, { useEffect, useState } from 'react';
import { getStudentProfiles, getCompanies, getJobPostings, getApplications } from '../../lib/api';
import { TrendingUp, Users, Briefcase, DollarSign, Award } from 'lucide-react';

export function Analytics() {
  const [stats, setStats] = useState<any>({
    totalStudents: 0,
    totalCompanies: 0,
    totalJobs: 0,
    totalApplications: 0,
    placedStudents: 0,
    averagePackage: 0,
  });
  const [placementsByCompany, setPlacementsByCompany] = useState<any[]>([]);
  const [placementsByBranch, setPlacementsByBranch] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [students, companies, jobs, applications] = await Promise.all([
        getStudentProfiles(),
        getCompanies(),
        getJobPostings(),
        getApplications(),
      ]);

      setStats({
        totalStudents: Array.isArray(students) ? students.length : 0,
        totalCompanies: Array.isArray(companies) ? companies.filter((c: any) => c.verified).length : 0,
        totalJobs: Array.isArray(jobs) ? jobs.length : 0,
        totalApplications: Array.isArray(applications) ? applications.length : 0,
        placedStudents: 0,
        averagePackage: 0,
      });

      setPlacementsByCompany([]);
      setPlacementsByBranch([]);

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading analytics...</div>;
  }

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'blue' },
    { label: 'Verified Companies', value: stats.totalCompanies, icon: Briefcase, color: 'green' },
    { label: 'Active Jobs', value: stats.totalJobs, icon: TrendingUp, color: 'purple' },
    { label: 'Total Applications', value: stats.totalApplications, icon: Award, color: 'yellow' },
    { label: 'Placed Students', value: stats.placedStudents, icon: Award, color: 'emerald' },
    { label: 'Avg Package (LPA)', value: stats.averagePackage.toFixed(2), icon: DollarSign, color: 'orange' },
  ];

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Companies by Placements</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            {placementsByCompany.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No placement data available</p>
            ) : (
              <div className="space-y-4">
                {placementsByCompany.map((company, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{company.name}</p>
                      <p className="text-sm text-gray-600">
                        Avg: {(company.totalPackage / company.count / 100000).toFixed(2)} LPA
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{company.count}</p>
                      <p className="text-xs text-gray-500">placements</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Placements by Branch</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            {placementsByBranch.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No placement data available</p>
            ) : (
              <div className="space-y-4">
                {placementsByBranch.map((branch, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{branch.branch}</p>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${(branch.count / stats.placedStudents) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-2xl font-bold text-green-600">{branch.count}</p>
                      <p className="text-xs text-gray-500">students</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Placement Insights</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {stats.placedStudents > 0 ? ((stats.placedStudents / stats.totalStudents) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-gray-600 mt-2">Placement Rate</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {stats.totalApplications > 0 ? (stats.totalApplications / stats.totalStudents).toFixed(1) : 0}
              </p>
              <p className="text-gray-600 mt-2">Avg Applications per Student</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                {stats.totalJobs > 0 ? (stats.totalApplications / stats.totalJobs).toFixed(1) : 0}
              </p>
              <p className="text-gray-600 mt-2">Avg Applications per Job</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
