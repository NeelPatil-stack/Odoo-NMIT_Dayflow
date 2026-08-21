import { useState, useEffect } from 'react';
import { Search, Mail, Phone, Building2, Briefcase, Users } from 'lucide-react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import EmptyState from '../../components/ui/EmptyState';

function getInitials(first, last) {
  return `${(first || '')[0] || ''}${(last || '')[0] || ''}`.toUpperCase();
}

export default function Directory() {
  const { t } = useLanguage();
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
      setEmployees(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Error fetching directory:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = employees.filter(emp => {
    const name = `${emp.firstName || emp.first_name || ''} ${emp.lastName || emp.last_name || ''}`.toLowerCase();
    const dept = (emp.department?.name || emp.department || '').toLowerCase();
    const matchesSearch = name.includes(search.toLowerCase()) || dept.includes(search.toLowerCase());
    const matchesDept = department === 'all' || emp.department?.id === department;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2D5C] tracking-tight">
            {t('Employee Directory')}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            {t('Connect and view colleague profiles, designations, and work contacts across the company.')}
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t('Search colleagues by name, department...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 text-xs py-2 w-full font-sans"
          />
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs font-semibold">
            {t('Loading company directory...')}
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12">
            <EmptyState
              icon={Users}
              title={t('No Colleagues Found')}
              description={t('No employee profiles match your search criteria.')}
            />
          </div>
        ) : (
          filtered.map((emp) => {
            const firstName = emp.firstName || emp.first_name || '';
            const lastName = emp.lastName || emp.last_name || '';
            const empName = emp.name || `${firstName} ${lastName}`.trim() || 'Employee';
            const desig = emp.designation?.title || emp.designation || 'Team Member';
            const deptRaw = emp.department?.name || emp.department || 'General';
            const deptTranslated = t(deptRaw, deptRaw);

            return (
              <div
                key={emp._id || emp.id}
                className="card p-5 border border-slate-200/90 shadow-soft space-y-4 hover:border-[#145DA0]/40 transition-all hover:-translate-y-1"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#0B2D5C] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                    {emp.profile_picture || emp.avatar ? (
                      <img src={emp.profile_picture || emp.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span>{getInitials(firstName, lastName)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-[#172033] text-sm truncate">{empName}</h3>
                    <p className="text-xs text-[#145DA0] font-semibold truncate">{t(desig, desig)}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100 font-medium">
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="w-3.5 h-3.5 text-[#145DA0] shrink-0" />
                    <span className="truncate">{deptTranslated}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-[#145DA0] shrink-0" />
                    <a href={`mailto:${emp.email}`} className="hover:text-[#0B2D5C] truncate font-mono text-[11px]">
                      {emp.email}
                    </a>
                  </div>
                  {emp.phone && (
                    <div className="flex items-center gap-2 truncate">
                      <Phone className="w-3.5 h-3.5 text-[#145DA0] shrink-0" />
                      <span>{emp.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
