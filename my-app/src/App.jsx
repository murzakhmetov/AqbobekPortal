import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './i18n/LanguageContext';
import LoginPage from './pages/LoginPage';
import Layout from './components/layout/Layout';

import StudentDashboard from './pages/student/StudentDashboard';
import GradesPage from './pages/student/GradesPage';
import AITutorPage from './pages/student/AITutorPage';
import PortfolioPage from './pages/student/PortfolioPage';
import LeaderboardPage from './pages/student/LeaderboardPage';

import TeacherDashboard from './pages/teacher/TeacherDashboard';
import RiskAnalyticsPage from './pages/teacher/RiskAnalyticsPage';
import ReportGeneratorPage from './pages/teacher/ReportGeneratorPage';

import ParentDashboard from './pages/parent/ParentDashboard';
import WeeklySummaryPage from './pages/parent/WeeklySummaryPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import ScheduleManagerPage from './pages/admin/ScheduleManagerPage';
import NewsManagerPage from './pages/admin/NewsManagerPage';

import KioskPage from './pages/kiosk/KioskPage';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="loader"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} />;
  }
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading-screen"><div className="loader"></div></div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={`/${user.role}`} /> : <LoginPage />} />
      <Route path="/kiosk" element={<KioskPage />} />
      <Route path="/admin/kiosk" element={<ProtectedRoute allowedRoles={['admin']}><KioskPage /></ProtectedRoute>} />

      <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><Layout /></ProtectedRoute>}>
        <Route index element={<StudentDashboard />} />
        <Route path="grades" element={<GradesPage />} />
        <Route path="ai-tutor" element={<AITutorPage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
      </Route>

      <Route path="/teacher" element={<ProtectedRoute allowedRoles={['teacher']}><Layout /></ProtectedRoute>}>
        <Route index element={<TeacherDashboard />} />
        <Route path="risk-analytics" element={<RiskAnalyticsPage />} />
        <Route path="reports" element={<ReportGeneratorPage />} />
      </Route>

      <Route path="/parent" element={<ProtectedRoute allowedRoles={['parent']}><Layout /></ProtectedRoute>}>
        <Route index element={<ParentDashboard />} />
        <Route path="weekly-summary" element={<WeeklySummaryPage />} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Layout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="schedule" element={<ScheduleManagerPage />} />
        <Route path="news" element={<NewsManagerPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
