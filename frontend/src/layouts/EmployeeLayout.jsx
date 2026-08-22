import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/NotificationBell';
import FloatingChatbotWidget from '../components/FloatingChatbotWidget';
import {
  LayoutDashboard, Clock, CalendarDays, DollarSign,
  User, Users, LogOut, Menu, X, ChevronRight, MessageSquareHeart,
} from 'lucide-react';

const employeeNavItems = [
  { to: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/employee/attendance', label: 'Attendance Log', icon: Clock },
  { to: '/employee/leave', label: 'My Leave', icon: CalendarDays },
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-50 flex flex-col
        bg-white border-r border-slate-200 shadow-sm
        transition-transform duration-200 ease-in-out
        w-[250px]
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-xs">
            KS
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm tracking-tight">KaaryaSetu</h1>
            <p className="text-[11px] text-slate-400 font-medium">Employee Portal</p>
          </div>
          <button onClick={onClose} className="ml-auto p-1 text-slate-400 hover:text-slate-600 lg:hidden">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Card */}
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center flex-shrink-0">
              {(user?.firstName?.[0] || 'E')}{(user?.lastName?.[0] || '')}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">{user?.firstName} {user?.lastName}</p>
              <span className="inline-block text-[10px] text-slate-500 font-medium">Employee</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Workspace</p>
          {employeeNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0 opacity-80" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 w-full rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
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
    <header className="fixed top-0 right-0 left-0 lg:left-[250px] h-14 z-30 bg-white border-b border-slate-200/80 flex items-center px-6 gap-4">
      <button onClick={onMenuClick} className="p-1.5 text-slate-500 hover:text-slate-800 lg:hidden">
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium">{user?.firstName}</span>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="text-slate-800 font-bold">{currentPage?.label || 'Dashboard'}</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <NotificationBell />
        <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700">
          {(user?.firstName?.[0] || 'E')}
        </div>
      </div>
    </header>
  );
};

const EmployeeLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/60">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopNav onMenuClick={() => setSidebarOpen(true)} />
      <main className="lg:ml-[250px] pt-14 min-h-screen">
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <Outlet />
        </div>
      </main>
      <FloatingChatbotWidget />
    </div>
  );
};

export default EmployeeLayout;
