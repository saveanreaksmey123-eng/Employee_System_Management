import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Users,
  Eye,
  CheckCircle,
  AlertCircle,
  UserCheck,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';

export const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptDetails, setDeptDetails] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const initialForm = {
    name: '',
    code: '',
    description: '',
    head_of_department: '',
    status: 'active',
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/departments');
      setDepartments(res.data || []);
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to fetch departments', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenCreate = () => {
    setEditingDept(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
      head_of_department: dept.head_of_department || '',
      status: dept.status || 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenDetail = async (dept) => {
    try {
      const res = await api.get(`/admin/departments/${dept.id || dept._id || dept.name}`);
      setDeptDetails(res.data);
      setIsDetailOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage({ text: '', type: '' });

    try {
      if (editingDept) {
        const id = editingDept.id || editingDept._id;
        await api.put(`/admin/departments/${id}`, formData);
        setMessage({ text: 'Department updated successfully!', type: 'success' });
      } else {
        await api.post('/admin/departments', formData);
        setMessage({ text: 'Department created successfully!', type: 'success' });
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (err) {
      console.error(err);
      setMessage({
        text: err.response?.data?.message || 'Failed to save department',
        type: 'error',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (dept) => {
    if (!window.confirm(`Are you sure you want to delete ${dept.name}?`)) {
      return;
    }

    try {
      const id = dept.id || dept._id;
      await api.delete(`/admin/departments/${id}`);
      setMessage({ text: 'Department deleted successfully!', type: 'success' });
      fetchDepartments();
    } catch (err) {
      console.error(err);
      setMessage({
        text: err.response?.data?.message || 'Failed to delete department',
        type: 'error',
      });
    }
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

      {/* Header */}
      <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Departments & Divisions
          </h2>
          <p className="text-xs text-slate-500">
            Organize company structure, department heads, and member assignments
          </p>
        </div>
        <Button icon={Plus} onClick={handleOpenCreate}>
          Create Department
        </Button>
      </div>

      {/* Departments Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-slate-500">Loading departments...</span>
          </div>
        </div>
      ) : departments.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No departments found"
          description="Create your organization's first department to get started."
          actionLabel="Create Department"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept) => (
            <div
              key={dept.id || dept._id || dept.name}
              className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
                      {dept.code || 'DEP'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {dept.name}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-400 block">
                        Code: {dept.code}
                      </span>
                    </div>
                  </div>
                  <Badge variant={dept.status === 'active' ? 'success' : 'default'} size="sm">
                    {dept.status || 'active'}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-4">
                  {dept.description || 'No description provided for this department.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Head:</span>
                    <strong className="text-slate-700 font-semibold">
                      {dept.head_of_department || 'Not Assigned'}
                    </strong>
                  </div>
                  <div className="flex items-center gap-1 text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-lg text-xs">
                    <Users className="w-3.5 h-3.5" />
                    <span>{dept.employee_count || 0} Staff</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1 pt-1">
                  <button
                    onClick={() => handleOpenDetail(dept)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                    title="View Staff Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(dept)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-amber-600 transition-colors"
                    title="Edit Department"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(dept)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-rose-600 transition-colors"
                    title="Delete Department"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? `Edit Department: ${editingDept.name}` : 'Create Department'}
        subtitle="Manage department metadata stored in MongoDB"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Department Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Engineering"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Department Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. ENG"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Head of Department</label>
              <input
                type="text"
                placeholder="e.g. Jane Smith"
                value={formData.head_of_department}
                onChange={(e) => setFormData({ ...formData, head_of_department: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                placeholder="Brief summary of department responsibilities..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={formLoading}>
              {editingDept ? 'Update Department' : 'Create Department'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Department Detail Modal (Showing associated members) */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`Department: ${deptDetails?.department?.name}`}
        subtitle={`Total Staff Members: ${deptDetails?.employee_count || 0}`}
        maxWidth="max-w-3xl"
      >
        {deptDetails && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <p className="text-slate-600 font-medium">
                {deptDetails.department.description || 'No description provided.'}
              </p>
              <p className="text-slate-500 text-[11px]">
                Head of Department: <strong>{deptDetails.department.head_of_department || 'N/A'}</strong>
              </p>
            </div>

            <h4 className="font-bold text-slate-800 text-sm">Assigned Employees</h4>
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5">ID</th>
                    <th className="px-4 py-2.5">Full Name</th>
                    <th className="px-4 py-2.5">Position</th>
                    <th className="px-4 py-2.5">Email</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deptDetails.employees && deptDetails.employees.length > 0 ? (
                    deptDetails.employees.map((emp) => (
                      <tr key={emp._id || emp.id}>
                        <td className="px-4 py-2 font-mono font-bold text-indigo-600">
                          {emp.employee_id}
                        </td>
                        <td className="px-4 py-2 font-semibold text-slate-800">{emp.full_name}</td>
                        <td className="px-4 py-2 text-slate-600">{emp.position}</td>
                        <td className="px-4 py-2 text-slate-400">{emp.email}</td>
                        <td className="px-4 py-2">
                          <Badge variant={emp.status === 'Active' ? 'success' : 'default'} size="sm">
                            {emp.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                        No employees currently assigned to this department.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
