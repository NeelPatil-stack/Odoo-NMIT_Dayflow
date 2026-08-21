import { useState, useEffect } from 'react';
import { BarChart3, Download, Calendar, Users, DollarSign, PieChart as PieIcon, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Reports() {
  const [reportType, setReportType] = useState('attendance');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/${reportType}`);
      setData(res.data.data || []);
    } catch (err) {
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!data.length) return toast.error('No data to export');
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).map(v => typeof v === 'object' ? JSON.stringify(v) : v).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported to CSV');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Reports & Analytics</h1>
          <p className="text-sm text-gray-400">Generate, view, and export comprehensive HR system reports.</p>
        </div>

        <button onClick={exportCSV} className="btn btn-primary">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        {[
          { id: 'attendance', label: 'Attendance Report', icon: Calendar },
          { id: 'leave', label: 'Leave Report', icon: PieIcon },
          { id: 'employees', label: 'Headcount & Employees', icon: Users },
          { id: 'payroll', label: 'Payroll Summary', icon: DollarSign },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id)}
            className={`btn btn-sm ${reportType === tab.id ? 'btn-primary' : 'btn-ghost text-gray-400'}`}
          >
            <tab.icon className="w-4 h-4 mr-2" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="card space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase bg-white/[0.02] text-gray-400 border-b border-white/5">
              {data.length > 0 ? (
                <tr>
                  {Object.keys(data[0]).map((key) => (
                    <th key={key} className="py-3 px-4 capitalize">{key.replace(/_/g, ' ')}</th>
                  ))}
                </tr>
              ) : (
                <tr>
                  <th className="py-3 px-4">Report Data</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="10" className="py-8 text-center text-gray-400">Generating report...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-8 text-center text-gray-500">No records found for this report.</td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.01]">
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="py-3 px-4 text-gray-300">
                        {typeof val === 'object' && val !== null ? (val.name || val.first_name || JSON.stringify(val)) : String(val ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
