import { useState, useEffect } from 'react';
import { DollarSign, Download, RefreshCw, Wallet, ArrowUpRight, TrendingUp, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';
import EmptyState from '../../components/ui/EmptyState';

export default function EmployeePayroll() {
  const { t } = useLanguage();
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
    if (s === 'paid') return <span className="badge-success">Paid</span>;
    return <span className="badge-warning font-semibold">Processed</span>;
  };

  const latestPayslip = payslips[0];
  const basic = latestPayslip?.basicSalary || latestPayslip?.basic_salary || 0;
  const hra = latestPayslip?.hra || 0;
  const allowances = latestPayslip?.allowances || 0;
  const deductions = latestPayslip?.deductions || 0;
  const netSalary = latestPayslip?.netSalary || latestPayslip?.net_salary || (basic + hra + allowances - deductions);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in font-sans">
      {/* Level 1: Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2D5C] tracking-tight">
            My Payslips & Compensation
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Review monthly earnings, salary breakdowns, allowances, and payslip downloads.
          </p>
        </div>

        <button onClick={fetchPayslips} className="btn-secondary text-xs py-2.5 px-4 font-semibold">
          <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
        </button>
      </div>

      {/* Level 2: NET SALARY FINANCIAL HERO PANEL (Section 17 requirement) */}
      <div className="bg-[#0B2D5C] text-white rounded-[24px] p-6 sm:p-8 shadow-[0_20px_40px_-10px_rgba(11,45,92,0.35)] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[14px] bg-[#E7B44A]/20 border border-[#E7B44A]/40 text-[#E7B44A] flex items-center justify-center font-bold">
                <Wallet size={20} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#E7B44A] uppercase tracking-widest">LATEST PAYSLIP SUMMARY</span>
                <p className="text-xs text-slate-300 font-medium">Pay Period: {latestPayslip ? `${latestPayslip.month}/${latestPayslip.year}` : 'Current Month'}</p>
              </div>
            </div>
            {latestPayslip && getStatusBadge(latestPayslip.status)}
          </div>

          {/* Focal Net Salary Amount */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">NET SALARY (TAKE HOME)</p>
              <p className="text-4xl sm:text-5xl font-extrabold text-white mt-1 font-mono tracking-tight">
                ₹{Number(netSalary).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#22A06B] bg-[#22A06B]/20 border border-[#22A06B]/40 px-3.5 py-1.5 rounded-full w-fit">
              <ShieldCheck size={16} /> Salary Disbursed via Direct Bank Deposit
            </div>
          </div>

          {/* Calculation Breakdown Strip (Section 17 requirement) */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
            <div className="bg-white/5 border border-white/10 rounded-[14px] p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase">BASIC SALARY</p>
              <p className="text-sm font-bold text-white font-mono mt-0.5">₹{Number(basic).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-[14px] p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase">HRA</p>
              <p className="text-sm font-bold text-white font-mono mt-0.5">₹{Number(hra).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-[14px] p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase">ALLOWANCES</p>
              <p className="text-sm font-bold text-[#22A06B] font-mono mt-0.5">+₹{Number(allowances).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-[14px] p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase">DEDUCTIONS</p>
              <p className="text-sm font-bold text-[#E5484D] font-mono mt-0.5">-₹{Number(deductions).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-[#E7B44A]/20 border border-[#E7B44A]/40 rounded-[14px] p-3 col-span-2 md:col-span-1">
              <p className="text-[10px] font-bold text-[#E7B44A] uppercase">NET PAYOUT</p>
              <p className="text-sm font-extrabold text-[#E7B44A] font-mono mt-0.5">₹{Number(netSalary).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Level 4: PAYSLIP HISTORY TABLE */}
      <div className="bg-white border border-slate-200/90 rounded-[20px] p-5 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-extrabold text-[#0B2D5C]">Payslip History</h2>
        </div>

        <div className="table-container border-none rounded-none">
          <table className="data-table">
            <thead>
              <tr>
                <th>Pay Period</th>
                <th>Basic Salary</th>
                <th>HRA</th>
                <th>Allowances</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 font-medium">Loading payslips...</td>
                </tr>
              ) : payslips.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8">
                    <EmptyState
                      icon={Wallet}
                      title="No Payslips Found"
                      description="No monthly payslips generated yet."
                    />
                  </td>
                </tr>
              ) : (
                payslips.map((p, idx) => {
                  const b = p.basicSalary || p.basic_salary || 0;
                  const h = p.hra || 0;
                  const a = p.allowances || 0;
                  const d = p.deductions || 0;
                  const n = p.netSalary || p.net_salary || (b + h + a - d);

                  return (
                    <tr key={p._id || p.id || idx} className="hover:bg-[#F0F7FF]/50 transition-colors">
                      <td className="font-bold text-[#172033] text-xs">{p.month}/{p.year}</td>
                      <td className="font-mono text-slate-700 text-xs font-medium">₹{Number(b).toLocaleString('en-IN')}</td>
                      <td className="font-mono text-slate-700 text-xs font-medium">₹{Number(h).toLocaleString('en-IN')}</td>
                      <td className="font-mono text-[#22A06B] text-xs font-medium">₹{Number(a).toLocaleString('en-IN')}</td>
                      <td className="font-mono text-[#E5484D] text-xs font-medium">₹{Number(d).toLocaleString('en-IN')}</td>
                      <td className="font-mono text-[#0B2D5C] font-extrabold text-sm bg-[#E6F0FA]/50 rounded-[8px] px-2 py-1">
                        ₹{Number(n).toLocaleString('en-IN')}
                      </td>
                      <td>{getStatusBadge(p.status)}</td>
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
