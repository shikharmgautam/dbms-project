import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LandingPage } from './components/LandingPage';
import { StudentDashboard } from './components/student/StudentDashboard';
import { RecruiterDashboard } from './components/recruiter/RecruiterDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Header } from './components/Header';

function AppContent() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {profile.role === 'student' && <StudentDashboard />}
      {profile.role === 'recruiter' && <RecruiterDashboard />}
      {profile.role === 'admin' && <AdminDashboard />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
