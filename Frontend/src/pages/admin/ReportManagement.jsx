import React, { useState, useEffect } from 'react';
import api, { STORAGE_BASE_URL } from '../../api/client';
import {
  FileText,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Paperclip,
  Download,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';

export const ReportManagement = () => {
  const [reports, setReports] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });

  // Review Modal State
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reviewForm, setReviewForm] = useState({ status: 'Reviewed', admin_comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchReports = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        search: search || undefined,
        status: selectedStatus || undefined,
        department: selectedDept || undefined,
        date: selectedDate || undefined,
      };
      const res = await api.get('/admin/reports', { params });
      setReports(res.data.data || []);
      setPagination({
        currentPage: res.data.current_page || 1,
        totalPages: res.data.last_page || 1,
        total: res.data.total || 0,
        from: res.data.from,
        to: res.data.to,
      });
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to fetch reports', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/admin/departments');
      setDepartments(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReports(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedStatus, selectedDept, selectedDate]);

  const handleOpenReview = (report) => {
    setSelectedReport(report);
    setReviewForm({
      status: report.status === 'Pending' ? 'Reviewed' : report.status,
      admin_comment: report.admin_comment || '',
    });
    setIsReviewOpen(true);
  };

  const handleOpenDetail = (report) => {
    setSelectedReport(report);
    setIsDetailOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const id = selectedReport._id || selectedReport.id;
      await api.put(`/admin/reports/${id}/review`, reviewForm);
      setMessage({ text: 'Report status and feedback saved successfully!', type: 'success' });
      setIsReviewOpen(false);
      fetchReports(pagination.currentPage);
    } catch (err) {
      console.error(err);
      setMessage({
        text: err.response?.data?.message || 'Failed to review report',
        type: 'error',
      });
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDelete = async (report) => {
    if (!window.confirm(`Are you sure you want to delete report "${report.title}"?`)) {
      return;
    }

    try {
      const id = report._id || report.id;
      await api.delete(`/admin/reports/${id}`);
      setMessage({ text: 'Report deleted successfully!', type: 'success' });
      fetchReports(pagination.currentPage);
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to delete report', type: 'error' });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Reviewed':
        return <Badge variant="success">Reviewed</Badge>;
      case 'Rejected':
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="warning">Pending Review</Badge>;
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

      {/* Header & Filter Controls */}
      <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Staff Work & Task Reports
          </h2>
          <p className="text-xs text-slate-500">
            Review submissions from all departments, provide executive feedback, or reject reports
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, staff name, content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>

          <div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Report Title</th>
                <th className="px-5 py-3.5">Staff & Department</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Attachment</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Admin Comment</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Loading reports list...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8">
                    <EmptyState
                      icon={FileText}
                      title="No reports found"
                      description="No staff reports match your search criteria."
                    />
                  </td>
                </tr>
              ) : (
                reports.map((rep) => (
                  <tr key={rep._id || rep.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-4 font-bold text-slate-900 max-w-xs truncate">
                      <span>{rep.title}</span>
                      <p className="text-[11px] font-normal text-slate-500 truncate mt-0.5">
                        {rep.description}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-800 block">{rep.staff_name}</span>
                      <span className="text-[11px] text-slate-400 block">{rep.department}</span>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-600">{rep.date}</td>
                    <td className="px-5 py-4">
                      {rep.attachment ? (
                        <a
                          href={`${STORAGE_BASE_URL}/${rep.attachment}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 transition-colors"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[120px]">
                            {rep.attachment_name || 'Download'}
                          </span>
                        </a>
                      ) : (
                        <span className="text-slate-300">None</span>
                      )}
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(rep.status)}</td>
                    <td className="px-5 py-4 max-w-xs text-slate-600 truncate">
                      {rep.admin_comment ? (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span className="truncate">{rep.admin_comment}</span>
                        </span>
                      ) : (
                        <span className="text-slate-300 italic">No comments yet</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(rep)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                          title="View Full Report"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenReview(rep)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-emerald-600 transition-colors"
                          title="Review / Add Comment"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(rep)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-rose-600 transition-colors"
                          title="Delete Report"
                        >
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

        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          from={pagination.from}
          to={pagination.to}
          onPageChange={(p) => fetchReports(p)}
        />
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        title={`Review Report: ${selectedReport?.title}`}
        subtitle={`Submitted by ${selectedReport?.staff_name} (${selectedReport?.department})`}
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Update Status *</label>
            <div className="grid grid-cols-3 gap-3">
              {['Reviewed', 'Pending', 'Rejected'].map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setReviewForm({ ...reviewForm, status: st })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    reviewForm.status === st
                      ? st === 'Reviewed'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : st === 'Rejected'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Admin Comments & Feedback
            </label>
            <textarea
              rows={4}
              placeholder="Write feedback, approval notes, or rejection remarks for the staff member..."
              value={reviewForm.admin_comment}
              onChange={(e) => setReviewForm({ ...reviewForm, admin_comment: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsReviewOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={reviewLoading}>
              Save Review Decision
            </Button>
          </div>
        </form>
      </Modal>

      {/* Report Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedReport?.title}
        subtitle={`Submitted on ${selectedReport?.date} by ${selectedReport?.staff_name}`}
        maxWidth="max-w-2xl"
      >
        {selectedReport && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Author & Dept</p>
                <p className="font-bold text-slate-800">
                  {selectedReport.staff_name} • {selectedReport.department}
                </p>
              </div>
              <div>{getStatusBadge(selectedReport.status)}</div>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Report Details & Description
              </h4>
              <div className="p-4 rounded-xl bg-white border border-slate-200/80 whitespace-pre-wrap text-slate-700 text-xs leading-relaxed font-sans">
                {selectedReport.description}
              </div>
            </div>

            {selectedReport.attachment && (
              <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-900 font-medium">
                  <Paperclip className="w-4 h-4 text-indigo-600" />
                  <span>{selectedReport.attachment_name || 'Attached File'}</span>
                </div>
                <a
                  href={`${STORAGE_BASE_URL}/${selectedReport.attachment}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Attachment</span>
                </a>
              </div>
            )}

            {selectedReport.admin_comment && (
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                <p className="font-bold text-amber-900 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Admin Feedback / Comment:</span>
                </p>
                <p className="text-amber-800 whitespace-pre-wrap font-medium">
                  {selectedReport.admin_comment}
                </p>
                {selectedReport.reviewed_by && (
                  <p className="text-[10px] text-amber-600 pt-1">
                    Reviewed by: <strong>{selectedReport.reviewed_by}</strong>
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
