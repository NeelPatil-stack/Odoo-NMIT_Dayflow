import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, AlertTriangle, Calendar, Search, Filter, RefreshCw, Check, X, ShieldAlert } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';

export default function AdminAttendance() {
  const [activeTab, setActiveTab] = useState('daily');
  const [attendance, setAttendance] = useState([]);
  const [regularizations, setRegularizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reviewModal, setReviewModal] = useState(null); // request object
  const [adminComment, setAdminComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedDate, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'daily') {
        const res = await api.get(`/attendance?date=${selectedDate}`);
        setAttendance(res.data.data || []);
      } else {
        const res = await api.get('/attendance/regularization');
        setRegularizations(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching attendance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    setSubmitting(true);
    try {
      await api.patch(`/attendance/regularization/${id}/review`, {
        status,
        adminComment,
      });
      toast.success(`Request ${status} successfully`);
      setReviewModal(null);
      setAdminComment('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process request');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAttendance = attendance.filter(item => {
    const name = `${item.employee?.first_name || ''} ${item.employee?.last_name || ''}`.toLowerCase();
    const empId = (item.employee?.employee_id || '').toLowerCase();
    return name.includes(search.toLowerCase()) || empId.includes(search.toLowerCase());
  });

  const getStatusBadge = (status) => {
    const badges = {
      present: 'bg-success-500/10 text-success-400 border-success-500/20',
      absent: 'bg-danger-500/10 text-danger-400 border-danger-500/20',
      late: 'bg-warning-500/10 text-warning-400 border-warning-500/20',
      half_day: 'bg-accent-500/10 text-accent-400 border-accent-500/20',
      leave: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    };
    return <span className={`badge border ${badges[status] || 'bg-gray-500/10 text-gray-400'}`}>{status}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Attendance Management</h1>
          <p className="text-sm text-gray-400">Monitor employee check-ins, working hours, and regularization requests.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('daily')}
            className={`btn ${activeTab === 'daily' ? 'btn-primary' : 'btn-ghost text-gray-400'}`}
          >
            <Clock className="w-4 h-4 mr-2" /> Daily Log
          </button>
          <button
            onClick={() => setActiveTab('regularization')}
            className={`btn ${activeTab === 'regularization' ? 'btn-primary' : 'btn-ghost text-gray-400'}`}
          >
            <ShieldAlert className="w-4 h-4 mr-2" /> Regularizations
          </button>
        </div>
      </div>

      {activeTab === 'daily' ? (
        <div className="card space-y-4">
          {/* Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input text-sm py-2 max-w-[180px]"
              />
              <button onClick={fetchData} className="btn btn-icon">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-9 text-sm py-2"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase bg-white/[0.02] text-gray-400 border-b border-white/5">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Check In</th>
                  <th className="py-3 px-4">Check Out</th>
                  <th className="py-3 px-4">Working Hours</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-400">Loading attendance data...</td>
                  </tr>
                ) : filteredAttendance.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500">No attendance records found for this date.</td>
                  </tr>
                ) : (
                  filteredAttendance.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.01]">
                      <td className="py-3 px-4 font-medium text-white">
                        {item.employee?.first_name} {item.employee?.last_name}
                        <span className="block text-xs text-gray-500">{item.employee?.employee_id}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {item.check_in ? new Date(item.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {item.check_out ? new Date(item.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="py-3 px-4 text-gray-300 font-mono">
                        {item.working_hours ? `${item.working_hours} hrs` : '—'}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(item.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Regularization tab */
        <div className="card space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase bg-white/[0.02] text-gray-400 border-b border-white/5">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Requested Times</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-400">Loading regularization requests...</td>
                  </tr>
                ) : regularizations.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500">No pending regularization requests.</td>
                  </tr>
                ) : (
                  regularizations.map((req) => (
                    <tr key={req.id} className="hover:bg-white/[0.01]">
                      <td className="py-3 px-4 font-medium text-white">
                        {req.employee?.first_name} {req.employee?.last_name}
                      </td>
                      <td className="py-3 px-4 text-gray-300">{req.date}</td>
                      <td className="py-3 px-4 text-gray-300 text-xs">
                        In: {req.requested_check_in ? new Date(req.requested_check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}<br/>
                        Out: {req.requested_check_out ? new Date(req.requested_check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-400 max-w-xs truncate">{req.reason}</td>
                      <td className="py-3 px-4">
                        <span className={`badge ${req.status === 'approved' ? 'badge-success' : req.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {req.status === 'pending' && (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setReviewModal(req)} className="btn btn-xs btn-primary">
                              Review
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <Modal isOpen={!!reviewModal} onClose={() => setReviewModal(null)} title="Review Regularization Request">
          <div className="space-y-4">
            <div className="p-3 bg-white/5 rounded-xl text-sm space-y-1">
              <p className="text-gray-400">Employee: <span className="text-white font-medium">{reviewModal.employee?.first_name} {reviewModal.employee?.last_name}</span></p>
              <p className="text-gray-400">Date: <span className="text-white">{reviewModal.date}</span></p>
              <p className="text-gray-400">Reason: <span className="text-white">{reviewModal.reason}</span></p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Admin Comment (Optional)</label>
              <textarea
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Enter remarks..."
                className="input text-sm w-full h-20"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                disabled={submitting}
                onClick={() => handleReview(reviewModal.id, 'rejected')}
                className="btn btn-danger text-sm"
              >
                Reject Request
              </button>
              <button
                disabled={submitting}
                onClick={() => handleReview(reviewModal.id, 'approved')}
                className="btn btn-primary text-sm"
              >
                Approve Request
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
