import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  Clock, LogIn, LogOut, CheckCircle, AlertCircle,
  Calendar, Filter, Search,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';

export const MyAttendance = () => {
  const [todayRecord, setTodayRecord] = useState(null);
  const [todayLoading, setTodayLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [histLoading, setHistLoading] = useState(true);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [filterStatus, setFilterStatus] = useState('');
  const [activeTab, setActiveTab] = useState('today');

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const fetchToday = async () => {
    try {
      setTodayLoading(true);
      const res = await api.get('/staff/attendance/today');
      setTodayRecord(res.data.attendance);
    } catch (err) {
      console.error(err);
    } finally {
      setTodayLoading(false);
    }
  };

  const fetchHistory = async (page = 1) => {
    try {
      setHistLoading(true);
      const res = await api.get('/staff/attendance/history', {
        params: { page, per_page: 20, status: filterStatus || undefined },
      });
      setHistory(res.data.data || []);
      setPagination({
        currentPage: res.data.current_page || 1,
        totalPages: res.data.last_page || 1,
        total: res.data.total || 0,
        from: res.data.from,
        to: res.data.to,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setHistLoading(false);
    }
  };

  useEffect(() => { fetchToday(); fetchHistory(1); }, []);
  useEffect(() => { fetchHistory(1); }, [filterStatus]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      const res = await api.post('/staff/attendance/check-in');
      showMsg(res.data.message);
      await fetchToday();
      await fetchHistory(1);
    } catch (err) {
      showMsg(err.response?.data?.message || 'Check-in failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      const res = await api.post('/staff/attendance/check-out');
      showMsg(res.data.message);
      await fetchToday();
      await fetchHistory(1);
    } catch (err) {
      showMsg(err.response?.data?.message || 'Check-out failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present': return <Badge variant="success">Present</Badge>;
      case 'Late': return <Badge variant="warning">Late</Badge>;
      case 'Absent': return <Badge variant="danger">Absent</Badge>;
      case 'On Leave': return <Badge variant="info">On Leave</Badge>;
      case 'Half Day': return <Badge variant="purple">Half Day</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const now = new Date();
  const today = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Alert */}
      {message.text && (
        <div className={`p-4 rounded-2xl flex items-center gap-2 text-xs font-medium animate-fadeIn ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex bg-white border border-slate-200/80 rounded-2xl p-1.5 gap-1 shadow-xs">
        {[
          { key: 'today', label: 'Today — Check In/Out', icon: LogIn },
          { key: 'history', label: 'My Attendance History', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${activeTab === tab.key ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Today Tab */}
      {activeTab === 'today' && (
        <div className="space-y-5">
          {/* Date/Time Hero */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 p-6 text-white text-center shadow-xl">
            <p className="text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">Current Date & Time</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-1">{timeStr}</h2>
            <p className="text-indigo-200 text-sm">{today}</p>
          </div>

          {/* Today's Status Card */}
          <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" /> Today's Attendance Record
            </h3>

            {todayLoading ? (
              <div className="text-center py-4 text-slate-400 text-xs">Loading...</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs mb-5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Status</p>
                  <div className="mt-1 flex justify-center">
                    {todayRecord ? getStatusBadge(todayRecord.status) : <Badge variant="default" size="sm">Not Recorded</Badge>}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                  <p className="text-[10px] uppercase font-bold text-emerald-600">Check In</p>
                  <p className="font-black text-emerald-900 text-lg mt-0.5 font-mono">{todayRecord?.check_in || '--:--'}</p>
                </div>
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-center">
                  <p className="text-[10px] uppercase font-bold text-indigo-600">Check Out</p>
                  <p className="font-black text-indigo-900 text-lg mt-0.5 font-mono">{todayRecord?.check_out || '--:--'}</p>
                </div>
                <div className="p-3 rounded-xl bg-violet-50 border border-violet-100 text-center">
                  <p className="text-[10px] uppercase font-bold text-violet-600">Work Hours</p>
                  <p className="font-black text-violet-900 text-lg mt-0.5">{todayRecord?.work_hours || 0} hrs</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1 py-3 text-sm font-bold rounded-2xl"
                icon={LogIn}
                onClick={handleCheckIn}
                disabled={!!todayRecord?.check_in || actionLoading}
                loading={actionLoading && !todayRecord?.check_in}
                variant="success"
              >
                {todayRecord?.check_in ? `Already Checked In at ${todayRecord.check_in}` : 'Check In Now'}
              </Button>
              <Button
                className="flex-1 py-3 text-sm font-bold rounded-2xl"
                icon={LogOut}
                onClick={handleCheckOut}
                disabled={!todayRecord?.check_in || !!todayRecord?.check_out || actionLoading}
                loading={actionLoading && !!todayRecord?.check_in && !todayRecord?.check_out}
                variant="secondary"
              >
                {todayRecord?.check_out ? `Checked Out at ${todayRecord.check_out}` : 'Check Out Now'}
              </Button>
            </div>

            {todayRecord?.notes && (
              <p className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-800 font-medium">
                📝 {todayRecord.notes}
              </p>
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
            >
              <option value="">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Absent">Absent</option>
              <option value="On Leave">On Leave</option>
            </select>
            <span className="text-xs text-slate-400 font-medium">Total: {pagination.total} records</span>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5">Check In</th>
                    <th className="px-5 py-3.5">Check Out</th>
                    <th className="px-5 py-3.5">Work Hours</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {histLoading ? (
                    <tr><td colSpan={6} className="py-10 text-center text-slate-400">Loading history...</td></tr>
                  ) : history.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8">
                        <EmptyState icon={Calendar} title="No attendance records" description="Your attendance history will appear here after you start checking in." />
                      </td>
                    </tr>
                  ) : (
                    history.map((rec) => (
                      <tr key={rec._id || rec.id} className="hover:bg-slate-50/60">
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-800">{rec.date}</td>
                        <td className="px-5 py-3.5 font-mono text-slate-700">{rec.check_in || '--:--'}</td>
                        <td className="px-5 py-3.5 font-mono text-slate-700">{rec.check_out || '--:--'}</td>
                        <td className="px-5 py-3.5 font-semibold text-violet-700">{rec.work_hours || 0} hrs</td>
                        <td className="px-5 py-3.5">{getStatusBadge(rec.status)}</td>
                        <td className="px-5 py-3.5 text-slate-500 italic max-w-xs truncate">{rec.notes || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} totalItems={pagination.total} from={pagination.from} to={pagination.to} onPageChange={(p) => fetchHistory(p)} />
          </div>
        </div>
      )}
    </div>
  );
};
