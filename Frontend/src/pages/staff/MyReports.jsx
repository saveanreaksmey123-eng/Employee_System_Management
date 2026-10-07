import React, { useState, useEffect } from 'react';
import api, { STORAGE_BASE_URL } from '../../api/client';
import {
  FileText, Plus, Edit2, Trash2, Eye, Paperclip, Download,
  CheckCircle, AlertCircle, MessageSquare, Search,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';

export const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const [message, setMessage] = useState({ text: '', type: '' });

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const initialForm = {
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    attachment: null,
  };
  const [formData, setFormData] = useState(initialForm);
  const [attachmentName, setAttachmentName] = useState('');

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const fetchReports = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.get('/staff/reports', {
        params: {
          page,
          search: search || undefined,
          status: filterStatus || undefined,
        },
      });
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchReports(1), 300);
    return () => clearTimeout(t);
  }, [search, filterStatus]);

  const handleOpenEdit = (rep) => {
    setSelectedReport(rep);
    setFormData({
      title: rep.title,
      description: rep.description,
      date: rep.date,
      attachment: null,
    });
    setAttachmentName(rep.attachment_name || '');
    setIsEditOpen(true);
  };

  const handleOpenDetail = (rep) => {
    setSelectedReport(rep);
    setIsDetailOpen(true);
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append('title', formData.title);
    fd.append('description', formData.description);
    fd.append('date', formData.date);
    if (formData.attachment) fd.append('attachment', formData.attachment);
    return fd;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await api.post('/staff/reports', buildFormData(), {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showMsg('Report submitted successfully!');
      setIsCreateOpen(false);
      fetchReports(1);
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to submit report', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const id = selectedReport._id || selectedReport.id;
      await api.post(`/staff/reports/${id}/update`, buildFormData(), {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showMsg('Report updated successfully!');
      setIsEditOpen(false);
      fetchReports(pagination.currentPage);
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to update report', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (rep) => {
    if (!window.confirm(`Delete report "${rep.title}"?`)) return;
    try {
      const id = rep._id || rep.id;
      await api.delete(`/staff/reports/${id}`);
      showMsg('Report deleted!');
      fetchReports(pagination.currentPage);
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to delete report', 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Reviewed': return <Badge variant="success">Reviewed</Badge>;
      case 'Rejected': return <Badge variant="danger">Rejected</Badge>;
      default: return <Badge variant="warning">Pending</Badge>;
    }
  };

  const ReportFormFields = () => (
    <div className="space-y-4 text-xs">
      <div>
        <label className="block font-bold text-slate-700 mb-1">Report Title *</label>
        <input type="text" required placeholder="Brief descriptive title of your report" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20" />
      </div>
      <div>
        <label className="block font-bold text-slate-700 mb-1">Date *</label>
        <input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white" />
      </div>
      <div>
        <label className="block font-bold text-slate-700 mb-1">Description / Content *</label>
        <textarea rows={5} required placeholder="Detailed description of work done, findings, or issues..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white resize-y leading-relaxed" />
      </div>
      <div>
        <label className="block font-bold text-slate-700 mb-1">Attachment (Optional)</label>
        <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip" onChange={(e) => {
          const file = e.target.files[0];
          if (file) { setFormData({ ...formData, attachment: file }); setAttachmentName(file.name); }
        }} className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" />
        {attachmentName && <p className="text-[11px] text-indigo-700 mt-1 flex items-center gap-1"><Paperclip className="w-3 h-3" /> {attachmentName}</p>}
        <p className="text-[10px] text-slate-400 mt-1">Max 10MB. Accepted: PDF, DOC, XLS, images, ZIP</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Alert */}
      {message.text && (
        <div className={`p-4 rounded-2xl flex items-center gap-2 text-xs font-medium animate-fadeIn ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">My Work Reports</h2>
            <p className="text-xs text-slate-500">Submit activity reports, view admin feedback, and track status</p>
          </div>
          <Button icon={Plus} onClick={() => { setFormData(initialForm); setAttachmentName(''); setIsCreateOpen(true); }}>
            Submit New Report
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search reports by title..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium">
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Report Title</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Attachment</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Admin Feedback</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="py-10 text-center text-slate-400">Loading your reports...</td></tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8">
                    <EmptyState icon={FileText} title="No reports yet" description="Submit your first work activity report using the button above." actionLabel="Submit Report" onAction={() => { setFormData(initialForm); setAttachmentName(''); setIsCreateOpen(true); }} />
                  </td>
                </tr>
              ) : (
                reports.map((rep) => (
                  <tr key={rep._id || rep.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-900 block max-w-[220px] truncate">{rep.title}</span>
                      <span className="text-slate-400 text-[11px] block max-w-[220px] truncate">{rep.description}</span>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-600">{rep.date}</td>
                    <td className="px-5 py-4">
                      {rep.attachment ? (
                        <a href={`${STORAGE_BASE_URL}/${rep.attachment}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 transition-colors">
                          <Paperclip className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[100px]">{rep.attachment_name || 'File'}</span>
                        </a>
                      ) : <span className="text-slate-300">None</span>}
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(rep.status)}</td>
                    <td className="px-5 py-4 max-w-xs">
                      {rep.admin_comment ? (
                        <span className="flex items-start gap-1 text-slate-600">
                          <MessageSquare className="w-3 h-3 text-indigo-500 mt-0.5 shrink-0" />
                          <span className="truncate">{rep.admin_comment}</span>
                        </span>
                      ) : <span className="text-slate-300 italic">Awaiting review</span>}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => handleOpenDetail(rep)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors" title="View Full Report"><Eye className="w-4 h-4" /></button>
                        {rep.status === 'Pending' && (
                          <>
                            <button onClick={() => handleOpenEdit(rep)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-amber-600 transition-colors" title="Edit Report"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(rep)} className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors" title="Delete Report"><Trash2 className="w-4 h-4" /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} totalItems={pagination.total} from={pagination.from} to={pagination.to} onPageChange={(p) => fetchReports(p)} />
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Submit New Work Report" subtitle="Write a task summary or activity report for admin review" maxWidth="max-w-2xl">
        <form onSubmit={handleCreateSubmit}>
          <ReportFormFields />
          <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button type="submit" loading={formLoading}>Submit Report</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Report (Pending Only)" subtitle="You can only edit reports that haven't been reviewed yet" maxWidth="max-w-2xl">
        <form onSubmit={handleEditSubmit}>
          <ReportFormFields />
          <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button type="submit" loading={formLoading}>Update Report</Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={selectedReport?.title} subtitle={`Submitted on ${selectedReport?.date}`} maxWidth="max-w-2xl">
        {selectedReport && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-600 uppercase text-[10px]">Report Status</span>
              {getStatusBadge(selectedReport.status)}
            </div>
            <div>
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-2">Full Description</h4>
              <div className="p-4 rounded-xl bg-white border border-slate-200/80 text-slate-700 text-xs leading-relaxed whitespace-pre-wrap">{selectedReport.description}</div>
            </div>
            {selectedReport.attachment && (
              <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-900 font-medium">
                  <Paperclip className="w-4 h-4 text-indigo-600" />
                  <span>{selectedReport.attachment_name || 'Attached File'}</span>
                </div>
                <a href={`${STORAGE_BASE_URL}/${selectedReport.attachment}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-xs">
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
              </div>
            )}
            {selectedReport.admin_comment && (
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                <p className="font-bold text-amber-900 flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Admin Feedback:</p>
                <p className="text-amber-800 whitespace-pre-wrap font-medium">{selectedReport.admin_comment}</p>
                {selectedReport.reviewed_by && <p className="text-[10px] text-amber-600 pt-1">Reviewed by: <strong>{selectedReport.reviewed_by}</strong></p>}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
