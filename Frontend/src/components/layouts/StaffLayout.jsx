import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../common/Sidebar';
import { Header } from '../common/Header';

export const StaffLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname) => {
    if (pathname.includes('/staff/dashboard')) return 'Staff Dashboard & Overview';
    if (pathname.includes('/staff/profile')) return 'My Profile & Account Settings';
    if (pathname.includes('/staff/attendance')) return 'My Daily Attendance & Check-In';
    if (pathname.includes('/staff/reports')) return 'My Activity & Task Reports';
    if (pathname.includes('/staff/salary')) return 'My Salary Slips & Payment History';
    return 'Staff Portal';
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
