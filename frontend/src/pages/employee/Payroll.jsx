import { useState, useEffect } from 'react';
import { DollarSign, Download, Eye, Calendar, Building2, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import Modal from '../../components/ui/Modal';

export default function EmployeePayroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  useEffect(() => {
    fetchPayroll();
  }, []);

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payroll');
      setPayrolls(res.data.data || []);
    } catch (err) {
      console.error('Error fetching payroll:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = (p) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('KaaryaSetu / Dayflow HRMS', 20, 20);
    doc.setFontSize(12);
    doc.text('PAYSLIP STATEMENT', 20, 28);
    doc.line(20, 32, 190, 32);

    doc.setFontSize(10);
    doc.text(`Employee Name: ${p.employee?.first_name} ${p.employee?.last_name}`, 20, 42);
    doc.text(`Employee ID: ${p.employee?.employee_id}`, 20, 48);
    doc.text(`Month / Year: ${p.month}/${p.year}`, 20, 54);
    doc.text(`Status: ${p.status?.toUpperCase()}`, 20, 60);

    doc.line(20, 66, 190, 66);
    doc.text('EARNINGS & ALLOWANCES', 20, 74);
    doc.text(`Basic Salary: Rs. ${Number(p.basic_salary).toLocaleString()}`, 20, 82);
    doc.text(`HRA: Rs. ${Number(p.hra || 0).toLocaleString()}`, 20, 88);
    doc.text(`Special Allowances: Rs. ${Number(p.allowances || 0).toLocaleString()}`, 20, 94);
    doc.text(`Bonus: Rs. ${Number(p.bonus || 0).toLocaleString()}`, 20, 100);
    doc.text(`Gross Salary: Rs. ${Number(p.gross_salary).toLocaleString()}`, 20, 108);

    doc.line(20, 114, 190, 114);
    doc.text('DEDUCTIONS & TAX', 20, 122);
    doc.text(`Deductions: Rs. ${Number(p.deductions || 0).toLocaleString()}`, 20, 130);
    doc.text(`Tax Deductions: Rs. ${Number(p.tax_deductions || 0).toLocaleString()}`, 20, 136);

    doc.line(20, 142, 190, 142);
    doc.setFontSize(12);
    doc.text(`NET PAYABLE AMOUNT: Rs. ${Number(p.net_salary).toLocaleString()}`, 20, 152);

    doc.save(`Payslip_${p.month}_${p.year}_${p.employee?.employee_id}.pdf`);
    toast.success('Payslip PDF downloaded');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">My Payroll & Payslips</h1>
        <p className="text-sm text-gray-400">View earnings, salary breakdown, and download monthly PDF payslips.</p>
      </div>

      <div className="card space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase bg-white/[0.02] text-gray-400 border-b border-white/5">
              <tr>
                <th className="py-3 px-4">Pay Period</th>
                <th className="py-3 px-4">Gross Salary</th>
                <th className="py-3 px-4">Deductions</th>
                <th className="py-3 px-4">Net Salary</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-400">Loading your payslips...</td>
                </tr>
              ) : payrolls.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">No payslips available yet.</td>
                </tr>
              ) : (
                payrolls.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.01]">
                    <td className="py-3 px-4 font-semibold text-white">
                      {new Date(p.year, p.month - 1).toLocaleString('default', { month: 'long' })} {p.year}
                    </td>
                    <td className="py-3 px-4 text-gray-300">₹{Number(p.gross_salary).toLocaleString()}</td>
                    <td className="py-3 px-4 text-danger-400">₹{(Number(p.deductions || 0) + Number(p.tax_deductions || 0)).toLocaleString()}</td>
                    <td className="py-3 px-4 text-success-400 font-bold">₹{Number(p.net_salary).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${p.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right flex justify-end gap-2">
                      <button onClick={() => setSelectedPayslip(p)} className="btn btn-xs btn-ghost text-primary-400">
                        <Eye className="w-4 h-4 mr-1" /> View
                      </button>
                      <button onClick={() => downloadPDF(p)} className="btn btn-xs btn-primary">
                        <Download className="w-4 h-4 mr-1" /> PDF
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPayslip && (
        <Modal isOpen={!!selectedPayslip} onClose={() => setSelectedPayslip(null)} title={`Payslip Details - ${selectedPayslip.month}/${selectedPayslip.year}`}>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4 p-3 bg-white/5 rounded-xl">
              <div>
                <p className="text-xs text-gray-400">Basic Salary</p>
                <p className="font-semibold text-white">₹{Number(selectedPayslip.basic_salary).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">HRA</p>
                <p className="font-semibold text-white">₹{Number(selectedPayslip.hra || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Allowances</p>
                <p className="font-semibold text-white">₹{Number(selectedPayslip.allowances || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Deductions</p>
                <p className="font-semibold text-danger-400">₹{(Number(selectedPayslip.deductions || 0) + Number(selectedPayslip.tax_deductions || 0)).toLocaleString()}</p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-white/5">
              <span className="text-base font-bold text-white">Net Payable:</span>
              <span className="text-xl font-display font-bold text-success-400">₹{Number(selectedPayslip.net_salary).toLocaleString()}</span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => downloadPDF(selectedPayslip)} className="btn btn-primary text-sm w-full">
                <Download className="w-4 h-4 mr-2" /> Download PDF Statement
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
