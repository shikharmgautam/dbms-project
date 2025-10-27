import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, FileText, Trash2, Star, StarOff } from 'lucide-react';

interface ResumeManagerProps {
  studentProfileId: string | null;
}

export function ResumeManager({ studentProfileId }: ResumeManagerProps) {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (studentProfileId) {
      loadResumes();
    }
  }, [studentProfileId]);

  const loadResumes = async () => {
    if (!studentProfileId) return;

    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('student_id', studentProfileId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setResumes(data || []);
    } catch (error) {
      console.error('Error loading resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !studentProfileId) return;

    const file = e.target.files[0];
    setUploading(true);

    try {
      const mockParsedData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        education: [
          { degree: 'B.Tech', college: 'ABC University', gpa: 8.5 }
        ],
        experience: [],
        skills: ['JavaScript', 'React', 'Node.js'],
        projects: []
      };

      const { error } = await supabase
        .from('resumes')
        .insert({
          student_id: studentProfileId,
          file_name: file.name,
          file_url: `mock://resumes/${file.name}`,
          parsed_data: mockParsedData,
          raw_text: 'Mock resume text content',
          is_primary: resumes.length === 0,
        });

      if (error) throw error;
      await loadResumes();
    } catch (error) {
      console.error('Error uploading resume:', error);
      alert('Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const setPrimaryResume = async (resumeId: string) => {
    try {
      await supabase
        .from('resumes')
        .update({ is_primary: false })
        .eq('student_id', studentProfileId);

      await supabase
        .from('resumes')
        .update({ is_primary: true })
        .eq('id', resumeId);

      await loadResumes();
    } catch (error) {
      console.error('Error setting primary resume:', error);
    }
  };

  const deleteResume = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId);

      if (error) throw error;
      await loadResumes();
    } catch (error) {
      console.error('Error deleting resume:', error);
    }
  };

  if (!studentProfileId) {
    return (
      <div className="text-center py-12 text-gray-500">
        Please complete your profile first before uploading resumes.
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading resumes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">My Resumes</h2>
        <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
          <Upload size={18} />
          Upload Resume
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {uploading && (
        <div className="text-center py-4 text-blue-600">
          Uploading and parsing resume...
        </div>
      )}

      {resumes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileText className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600">No resumes uploaded yet</p>
          <p className="text-sm text-gray-500 mt-2">Upload your resume to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-4 flex-1">
                <FileText className="text-blue-600" size={32} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{resume.file_name}</h3>
                    {resume.is_primary && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Uploaded {new Date(resume.uploaded_at).toLocaleDateString()}
                  </p>
                  {resume.parsed_data && (
                    <p className="text-xs text-gray-600 mt-1">
                      Parsed: {resume.parsed_data.skills?.length || 0} skills detected
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPrimaryResume(resume.id)}
                  disabled={resume.is_primary}
                  className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  title={resume.is_primary ? 'Already primary' : 'Set as primary'}
                >
                  {resume.is_primary ? <Star size={20} fill="currentColor" /> : <StarOff size={20} />}
                </button>
                <button
                  onClick={() => deleteResume(resume.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  title="Delete resume"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
