import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layouts/ProtectedRoute';
import { AdminLayout } from './components/layouts/AdminLayout';
import { StaffLayout } from './components/layouts/StaffLayout';

/* ---- Lazy-loaded pages for better initial load ---- */

// Auth
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const EmployeeManagement = lazy(() => import('./pages/admin/EmployeeManagement').then((m) => ({ default: m.EmployeeManagement })));
const DepartmentManagement = lazy(() => import('./pages/admin/DepartmentManagement').then((m) => ({ default: m.DepartmentManagement })));
const AttendanceManagement = lazy(() => import('./pages/admin/AttendanceManagement').then((m) => ({ default: m.AttendanceManagement })));
const ReportManagement = lazy(() => import('./pages/admin/ReportManagement').then((m) => ({ default: m.ReportManagement })));
const SalaryManagement = lazy(() => import('./pages/admin/SalaryManagement').then((m) => ({ default: m.SalaryManagement })));
const UserManagement = lazy(() => import('./pages/admin/UserManagement').then((m) => ({ default: m.UserManagement })));

// Staff pages
const StaffDashboard = lazy(() => import('./pages/staff/StaffDashboard').then((m) => ({ default: m.StaffDashboard })));
const MyProfile = lazy(() => import('./pages/staff/MyProfile').then((m) => ({ default: m.MyProfile })));
const MyAttendance = lazy(() => import('./pages/staff/MyAttendance').then((m) => ({ default: m.MyAttendance })));
const MyReports = lazy(() => import('./pages/staff/MyReports').then((m) => ({ default: m.MyReports })));
const MySalary = lazy(() => import('./pages/staff/MySalary').then((m) => ({ default: m.MySalary })));

/* ---- Fallback loading spinner ---- */
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-slate-500 font-semibold">Loading EMS...</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* ============================
                Admin Protected Routes
            ============================= */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="employees" element={<EmployeeManagement />} />
              <Route path="departments" element={<DepartmentManagement />} />
              <Route path="attendance" element={<AttendanceManagement />} />
              <Route path="reports" element={<ReportManagement />} />
              <Route path="salary" element={<SalaryManagement />} />
              <Route path="users" element={<UserManagement />} />
            </Route>

            {/* ============================
                Staff Protected Routes
            ============================= */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute allowedRole="staff">
                  <StaffLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/staff/dashboard" replace />} />
              <Route path="dashboard" element={<StaffDashboard />} />
              <Route path="profile" element={<MyProfile />} />
              <Route path="attendance" element={<MyAttendance />} />
              <Route path="reports" element={<MyReports />} />
              <Route path="salary" element={<MySalary />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
