import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createStudentProfile, updateStudentProfile } from '../../lib/api';
import { Save, Plus, Trash2 } from 'lucide-react';

interface ProfileFormProps {
  studentProfile: any;
  // onUpdate should return the refreshed profile so callers can await and receive normalized id
  onUpdate: () => Promise<any>;
}

export function ProfileForm({ studentProfile, onUpdate }: ProfileFormProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [rollNumber, setRollNumber] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [branch, setBranch] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [backlogs, setBacklogs] = useState('0');
  const [gapMonths, setGapMonths] = useState('0');
  const [skills, setSkills] = useState<string[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [internships, setInternships] = useState<any[]>([]);

  useEffect(() => {
    if (studentProfile) {
      setRollNumber(studentProfile.roll_number || '');
      setCgpa(studentProfile.cgpa?.toString() || '');
      setBranch(studentProfile.branch || '');
      setGraduationYear(studentProfile.graduation_year?.toString() || '');
      setBacklogs(studentProfile.backlogs?.toString() || '0');
      setGapMonths(studentProfile.gap_months?.toString() || '0');
      setSkills(Array.isArray(studentProfile.skills) ? studentProfile.skills : []);
      setProjects(Array.isArray(studentProfile.projects) ? studentProfile.projects : []);
      setInternships(Array.isArray(studentProfile.internships) ? studentProfile.internships : []);
    }
  }, [studentProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const profileData = {
        user_id: profile!.id,
        roll_number: rollNumber,
        cgpa: parseFloat(cgpa) || null,
        branch,
        graduation_year: parseInt(graduationYear) || null,
        backlogs: parseInt(backlogs) || 0,
        gap_months: parseInt(gapMonths) || 0,
        skills,
        projects,
        internships,
        updated_at: new Date().toISOString(),
      };

      // detect id in multiple places to avoid empty-id PUTs
      const existingId = studentProfile?.id || studentProfile?._id || studentProfile?.ID || null;

      if (existingId) {
        await updateStudentProfile(existingId, profileData);
      } else {
        await createStudentProfile(profileData);
      }

      setSuccess('Profile saved successfully!');
      try {
        const updated = await onUpdate();
        console.info('onUpdate returned:', updated);
      } catch (err) {
        console.warn('onUpdate failed or returned no profile', err);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    setSkills([...skills, '']);
  };

  const updateSkill = (index: number, value: string) => {
    const newSkills = [...skills];
    newSkills[index] = value;
    setSkills(newSkills);
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addProject = () => {
    setProjects([...projects, { title: '', description: '', technologies: '', duration: '' }]);
  };

  const updateProject = (index: number, field: string, value: string) => {
    const newProjects = [...projects];
    newProjects[index] = { ...newProjects[index], [field]: value };
    setProjects(newProjects);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const addInternship = () => {
    setInternships([...internships, { company: '', role: '', duration: '', description: '' }]);
  };

  const updateInternship = (index: number, field: string, value: string) => {
    const newInternships = [...internships];
    newInternships[index] = { ...newInternships[index], [field]: value };
    setInternships(newInternships);
  };

  const removeInternship = (index: number) => {
    setInternships(internships.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Roll Number
          </label>
          <input
            type="text"
            required
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CGPA
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="10"
            value={cgpa}
            onChange={(e) => setCgpa(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Branch
          </label>
          <input
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Backlogs
          </label>
          <input
            type="number"
            min="0"
            value={backlogs}
            onChange={(e) => setBacklogs(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gap Months
          </label>
          <input
            type="number"
            min="0"
            value={gapMonths}
            onChange={(e) => setGapMonths(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Skills
          </label>
          <button
            type="button"
            onClick={addSkill}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus size={16} />
            Add Skill
          </button>
        </div>
        <div className="space-y-2">
          {skills.map((skill, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={skill}
                onChange={(e) => updateSkill(index, e.target.value)}
                placeholder="e.g., React, Python, Machine Learning"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => removeSkill(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Projects
          </label>
          <button
            type="button"
            onClick={addProject}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus size={16} />
            Add Project
          </button>
        </div>
        <div className="space-y-4">
          {projects.map((project, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-gray-900">Project {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeProject(index)}
                  className="text-red-600 hover:bg-red-50 p-1 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <input
                type="text"
                value={project.title}
                onChange={(e) => updateProject(index, 'title', e.target.value)}
                placeholder="Project Title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={project.description}
                onChange={(e) => updateProject(index, 'description', e.target.value)}
                placeholder="Description"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={project.technologies}
                onChange={(e) => updateProject(index, 'technologies', e.target.value)}
                placeholder="Technologies Used"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Internships
          </label>
          <button
            type="button"
            onClick={addInternship}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus size={16} />
            Add Internship
          </button>
        </div>
        <div className="space-y-4">
          {internships.map((internship, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-gray-900">Internship {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeInternship(index)}
                  className="text-red-600 hover:bg-red-50 p-1 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <input
                type="text"
                value={internship.company}
                onChange={(e) => updateInternship(index, 'company', e.target.value)}
                placeholder="Company Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={internship.role}
                onChange={(e) => updateInternship(index, 'role', e.target.value)}
                placeholder="Role"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={internship.duration}
                onChange={(e) => updateInternship(index, 'duration', e.target.value)}
                placeholder="Duration (e.g., 3 months)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={internship.description}
                onChange={(e) => updateInternship(index, 'description', e.target.value)}
                placeholder="Description"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        <Save size={18} />
        {loading ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
}
