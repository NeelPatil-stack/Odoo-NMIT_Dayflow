import { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, Building2, Briefcase } from 'lucide-react';
import api from '../../services/api';

export default function Directory() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('all');

  useEffect(() => {
    fetchDirectory();
  }, []);

  const fetchDirectory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employees');
      setEmployees(res.data.data || []);
    } catch (err) {
      console.error('Error fetching directory:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = employees.filter(emp => {
    const name = `${emp.first_name} ${emp.last_name}`.toLowerCase();
    const dept = (emp.department?.name || '').toLowerCase();
    const matchesSearch = name.includes(search.toLowerCase()) || dept.includes(search.toLowerCase());
    const matchesDept = department === 'all' || emp.department?.id === department;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Employee Directory</h1>
        <p className="text-sm text-gray-400">Connect and view colleague profiles across the company.</p>
      </div>

      <div className="card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search colleagues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 text-sm py-2 w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-400">Loading company directory...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">No colleagues found matching your search.</div>
        ) : (
          filtered.map((emp) => (
            <div key={emp.id} className="card border border-white/5 space-y-4 hover:border-primary-500/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="avatar avatar-md avatar-gradient flex-shrink-0">
                  {emp.profile_picture ? (
                    <img src={emp.profile_picture} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{emp.first_name?.[0]}{emp.last_name?.[0]}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-white truncate">{emp.first_name} {emp.last_name}</h3>
                  <p className="text-xs text-primary-400 truncate">{emp.designation?.title || 'Team Member'}</p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-gray-400 pt-2 border-t border-white/5">
                <div className="flex items-center gap-2 truncate">
                  <Building2 className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                  <span>{emp.department?.name || 'General'}</span>
                </div>
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                  <a href={`mailto:${emp.email}`} className="hover:text-primary-400 truncate">{emp.email}</a>
                </div>
                {emp.phone && (
                  <div className="flex items-center gap-2 truncate">
                    <Phone className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                    <span>{emp.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
