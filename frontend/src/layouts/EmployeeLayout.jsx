import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import NotificationBell from '../components/NotificationBell';
import LanguageSelector from '../components/ui/LanguageSelector';
import FloatingChatbotWidget from '../components/FloatingChatbotWidget';
import Logo from '../components/ui/Logo';
import {
  LayoutDashboard, Clock, CalendarDays, DollarSign,
  User, Users, LogOut, Menu, X, ChevronRight, MessageSquareHeart,
  ChevronDown, Search, PanelLeftClose, PanelLeftOpen
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

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-50 flex flex-col
        bg-white border-r border-slate-200/90 shadow-[2px_0_12px_rgba(11,45,92,0.03)]
        transition-[width,transform] duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)]
        ${isCollapsed ? 'w-[76px]' : 'w-[260px]'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100 h-16 shrink-0">
          <Logo size={isCollapsed ? 'sm' : 'md'} variant={isCollapsed ? 'icon' : 'full'} />
          
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 text-slate-400 hover:text-[#0B2D5C] hover:bg-slate-100 rounded-lg transition-colors"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 lg:hidden">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Card */}
        {!isCollapsed && (
          <div className="px-4 py-3 border-b border-slate-100/80 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#E6F0FA] text-[#0B2D5C] font-bold text-xs flex items-center justify-center shrink-0 border border-[#B7D5F2]">
                {(user?.firstName?.[0] || 'E')}{(user?.lastName?.[0] || '')}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#172033] truncate">{user?.firstName} {user?.lastName}</p>
                <span className="inline-block text-[10px] font-semibold text-[#145DA0] bg-[#E6F0FA] px-1.5 py-0.5 rounded-md">
                  Employee Portal
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1 no-scrollbar">
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Menu
            </p>
          )}
          {employeeNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link group ${isCollapsed ? 'justify-center px-2 py-3' : ''} ${
                  isActive ? 'active' : ''
                }`
              }
              title={isCollapsed ? item.label : ''}
            >
              <item.icon className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
              {!isCollapsed && <span>{t(item.label, item.label)}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-100 shrink-0">
          <button
            onClick={handleLogout}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 w-full rounded-[12px] text-xs font-semibold text-[#E5484D] hover:bg-[#FDE8E9] transition-colors`}
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

const TopNav = ({ onMenuClick, isCollapsed }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentPage = employeeNavItems.find(item =>
    item.to === location.pathname || location.pathname.startsWith(item.to + '/')
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header
      className={`fixed top-0 right-0 left-0 transition-[left] duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isCollapsed ? 'lg:left-[76px]' : 'lg:left-[260px]'
      } h-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center px-6 gap-4 shadow-xs`}
    >
      <button onClick={onMenuClick} className="p-2 text-slate-500 hover:text-[#0B2D5C] lg:hidden rounded-lg">
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex flex-col">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">कार्य-सेतु | KaaryaSetu</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-[#0B2D5C] font-bold">{currentPage?.label || 'Dashboard'}</span>
        </div>
        <p className="text-xs font-semibold text-[#145DA0] hidden sm:block">
          Welcome back, {user?.firstName} 👋
        </p>
      </div>

      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#F7F9FC] border border-slate-200 rounded-[12px] text-xs text-slate-400 w-64 focus-within:border-[#145DA0] focus-within:ring-2 focus-within:ring-[#145DA0]/10 transition-all ml-4">
        <Search className="w-3.5 h-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search attendance, leaves, payslips..."
          className="bg-transparent border-none outline-none w-full text-xs text-[#172033] placeholder:text-slate-400 font-sans"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <LanguageSelector />
        <NotificationBell />

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-[12px] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#145DA0] text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {(user?.firstName?.[0] || 'E')}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-xs font-bold text-[#172033]">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] text-slate-400 font-medium">Employee</p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-[16px] shadow-dropdown py-2 z-50 animate-dropdown-in">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-[#172033]">{user?.firstName} {user?.lastName}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => { setProfileOpen(false); navigate('/employee/profile'); }}
                className="flex items-center gap-2.5 px-4 py-2.5 w-full text-xs font-medium text-slate-700 hover:bg-[#F0F7FF] hover:text-[#0B2D5C] transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>My Profile</span>
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 px-4 py-2.5 w-full text-xs font-semibold text-[#E5484D] hover:bg-[#FDE8E9] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const EmployeeLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      <TopNav
        onMenuClick={() => setSidebarOpen(true)}
        isCollapsed={isCollapsed}
      />
      <main
        className={`transition-[margin-left] duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isCollapsed ? 'lg:ml-[76px]' : 'lg:ml-[260px]'
        } pt-16 min-h-screen`}
      >
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <Outlet />
        </div>
      </main>
      <FloatingChatbotWidget />
    </div>
  );
};

export default EmployeeLayout;
