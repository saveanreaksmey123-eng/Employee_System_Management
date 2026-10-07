import React, { useState, useEffect } from 'react';
import api, { STORAGE_BASE_URL } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  User, Clock, DollarSign, FileText, CheckCircle2, ArrowRight,
  Calendar, Building2, Briefcase, TrendingUp, AlertCircle,
  UserCheck, UserX,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Link } from 'react-router-dom';

export const StaffDashboard = () => {
  const { user, employee } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/staff/dashboard');
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading your workspace...</p>
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

  const emp = data?.employee;
  const todayAtt = data?.today_attendance;
  const currentSalary = data?.current_month_salary;
  const attSummary = data?.attendance_summary;
  const reportsSummary = data?.reports_summary;
  const recentAttendance = data?.recent_attendance || [];
  const recentReports = data?.recent_reports || [];

  const avatarUrl = emp?.profile_image ? `${STORAGE_BASE_URL}/${emp.profile_image}` : null;

  return (
    <div className="space-y-6">
      {/* Employee Welcome Hero Card */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-900 to-violet-900 p-6 text-white shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {avatarUrl ? (
            <img src={avatarUrl} alt={emp?.full_name} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/30 shadow-lg shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center font-black text-2xl text-white shadow-lg shrink-0">
              {(emp?.full_name || user?.name || 'S').charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">
              Welcome back 👋
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight truncate">
              {emp?.full_name || user?.name}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-indigo-200 font-medium">
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" /> {emp?.position || 'N/A'}
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> {emp?.department || 'N/A'}
              </span>
              <span className="flex items-center gap-1 font-mono">
                ID: {emp?.employee_id}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-indigo-200 text-[11px] font-semibold uppercase tracking-wider">Basic Salary</p>
            <p className="text-2xl font-black text-white mt-0.5">
              ${Number(emp?.salary || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </p>
            <p className="text-indigo-300 text-[11px]">per month</p>
          </div>
        </div>
      </div>

      {/* Today Attendance Status Banner */}
      <div className={`rounded-2xl p-5 border ${todayAtt ? (todayAtt.status === 'Present' ? 'bg-emerald-50 border-emerald-200' : todayAtt.status === 'Late' ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200') : 'bg-slate-50 border-slate-200'} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${todayAtt ? (todayAtt.status === 'Present' ? 'bg-emerald-600' : todayAtt.status === 'Late' ? 'bg-amber-500' : 'bg-rose-600') : 'bg-slate-300'} text-white`}>
            {todayAtt ? <UserCheck className="w-5 h-5" /> : <UserX className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Today's Attendance Status</p>
            {todayAtt ? (
              <>
                <p className={`font-extrabold text-lg ${todayAtt.status === 'Present' ? 'text-emerald-800' : todayAtt.status === 'Late' ? 'text-amber-800' : 'text-rose-800'}`}>
                  {todayAtt.status}
                </p>
                <p className="text-xs text-slate-600">
                  Check In: <strong>{todayAtt.check_in || '--:--'}</strong> &nbsp;|&nbsp;
                  Check Out: <strong>{todayAtt.check_out || 'Not yet'}</strong> &nbsp;|&nbsp;
                  Hours: <strong>{todayAtt.work_hours || '0'} hrs</strong>
                </p>
              </>
            ) : (
              <p className="font-extrabold text-lg text-slate-700">Not Checked In Yet</p>
            )}
          </div>
        </div>

        <Link
          to="/staff/attendance"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-xs shadow-indigo-200"
        >
          {!todayAtt || !todayAtt.check_in ? 'Check In Now' : !todayAtt.check_out ? 'Check Out Now' : 'View Attendance'}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Monthly Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Days Present</p>
          <h3 className="text-2xl font-black text-emerald-600">{attSummary?.days_present || 0}</h3>
          <p className="text-[11px] text-slate-500">This month</p>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Days Late</p>
          <h3 className="text-2xl font-black text-amber-600">{attSummary?.days_late || 0}</h3>
          <p className="text-[11px] text-slate-500">This month</p>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">My Reports</p>
          <h3 className="text-2xl font-black text-indigo-600">{reportsSummary?.total_reports || 0}</h3>
          <p className="text-[11px] text-slate-500">{reportsSummary?.pending || 0} pending review</p>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Work Hrs</p>
          <h3 className="text-2xl font-black text-violet-600">{attSummary?.total_work_hours || 0}</h3>
          <p className="text-[11px] text-slate-500">This month</p>
        </div>
      </div>

      {/* Current Month Salary Card */}
      {emp && (
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-indigo-600" />
              Current Month Salary Status
            </h3>
            <Link to="/staff/salary" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View History <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {currentSalary ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1 text-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Basic</p>
                  <p className="font-bold text-slate-800">${Number(currentSalary.basic_salary).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Bonus</p>
                  <p className="font-bold text-emerald-600">+${Number(currentSalary.bonus || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Deduction</p>
                  <p className="font-bold text-rose-600">-${Number(currentSalary.deduction || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Net Salary</p>
                  <p className="font-black text-slate-900 text-base">${Number(currentSalary.net_salary).toFixed(2)}</p>
                </div>
              </div>
              <Badge variant={currentSalary.payment_status === 'Paid' ? 'success' : 'warning'} size="lg">
                {currentSalary.payment_status}
              </Badge>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-800 font-medium">
              No salary record found for the current month. Your payroll may not have been processed yet. Please contact HR.
            </div>
          )}
        </div>
      )}

      {/* Bottom Grid: Recent Attendance + Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Recent Attendance
            </h3>
            <Link to="/staff/attendance" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              Full History <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentAttendance.length > 0 ? recentAttendance.slice(0, 6).map((att) => (
              <div key={att._id || att.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 text-xs">
                <div>
                  <span className="font-mono font-bold text-slate-700 block">{att.date}</span>
                  <span className="text-slate-400">
                    {att.check_in || '--:--'} → {att.check_out || 'N/A'}
                    {att.work_hours ? ` · ${att.work_hours}hrs` : ''}
                  </span>
                </div>
                <Badge variant={att.status === 'Present' ? 'success' : att.status === 'Late' ? 'warning' : 'danger'} size="sm">
                  {att.status}
                </Badge>
              </div>
            )) : (
              <p className="text-xs text-slate-400 text-center py-4">No attendance history yet.</p>
            )}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              My Recent Reports
            </h3>
            <Link to="/staff/reports" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentReports.length > 0 ? recentReports.map((rep) => (
              <div key={rep._id || rep.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 text-xs">
                <div className="truncate mr-3">
                  <span className="font-bold text-slate-800 truncate block">{rep.title}</span>
                  <span className="text-slate-400 font-mono">{rep.date}</span>
                </div>
                <Badge variant={rep.status === 'Reviewed' ? 'success' : rep.status === 'Rejected' ? 'danger' : 'warning'} size="sm">
                  {rep.status}
                </Badge>
              </div>
            )) : (
              <p className="text-xs text-slate-400 text-center py-4">No reports submitted yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
