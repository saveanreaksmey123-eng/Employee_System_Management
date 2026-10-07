import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../common/Sidebar';
import { Header } from '../common/Header';

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname) => {
    if (pathname.includes('/admin/dashboard')) return 'Admin Overview Dashboard';
    if (pathname.includes('/admin/employees')) return 'Employee Directory & Management';
    if (pathname.includes('/admin/departments')) return 'Department & Organizational Structure';
    if (pathname.includes('/admin/attendance')) return 'Daily Attendance & Timesheets';
    if (pathname.includes('/admin/reports')) return 'Staff Submitted Reports & Reviews';
    if (pathname.includes('/admin/users')) return 'System User Accounts & Roles';
    if (pathname.includes('/admin/salary')) return 'Payroll & Salary Payments';
    return 'Organization Administration';
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans antialiased text-slate-800">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title={getPageTitle(location.pathname)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
