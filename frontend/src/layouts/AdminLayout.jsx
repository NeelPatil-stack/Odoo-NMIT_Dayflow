import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/NotificationBell';
import {
  LayoutDashboard, Users, Clock, CalendarDays, DollarSign,
  Building2, Megaphone, BarChart3, Settings, LogOut, Menu, X,
  Briefcase, ChevronRight, UserCheck, BellRing, FileText,
} from 'lucide-react';

const adminNavItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/employees', label: 'Employees', icon: Users },
  { to: '/admin/attendance', label: 'Attendance', icon: Clock },
  { to: '/admin/leave-requests', label: 'Leave Requests', icon: CalendarDays },
  { to: '/admin/payroll', label: 'Payroll', icon: DollarSign },
  { to: '/admin/departments', label: 'Departments', icon: Building2 },
  { to: '/admin/holidays', label: 'Holidays', icon: CalendarDays },
  { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/admin/recruitment', label: 'Recruitment', icon: Briefcase },
  { to: '/admin/feedback', label: 'Feedback', icon: BellRing },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
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
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
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
                <span>{(user?.firstName?.[0] || 'A')}{(user?.lastName?.[0] || '')}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
              <span className="badge badge-primary text-[10px] py-0.5">
                {user?.role === 'hr' ? 'HR Manager' : 'Administrator'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto no-scrollbar space-y-0.5">
          {adminNavItems.map((item) => (
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

        {/* Logout */}
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

  const currentPage = adminNavItems.find(item =>
    item.to === location.pathname || location.pathname.startsWith(item.to + '/')
  );

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[260px] h-16 z-30 bg-dark-900/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center px-4 gap-4">
      <button onClick={onMenuClick} className="btn-icon lg:hidden">
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">Admin</span>
        <ChevronRight className="w-3 h-3 text-gray-600" />
        <span className="text-gray-200 font-medium">{currentPage?.label || 'Dashboard'}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <NotificationBell />
        <div className="avatar avatar-sm avatar-gradient">
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs">{(user?.firstName?.[0] || 'A')}</span>
          )}
        </div>
      </div>
    </header>
  );
};

const AdminLayout = () => {
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

export default AdminLayout;
