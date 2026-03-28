import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DoctorSearchPage from '@/pages/DoctorSearchPage';
import DoctorDetailPage from '@/pages/DoctorDetailPage';
import AppointmentsPage from '@/pages/AppointmentsPage';
import QueueTrackerPage from '@/pages/QueueTrackerPage';
import PatientDashboard from '@/pages/PatientDashboard';
import DoctorDashboard from '@/pages/DoctorDashboard';
import DoctorAppointments from '@/pages/DoctorAppointments';
import DoctorQueuePage from '@/pages/DoctorQueuePage';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminDoctorsPage from '@/pages/AdminDoctorsPage';
import AdminAppointmentsPage from '@/pages/AdminAppointmentsPage';
import AdminPatientsPage from '@/pages/AdminPatientsPage';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="doctors" element={<DoctorSearchPage />} />
        <Route path="doctors/:id" element={<DoctorDetailPage />} />
        <Route path="appointments" element={<ProtectedRoute roles={['patient']}><AppointmentsPage /></ProtectedRoute>} />
        <Route path="queue" element={<ProtectedRoute><QueueTrackerPage /></ProtectedRoute>} />
        <Route path="dashboard" element={<ProtectedRoute roles={['patient']}><PatientDashboard /></ProtectedRoute>} />
        <Route path="doctor/dashboard" element={<ProtectedRoute roles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
        <Route path="doctor/appointments" element={<ProtectedRoute roles={['doctor']}><DoctorAppointments /></ProtectedRoute>} />
        <Route path="doctor/queue" element={<ProtectedRoute roles={['doctor']}><DoctorQueuePage /></ProtectedRoute>} />
        <Route path="admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="admin/doctors" element={<ProtectedRoute roles={['admin']}><AdminDoctorsPage /></ProtectedRoute>} />
        <Route path="admin/appointments" element={<ProtectedRoute roles={['admin']}><AdminAppointmentsPage /></ProtectedRoute>} />
        <Route path="admin/patients" element={<ProtectedRoute roles={['admin']}><AdminPatientsPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
