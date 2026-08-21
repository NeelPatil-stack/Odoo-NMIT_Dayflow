import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-50 flex flex-col
        bg-dark-900/95 backdrop-blur-xl border-r border-white/[0.06]
        transition-transform duration-300 ease-in-out
        w-[260px]
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-display font-bold text-sm shadow-glow-primary">
            KS
          </div>
          <div>
            <h1 className="font-display font-bold text-white text-sm leading-tight">KaaryaSetu</h1>
            <p className="text-[10px] text-gray-500 leading-tight">Dayflow HRMS</p>
          </div>
          <button onClick={onClose} className="ml-auto btn-icon lg:hidden">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-4 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-dark-800/60">
            <div className="avatar avatar-sm avatar-gradient flex-shrink-0">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{(user?.firstName?.[0] || 'E')}{(user?.lastName?.[0] || '')}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
              <span className="badge badge-info text-[10px] py-0.5">Employee</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto no-scrollbar space-y-0.5">
          {employeeNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <item.icon className="sidebar-icon w-4.5 h-4.5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/[0.06]">
          <button onClick={handleLogout} className="sidebar-link w-full text-danger-400 hover:text-danger-300 hover:bg-danger-900/20">
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
    <header className="fixed top-0 right-0 left-0 lg:left-[260px] h-16 z-30 bg-dark-900/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center px-4 gap-4">
      <button onClick={onMenuClick} className="btn-icon lg:hidden">
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">{user?.firstName}</span>
        <ChevronRight className="w-3 h-3 text-gray-600" />
        <span className="text-gray-200 font-medium">{currentPage?.label || 'Dashboard'}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
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
    <div className="min-h-screen bg-dark-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopNav onMenuClick={() => setSidebarOpen(true)} />
      <main className="lg:ml-[260px] pt-16 min-h-screen">
        <div className="p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default EmployeeLayout;
