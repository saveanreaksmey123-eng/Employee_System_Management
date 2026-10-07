import React, { useState, useEffect } from 'react';
import api, { STORAGE_BASE_URL } from '../../api/client';
import {
  Users,
  Building2,
  CalendarCheck,
  UserCheck,
  UserX,
  Clock,
  FileText,
  DollarSign,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard/stats');
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Loading organization statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        <span>{error}</span>
      </div>
    );
  }

  const { summary, recent_reports, recent_attendance, department_distribution } = data || {};

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={summary?.total_employees || 0}
          subtitle={`${summary?.active_employees || 0} active employees`}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Total Departments"
          value={summary?.total_departments || 0}
          subtitle="Operational units"
          icon={Building2}
          color="purple"
        />
        <StatCard
          title="Pending Staff Reports"
          value={summary?.pending_reports || 0}
          subtitle={`Out of ${summary?.total_reports || 0} total reports`}
          icon={FileText}
          color="amber"
        />
        <StatCard
          title={`Salary Paid (${summary?.current_month})`}
          value={`$${Number(summary?.total_salary_paid_month || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })}`}
          subtitle={`${summary?.paid_slips_count || 0} paid, ${summary?.unpaid_slips_count || 0} pending`}
          icon={DollarSign}
          color="emerald"
        />
      </div>

      {/* Today's Attendance Overview Bar */}
      <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Today's Attendance Snapshot
            </h3>
            <p className="text-xs text-slate-400">Date: {summary?.today_date}</p>
          </div>
          <Link
            to="/admin/attendance"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <span>View Full Attendance Sheet</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-emerald-900">{summary?.today_present || 0}</p>
              <p className="text-xs font-medium text-emerald-700">Present On-Time</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-amber-900">{summary?.today_late || 0}</p>
              <p className="text-xs font-medium text-amber-700">Late Arrivals</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-rose-900">{summary?.today_absent || 0}</p>
              <p className="text-xs font-medium text-rose-700">Absent / Off</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-sky-50/60 border border-sky-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-sky-900">{summary?.today_on_leave || 0}</p>
              <p className="text-xs font-medium text-sky-700">Approved Leave</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Two Columns: Department Breakdown & Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Department Staff Distribution</span>
              </h3>
              <Link
                to="/admin/departments"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
              >
                <span>Manage</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {department_distribution?.map((dept) => {
                const total = summary?.total_employees || 1;
                const percentage = Math.round((dept.count / total) * 100);
                return (
                  <div key={dept.code} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">
                        {dept.name} ({dept.code})
                      </span>
                      <span className="text-slate-500">
                        {dept.count} members ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Submitted Reports */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Recent Staff Reports</span>
              </h3>
              <Link
                to="/admin/reports"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
              >
                <span>View All</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recent_reports && recent_reports.length > 0 ? (
                recent_reports.map((rep) => (
                  <div key={rep._id || rep.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">{rep.title}</p>
                      <p className="text-[11px] text-slate-400">
                        by <strong className="text-slate-600">{rep.staff_name}</strong> • {rep.department} • {rep.date}
                      </p>
                    </div>
                    <Badge
                      variant={
                        rep.status === 'Reviewed'
                          ? 'success'
                          : rep.status === 'Rejected'
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {rep.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No reports submitted yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Today's Recent Check-ins Table */}
      <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Today's Recent Check-In Records</span>
          </h3>
          <Link
            to="/admin/attendance"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
          >
            <span>Full Sheet</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Employee</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Check In</th>
                <th className="pb-3">Check Out</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recent_attendance && recent_attendance.length > 0 ? (
                recent_attendance.map((att) => (
                  <tr key={att._id || att.id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-semibold text-slate-800">
                      <div>
                        <span>{att.employee_name}</span>
                        <span className="block text-[10px] text-slate-400">{att.employee_id}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600">{att.department}</td>
                    <td className="py-3 font-mono text-slate-700">{att.check_in || '--:--'}</td>
                    <td className="py-3 font-mono text-slate-700">{att.check_out || '--:--'}</td>
                    <td className="py-3">
                      <Badge
                        variant={
                          att.status === 'Present'
                            ? 'success'
                            : att.status === 'Late'
                            ? 'warning'
                            : 'danger'
                        }
                        size="sm"
                      >
                        {att.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-400">
                    No attendance recorded for today yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
