import { useState, useEffect } from 'react';
import { DollarSign, Download, Calendar, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function EmployeePayroll() {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayslips();
  }, []);

  const fetchPayslips = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payroll');
      setPayslips(res.data?.data || res.data || []);
    } catch {
      toast.error('Failed to load payslips');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'paid') return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Paid</span>;
    return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Processed</span>;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Payslips</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">View monthly earnings, salary breakdowns, and download payslips.</p>
        </div>

        <button onClick={fetchPayslips} className="btn-secondary text-xs py-2 px-3">
          <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="overflow-x-auto border border-slate-100 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Pay Period</th>
                <th className="py-3 px-4">Basic</th>
                <th className="py-3 px-4">HRA</th>
                <th className="py-3 px-4">Allowances</th>
                <th className="py-3 px-4">Deductions</th>
                <th className="py-3 px-4">Net Salary</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">Loading your payslips...</td>
                </tr>
              ) : payslips.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">No payslips found.</td>
                </tr>
              ) : (
                payslips.map((p, idx) => {
                  const basic = p.basicSalary || p.basic_salary || 0;
                  const hra = p.hra || 0;
                  const allowances = p.allowances || 0;
                  const deductions = p.deductions || 0;
                  const net = p.netSalary || p.net_salary || (basic + hra + allowances - deductions);

                  return (
                    <tr key={p._id || p.id || idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">{p.month}/{p.year}</td>
                      <td className="py-3 px-4 text-slate-700 font-mono">₹{Number(basic).toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-slate-700 font-mono">₹{Number(hra).toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-slate-700 font-mono">₹{Number(allowances).toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-rose-600 font-mono">₹{Number(deductions).toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-emerald-700 font-mono font-bold text-sm">₹{Number(net).toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4">{getStatusBadge(p.status)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
