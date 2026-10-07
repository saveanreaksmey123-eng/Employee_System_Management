import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, LogOut, User as UserIcon, Shield, Building2 } from 'lucide-react';
import { STORAGE_BASE_URL } from '../../api/client';

export const Header = ({ onToggleSidebar, title }) => {
  const { user, employee, logout, isAdmin } = useAuth();

  const avatarUrl = employee?.profile_image
    ? `${STORAGE_BASE_URL}/${employee.profile_image}`
    : null;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
            {title || 'Employee Management System'}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* User Identity Info */}
        <div className="flex items-center gap-3 pl-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-tight">
              {employee?.full_name || user?.name || 'User'}
            </p>
            <div className="flex items-center justify-end gap-1 mt-0.5">
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded-md">
                  <Shield className="w-3 h-3" /> Admin
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                  <Building2 className="w-3 h-3" /> {employee?.position || 'Staff'}
                </span>
              )}
            </div>
          </div>

          <div className="relative flex items-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user?.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20 shadow-xs"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Quick Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-rose-100"
            title="Sign out of your account"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
