import React from 'react';
import { Settings, Calendar, Bell } from 'lucide-react';

export function CampusManagement() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Campus Settings</h2>
        <p className="text-gray-600 mb-6">
          Configure campus-wide placement rules and policies.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Placement Season
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>2024-2025</option>
              <option>2025-2026</option>
              <option>2026-2027</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" defaultChecked />
              <span className="text-sm text-gray-700">Allow multiple offers per student</span>
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" defaultChecked />
              <span className="text-sm text-gray-700">Require admin approval for job postings</span>
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm text-gray-700">Enable pre-placement talks</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum applications per student
            </label>
            <input
              type="number"
              min="1"
              defaultValue="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="text-purple-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">Campus Drive Calendar</h3>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600">
            Manage campus drive events and scheduling here. This feature allows you to:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li>Schedule company visits and presentations</li>
            <li>Coordinate interview dates</li>
            <li>Set up pre-placement talk sessions</li>
            <li>Manage aptitude test schedules</li>
          </ul>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Calendar management system coming soon. Configure event schedules and notifications.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="text-green-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
        </div>

        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" defaultChecked />
              <span className="text-sm text-gray-700">Email notifications for new applications</span>
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" defaultChecked />
              <span className="text-sm text-gray-700">Email notifications for interview schedules</span>
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" defaultChecked />
              <span className="text-sm text-gray-700">Email notifications for offer letters</span>
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm text-gray-700">Push notifications for urgent updates</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Save Settings
        </button>
      </div>
    </div>
  );
}
