import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  FileText,
  UserCheck,
  DollarSign,
  User,
  Clock,
  Briefcase,
  X,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, isStaff, employee } = useAuth();

  const adminNavItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Employees', path: '/admin/employees', icon: Users },
    { label: 'Departments', path: '/admin/departments', icon: Building2 },
    { label: 'Attendance', path: '/admin/attendance', icon: CalendarCheck },
    { label: 'Staff Reports', path: '/admin/reports', icon: FileText },
    { label: 'User Accounts', path: '/admin/users', icon: UserCheck },
    { label: 'Salary / Payroll', path: '/admin/salary', icon: DollarSign },
  ];

  const staffNavItems = [
    { label: 'Staff Dashboard', path: '/staff/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', path: '/staff/profile', icon: User },
    { label: 'My Attendance', path: '/staff/attendance', icon: Clock },
    { label: 'My Reports', path: '/staff/reports', icon: FileText },
    { label: 'My Salary', path: '/staff/salary', icon: DollarSign },
  ];

  const navItems = isAdmin ? adminNavItems : staffNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200/80 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-base tracking-tight block">
                Employee Management System
              </span>
              <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider block">
                {isAdmin ? 'Admin Console' : 'Staff Portal'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {isAdmin ? 'Management Menu' : 'Employee Self-Service'}
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-200'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card in Sidebar Footer */}
        <div className="p-3 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
              {isAdmin ? 'AD' : employee?.employee_id || 'ST'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-800 truncate">
                {employee?.full_name || user?.name}
              </p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
