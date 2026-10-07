import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  CalendarCheck,
  Search,
  Filter,
  UserCheck,
  UserX,
  Clock,
  Plus,
  CheckCircle,
  AlertCircle,
  Calendar,
  Building2,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';

export const AttendanceManagement = () => {
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'history'
  const [todayData, setTodayData] = useState(null);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for History Tab
  const [filterDate, setFilterDate] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });

  // Today sub-filter
  const [todaySubTab, setTodaySubTab] = useState('all'); // 'all', 'present', 'late', 'absent', 'unrecorded'

  // Mark Attendance Modal
  const [isMarkOpen, setIsMarkOpen] = useState(false);
  const [markForm, setMarkForm] = useState({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    check_in: '08:00:00',
    check_out: '17:00:00',
    status: 'Present',
    notes: 'Admin manual entry',
  });
  const [markLoading, setMarkLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchToday = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/attendance/today');
      setTodayData(res.data);
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to load today attendance', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        search: search || undefined,
        date: filterDate || undefined,
        department: filterDept || undefined,
        status: filterStatus || undefined,
      };
      const res = await api.get('/admin/attendance', { params });
      setHistoryRecords(res.data.data || []);
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
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [deptRes, empRes] = await Promise.all([
        api.get('/admin/departments'),
        api.get('/admin/employees?per_page=100'),
      ]);
      setDepartments(deptRes.data || []);
      setEmployees(empRes.data.data || []);
      if (empRes.data.data?.length > 0 && !markForm.employee_id) {
        setMarkForm((prev) => ({ ...prev, employee_id: empRes.data.data[0].employee_id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    if (activeTab === 'today') {
      fetchToday();
    } else {
      fetchHistory(1);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'history') {
      const timer = setTimeout(() => {
        fetchHistory(1);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [search, filterDate, filterDept, filterStatus]);

  const handleMarkSubmit = async (e) => {
    e.preventDefault();
    setMarkLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await api.post('/admin/attendance/mark', markForm);
      setMessage({ text: 'Attendance recorded successfully!', type: 'success' });
      setIsMarkOpen(false);
      if (activeTab === 'today') fetchToday();
      else fetchHistory(pagination.currentPage);
    } catch (err) {
      console.error(err);
      setMessage({
        text: err.response?.data?.message || 'Failed to mark attendance',
        type: 'error',
      });
    } finally {
      setMarkLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return <Badge variant="success">Present</Badge>;
      case 'Late':
        return <Badge variant="warning">Late</Badge>;
      case 'Absent':
        return <Badge variant="danger">Absent</Badge>;
      case 'On Leave':
        return <Badge variant="info">On Leave</Badge>;
      case 'Half Day':
        return <Badge variant="purple">Half Day</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTodayListToDisplay = () => {
    if (!todayData) return [];
    if (todaySubTab === 'present') return todayData.present_employees || [];
    if (todaySubTab === 'late') return todayData.late_employees || [];
    if (todaySubTab === 'absent') return todayData.absent_employees || [];
    if (todaySubTab === 'unrecorded') return todayData.unrecorded_employees || [];
    return todayData.all_today || [];
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {message.text && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-medium animate-fadeIn ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage({ text: '', type: '' })}
            className="text-slate-400 hover:text-slate-600 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Header */}
      <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Attendance & Timesheets
          </h2>
          <p className="text-xs text-slate-500">
            Monitor real-time clock-ins, late arrivals, absences, and historical attendance logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('today')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'today'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today's Overview
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Attendance History & Filters
            </button>
          </div>

          <Button icon={Plus} onClick={() => setIsMarkOpen(true)}>
            Record Attendance
          </Button>
        </div>
      </div>

      {/* Tab 1: Today's Overview */}
      {activeTab === 'today' && todayData && (
        <div className="space-y-5">
          {/* Top Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div
              onClick={() => setTodaySubTab('present')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                todaySubTab === 'present'
                  ? 'bg-emerald-100/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white border-slate-200/80 hover:bg-emerald-50/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Present
                </span>
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="text-2xl font-black text-emerald-950">
                {todayData.summary.present || 0}
              </h4>
              <p className="text-[11px] text-emerald-700 mt-1">Checked in on time</p>
            </div>

            <div
              onClick={() => setTodaySubTab('late')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                todaySubTab === 'late'
                  ? 'bg-amber-100/70 border-amber-300 ring-2 ring-amber-500/20 shadow-xs'
                  : 'bg-white border-slate-200/80 hover:bg-amber-50/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  Late Arrivals
                </span>
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <h4 className="text-2xl font-black text-amber-950">
                {todayData.summary.late || 0}
              </h4>
              <p className="text-[11px] text-amber-700 mt-1">After 08:30 AM</p>
            </div>

            <div
              onClick={() => setTodaySubTab('absent')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                todaySubTab === 'absent'
                  ? 'bg-rose-100/70 border-rose-300 ring-2 ring-rose-500/20 shadow-xs'
                  : 'bg-white border-slate-200/80 hover:bg-rose-50/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                  Absent / Unrecorded
                </span>
                <UserX className="w-5 h-5 text-rose-600" />
              </div>
              <h4 className="text-2xl font-black text-rose-950">
                {todayData.summary.absent || 0}
              </h4>
              <p className="text-[11px] text-rose-700 mt-1">Not clocked in today</p>
            </div>

            <div
              onClick={() => setTodaySubTab('all')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                todaySubTab === 'all'
                  ? 'bg-indigo-100/70 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-white border-slate-200/80 hover:bg-indigo-50/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                  Total Active Staff
                </span>
                <CalendarCheck className="w-5 h-5 text-indigo-600" />
              </div>
              <h4 className="text-2xl font-black text-indigo-950">
                {todayData.summary.total_active_employees || 0}
              </h4>
              <p className="text-[11px] text-indigo-700 mt-1">
                {todayData.summary.total_recorded || 0} records logged
              </p>
            </div>
          </div>

          {/* Today Sub Filter Badges */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 mr-1">Showing Category:</span>
            {['all', 'present', 'late', 'absent', 'unrecorded'].map((sub) => (
              <button
                key={sub}
                onClick={() => setTodaySubTab(sub)}
                className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                  todaySubTab === sub
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Today's Table */}
          <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Employee ID</th>
                    <th className="px-5 py-3.5">Employee Name</th>
                    <th className="px-5 py-3.5">Department</th>
                    <th className="px-5 py-3.5">Check In</th>
                    <th className="px-5 py-3.5">Check Out</th>
                    <th className="px-5 py-3.5">Work Hours</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {getTodayListToDisplay().length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400">
                        No employees found in this category for today.
                      </td>
                    </tr>
                  ) : (
                    getTodayListToDisplay().map((item) => {
                      const empId = item.employee_id;
                      const name = item.employee_name || item.full_name;
                      const dept = item.department;
                      const checkIn = item.check_in || '--:--';
                      const checkOut = item.check_out || '--:--';
                      const status = item.status || (todaySubTab === 'unrecorded' ? 'Absent' : 'Pending');
                      const workHours = item.work_hours || 0;
                      const notes = item.notes || (todaySubTab === 'unrecorded' ? 'No check-in record' : '-');

                      return (
                        <tr key={item._id || item.id || empId} className="hover:bg-slate-50/60">
                          <td className="px-5 py-3.5 font-mono font-bold text-indigo-600">{empId}</td>
                          <td className="px-5 py-3.5 font-bold text-slate-800">{name}</td>
                          <td className="px-5 py-3.5 text-slate-600">{dept}</td>
                          <td className="px-5 py-3.5 font-mono text-slate-700">{checkIn}</td>
                          <td className="px-5 py-3.5 font-mono text-slate-700">{checkOut}</td>
                          <td className="px-5 py-3.5 text-slate-700">{workHours} hrs</td>
                          <td className="px-5 py-3.5">{getStatusBadge(status)}</td>
                          <td className="px-5 py-3.5 text-slate-500 italic max-w-xs truncate">
                            {notes}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Attendance History & Search Filters */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* History Search Filters */}
          <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search employee name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Absent">Absent</option>
              <option value="On Leave">On Leave</option>
              <option value="Half Day">Half Day</option>
            </select>
          </div>

          {/* History Records Table */}
          <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5">Employee</th>
                    <th className="px-5 py-3.5">Department</th>
                    <th className="px-5 py-3.5">Check In</th>
                    <th className="px-5 py-3.5">Check Out</th>
                    <th className="px-5 py-3.5">Work Hours</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400">
                        Loading history...
                      </td>
                    </tr>
                  ) : historyRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400">
                        No historical attendance records matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    historyRecords.map((att) => (
                      <tr key={att._id || att.id} className="hover:bg-slate-50/60">
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-800">{att.date}</td>
                        <td className="px-5 py-3.5 font-semibold text-slate-900">
                          <div>
                            <span>{att.employee_name}</span>
                            <span className="block text-[10px] text-slate-400">{att.employee_id}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">{att.department}</td>
                        <td className="px-5 py-3.5 font-mono text-slate-700">{att.check_in || '--:--'}</td>
                        <td className="px-5 py-3.5 font-mono text-slate-700">{att.check_out || '--:--'}</td>
                        <td className="px-5 py-3.5 text-slate-700">{att.work_hours || 0} hrs</td>
                        <td className="px-5 py-3.5">{getStatusBadge(att.status)}</td>
                        <td className="px-5 py-3.5 text-slate-500 italic max-w-xs truncate">
                          {att.notes || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              from={pagination.from}
              to={pagination.to}
              onPageChange={(p) => fetchHistory(p)}
            />
          </div>
        </div>
      )}

      {/* Admin Record Attendance Modal */}
      <Modal
        isOpen={isMarkOpen}
        onClose={() => setIsMarkOpen(false)}
        title="Record / Adjust Attendance"
        subtitle="Manually add or update an attendance record for any employee"
      >
        <form onSubmit={handleMarkSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Employee *</label>
            <select
              required
              value={markForm.employee_id}
              onChange={(e) => setMarkForm({ ...markForm, employee_id: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            >
              {employees.map((emp) => (
                <option key={emp.employee_id} value={emp.employee_id}>
                  {emp.full_name} ({emp.employee_id}) - {emp.department}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={markForm.date}
                onChange={(e) => setMarkForm({ ...markForm, date: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Attendance Status *</label>
              <select
                value={markForm.status}
                onChange={(e) => setMarkForm({ ...markForm, status: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              >
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Absent">Absent</option>
                <option value="On Leave">On Leave</option>
                <option value="Half Day">Half Day</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Check In Time</label>
              <input
                type="time"
                step="1"
                value={markForm.check_in}
                onChange={(e) => setMarkForm({ ...markForm, check_in: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Check Out Time</label>
              <input
                type="time"
                step="1"
                value={markForm.check_out}
                onChange={(e) => setMarkForm({ ...markForm, check_out: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Admin Notes</label>
              <input
                type="text"
                placeholder="Reason for adjustment or special note..."
                value={markForm.notes}
                onChange={(e) => setMarkForm({ ...markForm, notes: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsMarkOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={markLoading}>
              Save Attendance Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
