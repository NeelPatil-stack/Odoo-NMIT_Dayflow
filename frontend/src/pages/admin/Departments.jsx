import { useState, useEffect } from 'react';
import { Plus, Edit2, Building2, Users, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

function DeptCard({ dept, onEdit }) {
  const headName = typeof dept.head === 'string' ? dept.head : (dept.head?.name || `${dept.head?.firstName || dept.head?.first_name || ''} ${dept.head?.lastName || dept.head?.last_name || ''}`.trim());

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
          <Building2 size={18} className="text-indigo-600" />
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${dept.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
            {dept.status || 'active'}
          </span>
          <button
            className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
            onClick={() => onEdit(dept)}
          >
            <Edit2 size={14} />
          </button>
        </div>
      </div>

      <h3 className="text-sm font-bold text-slate-900 mb-1">{dept.name}</h3>
      <div className="flex items-center gap-1.5 mb-2">
        <Hash size={12} className="text-slate-400" />
        <span className="font-mono text-[11px] text-slate-500 font-semibold">{dept.code || 'ENG'}</span>
      </div>

      {dept.description && (
        <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">{dept.description}</p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-600 font-medium">
        <div className="flex items-center gap-1.5">
          <Users size={13} className="text-indigo-600" />
          <span>{dept.employeeCount || 0} employees</span>
        </div>
        {headName && (
          <span className="text-[11px] text-slate-500 font-medium truncate max-w-[120px]">
            Head: {headName}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/departments');
      setDepartments(res.data?.data || res.data || []);
    } catch {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Departments & Teams</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">Manage organizational units, department codes, and leadership assignments.</p>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs font-medium">Loading departments...</div>
      ) : departments.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-xs font-medium">No departments found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map(d => (
            <DeptCard key={d._id || d.id} dept={d} onEdit={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
}
