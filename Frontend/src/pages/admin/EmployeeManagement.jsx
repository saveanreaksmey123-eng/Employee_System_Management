import React, { useState, useEffect } from 'react';
import api, { STORAGE_BASE_URL } from '../../api/client';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  DollarSign,
  User,
  MapPin,
  CheckCircle,
  AlertCircle,
  Upload,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';

export const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDetailData, setEmployeeDetailData] = useState(null);

  // Form State
  const initialForm = {
    employee_id: '',
    full_name: '',
    email: '',
    phone: '',
    gender: 'Male',
    date_of_birth: '',
    department: '',
    position: '',
    hire_date: new Date().toISOString().split('T')[0],
    salary: '',
    status: 'Active',
    address: '',
    create_user_account: true,
    password: 'password123',
    profile_image: null,
  };
  const [formData, setFormData] = useState(initialForm);
  const [imagePreview, setImagePreview] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchEmployees = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        search: search || undefined,
        department: selectedDept || undefined,
        status: selectedStatus || undefined,
        gender: selectedGender || undefined,
      };
      const res = await api.get('/admin/employees', { params });
      setEmployees(res.data.data || []);
      setPagination({
        currentPage: res.data.current_page || 1,
        totalPages: res.data.last_page || 1,
        total: res.data.total || 0,
        from: res.data.from,
        to: res.data.to,
      });
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to load employees list', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/admin/departments');
      setDepartments(res.data || []);
      if (res.data.length > 0 && !formData.department) {
        setFormData((prev) => ({ ...prev, department: res.data[0].name }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchEmployees(1);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, selectedDept, selectedStatus, selectedGender]);

  const handleOpenCreate = () => {
    setFormData({
      ...initialForm,
      department: departments[0]?.name || 'Engineering',
    });
    setImagePreview(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setSelectedEmployee(emp);
    setFormData({
      employee_id: emp.employee_id,
      full_name: emp.full_name,
      email: emp.email,
      phone: emp.phone || '',
      gender: emp.gender || 'Male',
      date_of_birth: emp.date_of_birth || '',
      department: emp.department,
      position: emp.position,
      hire_date: emp.hire_date || '',
      salary: emp.salary,
      status: emp.status,
      address: emp.address || '',
      profile_image: null,
    });
    setImagePreview(emp.profile_image ? `${STORAGE_BASE_URL}/${emp.profile_image}` : null);
    setIsEditOpen(true);
  };

  const handleOpenDetail = async (emp) => {
    setSelectedEmployee(emp);
    setIsDetailOpen(true);
    try {
      const res = await api.get(`/admin/employees/${emp.employee_id || emp._id}`);
      setEmployeeDetailData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profile_image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          if (key === 'create_user_account') {
            payload.append(key, formData[key] ? '1' : '0');
          } else {
            payload.append(key, formData[key]);
          }
        }
      });

      await api.post('/admin/employees', payload);

      setMessage({ text: 'Employee created successfully!', type: 'success' });
      setIsCreateOpen(false);
      fetchEmployees(1);
    } catch (err) {
      console.error(err);
      const resData = err.response?.data;
      let errorMsg = resData?.message || 'Failed to create employee';
      if (resData?.errors) {
        const errorDetails = Object.values(resData.errors).flat().join(' ');
        if (errorDetails) {
          errorMsg = `${errorMsg}: ${errorDetails}`;
        }
      }
      setMessage({
        text: errorMsg,
        type: 'error',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          payload.append(key, formData[key]);
        }
      });

      const empId = selectedEmployee.employee_id || selectedEmployee._id;
      await api.post(`/admin/employees/${empId}`, payload);

      setMessage({ text: 'Employee updated successfully!', type: 'success' });
      setIsEditOpen(false);
      fetchEmployees(pagination.currentPage);
    } catch (err) {
      console.error(err);
      const resData = err.response?.data;
      let errorMsg = resData?.message || 'Failed to update employee';
      if (resData?.errors) {
        const errorDetails = Object.values(resData.errors).flat().join(' ');
        if (errorDetails) {
          errorMsg = `${errorMsg}: ${errorDetails}`;
        }
      }
      setMessage({
        text: errorMsg,
        type: 'error',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (emp) => {
    if (!window.confirm(`Are you sure you want to delete ${emp.full_name} (${emp.employee_id})?`)) {
      return;
    }

    try {
      const empId = emp.employee_id || emp._id;
      await api.delete(`/admin/employees/${empId}`);
      setMessage({ text: 'Employee deleted successfully', type: 'success' });
      fetchEmployees(pagination.currentPage);
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to delete employee', type: 'error' });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <Badge variant="success">Active</Badge>;
      case 'On Leave':
        return <Badge variant="info">On Leave</Badge>;
      case 'Resigned':
        return <Badge variant="warning">Resigned</Badge>;
      case 'Terminated':
        return <Badge variant="danger">Terminated</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {message.text && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-medium animate-fadeIn ${message.type === 'success'
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

      {/* Header and Controls */}
      <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Organization Employees
            </h2>
            <p className="text-xs text-slate-500">
              Manage complete employee personnel profiles, job designations, and salaries
            </p>
          </div>
          <Button icon={Plus} onClick={handleOpenCreate}>
            Add New Employee
          </Button>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Resigned">Resigned</option>
            <option value="Terminated">Terminated</option>
          </select>

          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Employee ID</th>
                <th className="px-5 py-3.5">Full Name & Email</th>
                <th className="px-5 py-3.5">Department & Position</th>
                <th className="px-5 py-3.5">Phone & Gender</th>
                <th className="px-5 py-3.5">Salary</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading employee directory...</span>
                    </div>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8">
                    <EmptyState
                      title="No employees found"
                      description="No employees match your search criteria. Try modifying your filters or create a new employee."
                      actionLabel="Add Employee"
                      onAction={handleOpenCreate}
                    />
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
                  const avatar = emp.profile_image
                    ? `${STORAGE_BASE_URL}/${emp.profile_image}`
                    : null;
                  return (
                    <tr key={emp._id || emp.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-indigo-600">
                        {emp.employee_id}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {avatar ? (
                            <img
                              src={avatar}
                              alt={emp.full_name}
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xs">
                              {emp.full_name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-slate-900 block">{emp.full_name}</span>
                            <span className="text-slate-400 text-[11px] block">{emp.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-800 block">{emp.department}</span>
                        <span className="text-slate-400 text-[11px] block">{emp.position}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        <span className="block">{emp.phone || 'N/A'}</span>
                        <span className="text-[11px] text-slate-400">{emp.gender}</span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        ${Number(emp.salary).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-4">{getStatusBadge(emp.status)}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(emp)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(emp)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-amber-600 transition-colors"
                            title="Edit Employee"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(emp)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-rose-600 transition-colors"
                            title="Delete Employee"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
          onPageChange={(p) => fetchEmployees(p)}
        />
      </div>

      {/* Create Employee Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Employee"
        subtitle="Register personnel into MongoDB and optionally provision user account"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          {/* Avatar Upload */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white border border-slate-200 flex items-center justify-center shrink-0">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Employee Profile Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-xs text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Employee ID (Optional)</label>
              <input
                type="text"
                placeholder="Leave blank for auto-generation (e.g. EMP-1006)"
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Michael Scott"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="e.g. michael@ems.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+855 12 345 678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Department *</label>
              <select
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              >
                {departments.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Position / Job Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Software Engineer"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Hire Date *</label>
              <input
                type="date"
                required
                value={formData.hire_date}
                onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Basic Salary (USD) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="e.g. 3500.00"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Resigned">Resigned</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Residential Address</label>
              <input
                type="text"
                placeholder="Street address, City"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* User Account Provisioning Option */}
          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.create_user_account}
                onChange={(e) =>
                  setFormData({ ...formData, create_user_account: e.target.checked })
                }
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-bold text-indigo-900">
                Auto-create Staff User Login Account (MySQL)
              </span>
            </label>

            {formData.create_user_account && (
              <div>
                <label className="block font-medium text-indigo-800 mb-1">
                  Default Account Password:
                </label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full max-w-xs p-2 bg-white border border-indigo-200 rounded-lg text-xs font-mono"
                />
                <span className="text-[10px] text-indigo-600 block mt-1">
                  Staff can login with their email address and this password.
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={formLoading}>
              Save & Register Employee
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit Employee: ${selectedEmployee?.full_name}`}
        subtitle={`ID: ${selectedEmployee?.employee_id}`}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          {/* Avatar Upload */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white border border-slate-200 flex items-center justify-center shrink-0">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Change Profile Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-xs text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Department *</label>
              <select
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              >
                {departments.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Position *</label>
              <input
                type="text"
                required
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Hire Date *</label>
              <input
                type="date"
                required
                value={formData.hire_date}
                onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Basic Salary (USD) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Resigned">Resigned</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Residential Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={formLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Employee Detail Drawer / Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Employee Personnel Record"
        subtitle={`Complete dossier for ${selectedEmployee?.full_name}`}
        maxWidth="max-w-4xl"
      >
        {selectedEmployee && (
          <div className="space-y-6 text-xs">
            {/* Top Profile Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row items-center gap-5">
              {selectedEmployee.profile_image ? (
                <img
                  src={`${STORAGE_BASE_URL}/${selectedEmployee.profile_image}`}
                  alt={selectedEmployee.full_name}
                  className="w-20 h-20 rounded-2xl object-cover ring-2 ring-white/20 shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg">
                  {selectedEmployee.full_name.charAt(0)}
                </div>
              )}
              <div className="text-center sm:text-left space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-lg font-bold">{selectedEmployee.full_name}</h3>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-lg bg-white/10 text-indigo-200">
                    {selectedEmployee.employee_id}
                  </span>
                </div>
                <p className="text-indigo-200 font-medium">
                  {selectedEmployee.position} • {selectedEmployee.department}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-[11px] text-slate-300">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {selectedEmployee.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {selectedEmployee.phone || 'No phone'}
                  </span>
                </div>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Gender</p>
                <p className="font-bold text-slate-800">{selectedEmployee.gender}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Date of Birth</p>
                <p className="font-bold text-slate-800">{selectedEmployee.date_of_birth || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Hire Date</p>
                <p className="font-bold text-slate-800">{selectedEmployee.hire_date}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Monthly Salary</p>
                <p className="font-bold text-emerald-600 text-sm">
                  ${Number(selectedEmployee.salary).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="col-span-2 sm:col-span-4 pt-2 border-t border-slate-200/60">
                <p className="text-[10px] uppercase font-bold text-slate-400">Address</p>
                <p className="font-semibold text-slate-700">{selectedEmployee.address || 'N/A'}</p>
              </div>
            </div>

            {/* Recent Attendance History for this employee */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Recent Attendance Records (Last 10)</span>
              </h4>
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400">
                    <tr>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Check In</th>
                      <th className="px-3 py-2">Check Out</th>
                      <th className="px-3 py-2">Work Hours</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employeeDetailData?.attendances && employeeDetailData.attendances.length > 0 ? (
                      employeeDetailData.attendances.slice(0, 10).map((att) => (
                        <tr key={att._id || att.id}>
                          <td className="px-3 py-2 font-mono">{att.date}</td>
                          <td className="px-3 py-2 font-mono">{att.check_in || '--:--'}</td>
                          <td className="px-3 py-2 font-mono">{att.check_out || '--:--'}</td>
                          <td className="px-3 py-2">{att.work_hours || 0} hrs</td>
                          <td className="px-3 py-2">{getStatusBadge(att.status)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-3 py-4 text-center text-slate-400">
                          No attendance history recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
