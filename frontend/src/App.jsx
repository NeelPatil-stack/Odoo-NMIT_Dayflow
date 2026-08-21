import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute, EmployeeRoute, PublicRoute } from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import EmployeeLayout from './layouts/EmployeeLayout';

// Auth pages (eager loaded)
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';

// Lazy-loaded pages for performance
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const Employees = lazy(() => import('./pages/admin/Employees'));
const EmployeeDetail = lazy(() => import('./pages/admin/EmployeeDetail'));
const Departments = lazy(() => import('./pages/admin/Departments'));
const AdminAttendance = lazy(() => import('./pages/admin/Attendance'));
const LeaveRequests = lazy(() => import('./pages/admin/LeaveRequests'));
const AdminPayroll = lazy(() => import('./pages/admin/Payroll'));
const Holidays = lazy(() => import('./pages/admin/Holidays'));
const Announcements = lazy(() => import('./pages/admin/Announcements'));
const Reports = lazy(() => import('./pages/admin/Reports'));
const Feedback = lazy(() => import('./pages/admin/Feedback'));
const Recruitment = lazy(() => import('./pages/admin/Recruitment'));
const Settings = lazy(() => import('./pages/admin/Settings'));

// Employee pages
const EmployeeDashboard = lazy(() => import('./pages/employee/Dashboard'));
const EmployeeAttendance = lazy(() => import('./pages/employee/Attendance'));
const EmployeeLeave = lazy(() => import('./pages/employee/Leave'));
const EmployeePayroll = lazy(() => import('./pages/employee/Payroll'));
const EmployeeProfile = lazy(() => import('./pages/employee/Profile'));
const Directory = lazy(() => import('./pages/employee/Directory'));
const FeedbackForm = lazy(() => import('./pages/employee/FeedbackForm'));

// Page loader
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-primary-600/30 border-t-primary-500 rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#16162e',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#16162e' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#16162e' } },
          }}
        />

        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

            {/* Admin routes */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="employees" element={<Employees />} />
              <Route path="employees/:id" element={<EmployeeDetail />} />
              <Route path="departments" element={<Departments />} />
              <Route path="attendance" element={<AdminAttendance />} />
              <Route path="leave-requests" element={<LeaveRequests />} />
              <Route path="payroll" element={<AdminPayroll />} />
              <Route path="holidays" element={<Holidays />} />
              <Route path="announcements" element={<Announcements />} />
              <Route path="reports" element={<Reports />} />
              <Route path="feedback" element={<Feedback />} />
              <Route path="recruitment" element={<Recruitment />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Employee routes */}
            <Route path="/employee" element={<EmployeeRoute><EmployeeLayout /></EmployeeRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<EmployeeDashboard />} />
              <Route path="attendance" element={<EmployeeAttendance />} />
              <Route path="leave" element={<EmployeeLeave />} />
              <Route path="payroll" element={<EmployeePayroll />} />
              <Route path="profile" element={<EmployeeProfile />} />
              <Route path="directory" element={<Directory />} />
              <Route path="feedback" element={<FeedbackForm />} />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
