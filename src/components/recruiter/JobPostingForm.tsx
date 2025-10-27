import React, { useState } from 'react';
import { createJobPosting } from '../../lib/api';
import { Save, Plus, Trash2 } from 'lucide-react';

interface JobPostingFormProps {
  companyId: string | null;
  onSuccess: () => void;
}

export function JobPostingForm({ companyId, onSuccess }: JobPostingFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [role, setRole] = useState('');
  const [description, setDescription] = useState('');
  const [openings, setOpenings] = useState('1');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [location, setLocation] = useState('');
  const [bondTerms, setBondTerms] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<'draft' | 'active'>('draft');

  const [minCGPA, setMinCGPA] = useState('');
  const [maxBacklogs, setMaxBacklogs] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [allowedBranches, setAllowedBranches] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyId) {
      setError('Please create a company profile first');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const eligibilityCriteria: any = {};
      if (minCGPA) eligibilityCriteria.minCGPA = parseFloat(minCGPA);
      if (maxBacklogs) eligibilityCriteria.maxBacklogs = parseInt(maxBacklogs);
      if (graduationYear) eligibilityCriteria.graduationYear = parseInt(graduationYear);
      if (allowedBranches.length > 0) eligibilityCriteria.allowedBranches = allowedBranches.filter(b => b.trim());

      await createJobPosting({
        company_id: companyId,
        title,
        role,
        description,
        openings: parseInt(openings),
        salary_min: salaryMin ? parseFloat(salaryMin) * 100000 : null,
        salary_max: salaryMax ? parseFloat(salaryMax) * 100000 : null,
        job_location: location,
        bond_terms: bondTerms || null,
        application_deadline: deadline || null,
        eligibility_criteria: eligibilityCriteria,
        status,
      });

      setTitle('');
      setRole('');
      setDescription('');
      setOpenings('1');
      setSalaryMin('');
      setSalaryMax('');
      setLocation('');
      setBondTerms('');
      setDeadline('');
      setMinCGPA('');
      setMaxBacklogs('');
      setGraduationYear('');
      setAllowedBranches([]);

      alert('Job posting created successfully!');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create job posting');
    } finally {
      setLoading(false);
    }
  };

  const addBranch = () => {
    setAllowedBranches([...allowedBranches, '']);
  };

  const updateBranch = (index: number, value: string) => {
    const newBranches = [...allowedBranches];
    newBranches[index] = value;
    setAllowedBranches(newBranches);
  };

  const removeBranch = (index: number) => {
    setAllowedBranches(allowedBranches.filter((_, i) => i !== index));
  };

  if (!companyId) {
    return (
      <div className="text-center py-12 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Please create your company profile first before posting jobs.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Job Posting</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Software Engineer"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <input
            type="text"
            required
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g., Backend Developer"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Openings
          </label>
          <input
            type="number"
            required
            min="1"
            value={openings}
            onChange={(e) => setOpenings(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Salary Min (in Lakhs)
          </label>
          <input
            type="number"
            step="0.1"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
            placeholder="e.g., 6"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Salary Max (in Lakhs)
          </label>
          <input
            type="number"
            step="0.1"
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value)}
            placeholder="e.g., 10"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Bangalore, India"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Application Deadline
          </label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'draft' | 'active')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Job description, responsibilities, requirements..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bond Terms
          </label>
          <textarea
            value={bondTerms}
            onChange={(e) => setBondTerms(e.target.value)}
            rows={2}
            placeholder="Service bond, notice period, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Eligibility Criteria</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum CGPA
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              value={minCGPA}
              onChange={(e) => setMinCGPA(e.target.value)}
              placeholder="e.g., 7.0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Backlogs
            </label>
            <input
              type="number"
              min="0"
              value={maxBacklogs}
              onChange={(e) => setMaxBacklogs(e.target.value)}
              placeholder="e.g., 0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Graduation Year
            </label>
            <input
              type="number"
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              placeholder="e.g., 2025"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Allowed Branches
            </label>
            <button
              type="button"
              onClick={addBranch}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <Plus size={16} />
              Add Branch
            </button>
          </div>
          <div className="space-y-2">
            {allowedBranches.map((branch, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => updateBranch(index, e.target.value)}
                  placeholder="e.g., Computer Science, Electronics"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeBranch(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        <Save size={18} />
        {loading ? 'Creating...' : 'Create Job Posting'}
      </button>
    </form>
  );
}
