import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  CheckCircle,
  Eye,
  Zap,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const currentYear = new Date().getFullYear();
const currentMonth = MONTHS[new Date().getMonth()];

export const SalaryManagement = () => {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState(String(currentYear));
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const [message, setMessage] = useState({ text: '', type: '' });

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const initialForm = {
    employee_id: '',
    month: currentMonth,
    year: currentYear,
    basic_salary: '',
    bonus: '0',
    deduction: '0',
    payment_status: 'Unpaid',
    payment_date: '',
    note: '',
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchRecords = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        search: search || undefined,
        month: filterMonth || undefined,
        year: filterYear || undefined,
        payment_status: filterStatus || undefined,
        department: filterDept || undefined,
      };
      const res = await api.get('/admin/salaries', { params });
      setRecords(res.data.data || []);
      setPagination({
        currentPage: res.data.current_page || 1,
        totalPages: res.data.last_page || 1,
        total: res.data.total || 0,
        from: res.data.from,
        to: res.data.to,
      });
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to load salary records', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [empRes, deptRes] = await Promise.all([
        api.get('/admin/employees?per_page=100'),
        api.get('/admin/departments'),
      ]);
      setEmployees(empRes.data.data || []);
      setDepartments(deptRes.data || []);
      if (empRes.data.data?.length > 0) {
        setFormData((prev) => ({
          ...prev,
          employee_id: empRes.data.data[0].employee_id,
          basic_salary: empRes.data.data[0].salary || '',
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchMetadata(); }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchRecords(1), 300);
    return () => clearTimeout(t);
  }, [search, filterMonth, filterYear, filterStatus, filterDept]);

  const handleOpenCreate = () => {
    const firstEmp = employees[0];
    setFormData({
      ...initialForm,
      employee_id: firstEmp?.employee_id || '',
      basic_salary: firstEmp?.salary || '',
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (rec) => {
    setSelectedRecord(rec);
    setFormData({
      employee_id: rec.employee_id,
      month: rec.month,
      year: rec.year,
      basic_salary: rec.basic_salary,
      bonus: rec.bonus || '0',
      deduction: rec.deduction || '0',
      payment_status: rec.payment_status,
      payment_date: rec.payment_date || '',
      note: rec.note || '',
    });
    setIsEditOpen(true);
  };

  // Auto-fill basic salary when employee selected on create
  const handleEmployeeChange = (empId) => {
    const emp = employees.find((e) => e.employee_id === empId);
    setFormData((prev) => ({
      ...prev,
      employee_id: empId,
      basic_salary: emp?.salary || prev.basic_salary,
    }));
  };

  const calcNet = (basic, bonus, deduction) => {
    return (parseFloat(basic) || 0) + (parseFloat(bonus) || 0) - (parseFloat(deduction) || 0);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage({ text: '', type: '' });
    try {
      await api.post('/admin/salaries', { ...formData, year: parseInt(formData.year) });
      setMessage({ text: 'Salary payment record created!', type: 'success' });
      setIsCreateOpen(false);
      fetchRecords(1);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to create salary record', type: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const id = selectedRecord._id || selectedRecord.id;
      await api.put(`/admin/salaries/${id}`, { ...formData, year: parseInt(formData.year) });
      setMessage({ text: 'Salary record updated!', type: 'success' });
      setIsEditOpen(false);
      fetchRecords(pagination.currentPage);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to update salary record', type: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleMarkPaid = async (rec) => {
    if (!window.confirm(`Mark ${rec.employee_name}'s ${rec.month} ${rec.year} salary as Paid?`)) return;
    try {
      const id = rec._id || rec.id;
      await api.patch(`/admin/salaries/${id}/mark-paid`);
      setMessage({ text: `Salary for ${rec.employee_name} marked as Paid!`, type: 'success' });
      fetchRecords(pagination.currentPage);
    } catch (err) {
      setMessage({ text: 'Failed to mark as paid', type: 'error' });
    }
  };

  const handleDelete = async (rec) => {
    if (!window.confirm(`Delete salary record for ${rec.employee_name} (${rec.month} ${rec.year})?`)) return;
    try {
      const id = rec._id || rec.id;
      await api.delete(`/admin/salaries/${id}`);
      setMessage({ text: 'Salary record deleted!', type: 'success' });
      fetchRecords(pagination.currentPage);
    } catch (err) {
      setMessage({ text: 'Failed to delete salary record', type: 'error' });
    }
  };


  const SalaryForm = ({ onSubmit, isEdit = false }) => (
    <form onSubmit={onSubmit} className="space-y-4 text-xs">
      {!isEdit && (
        <div>
          <label className="block font-bold text-slate-700 mb-1">Select Employee *</label>
          <select
            required
            value={formData.employee_id}
            onChange={(e) => handleEmployeeChange(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
          >
            {employees.map((emp) => (
              <option key={emp.employee_id} value={emp.employee_id}>
                {emp.full_name} ({emp.employee_id}) — {emp.department}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {!isEdit && (
          <>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Month *</label>
              <select
                required
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              >
                {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Year *</label>
              <input
                type="number"
                required
                min="2020"
                max="2100"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>
          </>
        )}

        <div>
          <label className="block font-bold text-slate-700 mb-1">Basic Salary (USD) *</label>
          <input
            type="number"
            step="0.01"
            required
            value={formData.basic_salary}
            onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Bonus (USD)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.bonus}
            onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Deduction (USD)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.deduction}
            onChange={(e) => setFormData({ ...formData, deduction: e.target.value })}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Payment Status *</label>
          <select
            value={formData.payment_status}
            onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white font-bold"
          >
            <option value="Unpaid">Unpaid</option>
            <option value="Paid">Paid</option>
          </select>
        </div>

        {formData.payment_status === 'Paid' && (
          <div>
            <label className="block font-bold text-slate-700 mb-1">Payment Date</label>
            <input
              type="date"
              value={formData.payment_date}
              onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>
        )}
      </div>

      {/* Net Salary Preview */}
      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
        <span className="font-bold text-emerald-800">Net Salary Preview:</span>
        <span className="text-lg font-black text-emerald-700">
          ${calcNet(formData.basic_salary, formData.bonus, formData.deduction).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">Admin Notes</label>
        <textarea
          rows={2}
          placeholder="Optional note on this payroll record..."
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button variant="secondary" onClick={() => isEdit ? setIsEditOpen(false) : setIsCreateOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" loading={formLoading}>
          {isEdit ? 'Update Salary Record' : 'Create Salary Record'}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {message.text && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-medium animate-fadeIn ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage({ text: '', type: '' })} className="text-slate-400 hover:text-slate-600 font-bold">×</button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Payroll & Salary Payments</h2>
            <p className="text-xs text-slate-500">Track, disburse and verify employee monthly compensation records</p>
          </div>
          <div className="flex items-center gap-2">
            <Button icon={Plus} onClick={handleOpenCreate}>
              Add Salary Record
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or employee ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All Months</option>
            {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All Payment Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All Departments</option>
            {departments.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
          </select>
        </div>
      </div>

      {/* Salary Records Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Employee</th>
                <th className="px-5 py-3.5">Period</th>
                <th className="px-5 py-3.5">Basic Salary</th>
                <th className="px-5 py-3.5">Bonus</th>
                <th className="px-5 py-3.5">Deduction</th>
                <th className="px-5 py-3.5">Net Salary</th>
                <th className="px-5 py-3.5">Payment Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={9} className="py-10 text-center text-slate-400">Loading payroll records...</td></tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8">
                    <EmptyState icon={DollarSign} title="No salary records found" description="No payroll records match your search criteria. Add individual records." actionLabel="Add Salary Record" onAction={handleOpenCreate} />
                  </td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr key={rec._id || rec.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-900 block">{rec.employee_name}</span>
                      <span className="text-[11px] font-mono text-indigo-500 block">{rec.employee_id}</span>
                      <span className="text-[11px] text-slate-400">{rec.department}</span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-700">{rec.month} {rec.year}</td>
                    <td className="px-5 py-4 text-slate-700">${Number(rec.basic_salary).toFixed(2)}</td>
                    <td className="px-5 py-4 text-emerald-600 font-semibold">+${Number(rec.bonus || 0).toFixed(2)}</td>
                    <td className="px-5 py-4 text-rose-600 font-semibold">-${Number(rec.deduction || 0).toFixed(2)}</td>
                    <td className="px-5 py-4 font-black text-slate-900">${Number(rec.net_salary).toFixed(2)}</td>
                    <td className="px-5 py-4 font-mono text-slate-600">{rec.payment_date || '—'}</td>
                    <td className="px-5 py-4">
                      <Badge variant={rec.payment_status === 'Paid' ? 'success' : 'warning'}>
                        {rec.payment_status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {rec.payment_status === 'Unpaid' && (
                          <button onClick={() => handleMarkPaid(rec)} className="p-1.5 rounded-lg text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors" title="Mark as Paid">
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleOpenEdit(rec)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-amber-600 transition-colors" title="Edit Record">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(rec)} className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors" title="Delete Record">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} totalItems={pagination.total} from={pagination.from} to={pagination.to} onPageChange={(p) => fetchRecords(p)} />
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Salary Payment Record" subtitle="Add a new monthly payroll entry for an employee" maxWidth="max-w-2xl">
        <SalaryForm onSubmit={handleCreateSubmit} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Edit: ${selectedRecord?.employee_name} — ${selectedRecord?.month} ${selectedRecord?.year}`} subtitle="Modify salary components and payment status" maxWidth="max-w-2xl">
        <SalaryForm onSubmit={handleEditSubmit} isEdit={true} />
      </Modal>


    </div>
  );
};
