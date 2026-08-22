import { useState, useEffect } from 'react';
import { DollarSign, FileText, CheckCircle2, Clock, Plus, Search, Filter } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';

export default function AdminPayroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [genModalOpen, setGenModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPayroll();
  }, [month, year]);

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/payroll?month=${month}&year=${year}`);
      setPayrolls(res.data.data || []);
    } catch (err) {
      console.error('Error fetching payroll:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayroll = async () => {
    setSubmitting(true);
    try {
      await api.post('/payroll/generate', { month, year });
      toast.success(`Payroll generated for ${month}/${year}`);
      setGenModalOpen(false);
      fetchPayroll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate payroll');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.patch(`/payroll/${id}/status`, { status });
      toast.success(`Status updated to ${status}`);
      fetchPayroll();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Payroll & Payslips</h1>
          <p className="text-sm text-gray-400">Generate monthly payroll, review structures, and manage disbursements.</p>
        </div>

        <button onClick={() => setGenModalOpen(true)} className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" /> Generate Monthly Payroll
        </button>
      </div>

      <div className="card space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="input text-sm py-1.5 min-w-[120px]"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="input text-sm py-1.5 min-w-[100px]"
            >
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase bg-white/[0.02] text-gray-400 border-b border-white/5">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Basic Salary</th>
                <th className="py-3 px-4">Allowances</th>
                <th className="py-3 px-4">Deductions</th>
                <th className="py-3 px-4">Gross Salary</th>
                <th className="py-3 px-4">Net Salary</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-400">Loading payroll records...</td>
                </tr>
              ) : payrolls.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500">No payroll generated for {month}/{year}. Click 'Generate Monthly Payroll' to create records.</td>
                </tr>
              ) : (
                payrolls.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.01]">
                    <td className="py-3 px-4 font-medium text-white">
                      {p.employee?.first_name} {p.employee?.last_name}
                      <span className="block text-xs text-gray-500">{p.employee?.employee_id}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-300">₹{Number(p.basic_salary).toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-300">₹{(Number(p.hra || 0) + Number(p.allowances || 0)).toLocaleString()}</td>
                    <td className="py-3 px-4 text-danger-400">₹{(Number(p.deductions || 0) + Number(p.tax_deductions || 0)).toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-200 font-medium">₹{Number(p.gross_salary).toLocaleString()}</td>
                    <td className="py-3 px-4 text-success-400 font-bold">₹{Number(p.net_salary).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${
                        p.status === 'paid' ? 'badge-success' :
                        p.status === 'processed' ? 'badge-info' : 'badge-warning'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {p.status !== 'paid' && (
                        <button
                          onClick={() => handleStatusUpdate(p.id, 'paid')}
                          className="btn btn-xs btn-primary"
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Payroll Modal */}
      {genModalOpen && (
        <Modal isOpen={genModalOpen} onClose={() => setGenModalOpen(false)} title="Generate Monthly Payroll">
          <div className="space-y-4">
            <p className="text-sm text-gray-300">
              This action will auto-calculate earnings, allowances, and deductions for all active employees for period: <span className="text-white font-bold">{month}/{year}</span>.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setGenModalOpen(false)} className="btn btn-ghost text-sm">Cancel</button>
              <button disabled={submitting} onClick={handleGeneratePayroll} className="btn btn-primary text-sm">
                {submitting ? 'Generating...' : 'Confirm & Generate'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
