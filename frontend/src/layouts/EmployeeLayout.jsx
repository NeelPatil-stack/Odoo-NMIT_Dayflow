import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/NotificationBell';
import {
  LayoutDashboard, Clock, CalendarDays, DollarSign,
  User, Users, LogOut, Menu, X, ChevronRight, MessageSquareHeart,
} from 'lucide-react';

const employeeNavItems = [
  { to: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/employee/attendance', label: 'Attendance', icon: Clock },
  { to: '/employee/leave', label: 'Leave', icon: CalendarDays },
  { to: '/employee/payroll', label: 'Payslips', icon: DollarSign },
  { to: '/employee/profile', label: 'My Profile', icon: User },
  { to: '/employee/directory', label: 'Directory', icon: Users },
  { to: '/employee/feedback', label: 'Feedback', icon: MessageSquareHeart },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-50 flex flex-col
        bg-white border-r border-slate-200/80 shadow-sm
        transition-transform duration-200 ease-in-out
        w-[260px]
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
            KS
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm leading-tight">KaaryaSetu</h1>
            <p className="text-[11px] text-slate-400 leading-tight">Dayflow HRMS</p>
          </div>
          <button onClick={onClose} className="ml-auto btn-icon lg:hidden">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
            <div className="avatar avatar-sm avatar-gradient flex-shrink-0">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{(user?.firstName?.[0] || 'E')}{(user?.lastName?.[0] || '')}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">{user?.firstName} {user?.lastName}</p>
              <span className="badge badge-info text-[10px] py-0.5">Employee</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto no-scrollbar space-y-1">
          {employeeNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <item.icon className="sidebar-icon w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <button onClick={handleLogout} className="sidebar-link w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50">
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

const TopNav = ({ onMenuClick }) => {
  const { user } = useAuth();
  const location = useLocation();

  const currentPage = employeeNavItems.find(item =>
    item.to === location.pathname || location.pathname.startsWith(item.to + '/')
  );

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[260px] h-16 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center px-6 gap-4">
      <button onClick={onMenuClick} className="btn-icon lg:hidden">
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-400 font-medium">{user?.firstName}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-800 font-semibold">{currentPage?.label || 'Dashboard'}</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <NotificationBell />
        <div className="avatar avatar-sm avatar-gradient">
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs">{(user?.firstName?.[0] || 'E')}</span>
          )}
        </div>
      </div>
    </header>
  );
};

const EmployeeLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopNav onMenuClick={() => setSidebarOpen(true)} />
      <main className="lg:ml-[260px] pt-16 min-h-screen">
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default EmployeeLayout;
