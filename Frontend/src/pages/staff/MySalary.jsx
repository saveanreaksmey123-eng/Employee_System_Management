import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  DollarSign, CheckCircle2, Clock, TrendingUp,
  Calendar, AlertCircle, Lock,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';

export const MySalary = () => {
  const [currentPayment, setCurrentPayment] = useState(null);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const [filterYear, setFilterYear] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    const fetchCurrent = async () => {
      try {
        const res = await api.get('/staff/salaries/current');
        setCurrentPayment(res.data.current_payment);
        setEmployeeInfo(res.data.employee);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCurrent();
  }, []);

  const fetchHistory = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.get('/staff/salaries', {
        params: {
          page,
          year: filterYear || undefined,
          payment_status: filterStatus || undefined,
        },
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
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(1); }, [filterYear, filterStatus]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Read-Only Notice */}
      <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-[11px] text-amber-800 font-medium flex items-center gap-2">
        <Lock className="w-4 h-4 shrink-0 text-amber-600" />
        Salary information is set and managed by HR/Administration. You cannot modify salary amounts or mark payments as paid.
      </div>

      {/* Current Salary Info Card */}
      {employeeInfo && (
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 p-6 text-white shadow-xl">
          <p className="text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> My Current Compensation
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-indigo-300 text-[10px] uppercase font-bold">Basic Salary</p>
              <p className="text-2xl font-black mt-1">${Number(employeeInfo.basic_salary || 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-indigo-300 text-[10px] uppercase font-bold">Department</p>
              <p className="text-base font-bold mt-1">{employeeInfo.department}</p>
            </div>
            <div>
              <p className="text-indigo-300 text-[10px] uppercase font-bold">Position</p>
              <p className="text-base font-bold mt-1">{employeeInfo.position}</p>
            </div>
            <div>
              <p className="text-indigo-300 text-[10px] uppercase font-bold">Employee ID</p>
              <p className="text-base font-bold mt-1 font-mono">{employeeInfo.employee_id}</p>
            </div>
          </div>
        </div>
      )}

      {/* Current Month Payment */}
      <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600" /> Current Month Salary Status
        </h3>

        {currentPayment ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-700">{currentPayment.month} {currentPayment.year}</p>
                <p className="text-[11px] text-slate-400">Pay Period</p>
              </div>
              <Badge variant={currentPayment.payment_status === 'Paid' ? 'success' : 'warning'} size="lg">
                {currentPayment.payment_status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Basic Salary</p>
                <p className="font-bold text-slate-900">${Number(currentPayment.basic_salary).toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <p className="text-[10px] uppercase font-bold text-emerald-600 mb-1">Bonus</p>
                <p className="font-bold text-emerald-900">+${Number(currentPayment.bonus || 0).toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
                <p className="text-[10px] uppercase font-bold text-rose-600 mb-1">Deduction</p>
                <p className="font-bold text-rose-900">-${Number(currentPayment.deduction || 0).toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                <p className="text-[10px] uppercase font-bold text-indigo-600 mb-1">Net Salary</p>
                <p className="font-black text-indigo-900 text-base">${Number(currentPayment.net_salary).toFixed(2)}</p>
              </div>
            </div>

            {currentPayment.payment_status === 'Paid' && currentPayment.payment_date && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Salary disbursed on <strong>{currentPayment.payment_date}</strong>
              </div>
            )}

            {currentPayment.payment_status === 'Unpaid' && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2 font-medium">
                <Clock className="w-4 h-4 text-amber-600" />
                Your salary for this month is being processed by payroll.
              </div>
            )}

            {currentPayment.note && (
              <p className="text-[11px] text-slate-500 italic p-2 bg-slate-50 rounded-xl border border-slate-100">
                📝 Note: {currentPayment.note}
              </p>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 text-center">
            No salary record found for the current month. Payroll may not have been processed yet.
          </div>
        )}
      </div>

      {/* Salary History */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" /> Salary Payment History
            </h3>
            <div className="flex items-center gap-3">
              <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                <option value="">All Years</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                <option value="">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Period</th>
                <th className="px-5 py-3.5">Basic Salary</th>
                <th className="px-5 py-3.5">Bonus</th>
                <th className="px-5 py-3.5">Deduction</th>
                <th className="px-5 py-3.5">Net Salary</th>
                <th className="px-5 py-3.5">Payment Date</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="py-10 text-center text-slate-400">Loading salary history...</td></tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8">
                    <EmptyState icon={DollarSign} title="No salary history" description="Your historical salary payment records will appear here." />
                  </td>
                </tr>
              ) : (
                history.map((rec) => (
                  <tr key={rec._id || rec.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{rec.month} {rec.year}</td>
                    <td className="px-5 py-3.5 text-slate-700">${Number(rec.basic_salary).toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-emerald-600 font-semibold">+${Number(rec.bonus || 0).toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-rose-600 font-semibold">-${Number(rec.deduction || 0).toFixed(2)}</td>
                    <td className="px-5 py-3.5 font-black text-slate-900">${Number(rec.net_salary).toFixed(2)}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-600">{rec.payment_date || '—'}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={rec.payment_status === 'Paid' ? 'success' : 'warning'}>
                        {rec.payment_status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} totalItems={pagination.total} from={pagination.from} to={pagination.to} onPageChange={(p) => fetchHistory(p)} />
      </div>
    </div>
  );
};
