import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import {
  ArrowUpRight, CheckCircle2, Clock, CalendarDays, DollarSign,
  Briefcase, BarChart3, ShieldCheck, Users, LogIn, Sparkles, ChevronRight,
  Menu, X
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#071827] text-white font-sans selection:bg-[#145DA0] selection:text-white relative overflow-x-hidden">
      {/* ── Section 2: Subtle Dotted Grid Background ── */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Ambient Radial Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[#145DA0]/20 via-[#0B2D5C]/10 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-96 -left-48 w-96 h-96 bg-[#F59A23]/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── Section 3 & 4: FLOATING NAVBAR ── */}
      <div className="pt-6 px-4 max-w-7xl mx-auto relative z-40">
        <nav className="bg-white text-[#172033] rounded-[32px] px-6 py-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.25)] flex items-center justify-between transition-all">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Logo size="md" />
          </div>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#home" className="hover:text-[#0B2D5C] transition-colors">Home</a>
            <a href="#solutions" className="hover:text-[#0B2D5C] transition-colors">Solutions</a>
            <a href="#features" className="hover:text-[#0B2D5C] transition-colors">Features</a>
            <a href="#pricing" className="hover:text-[#0B2D5C] transition-colors">Pricing</a>
            <a href="#about" className="hover:text-[#0B2D5C] transition-colors">About</a>
          </div>

          {/* Right Action Buttons (Section 4) */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-[#0B2D5C] bg-[#F0F7FF] hover:bg-[#E6F0FA] border border-[#B7D5F2] transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#145DA0] hover:bg-[#0B2D5C] shadow-md transition-all hover:-translate-y-0.5 cursor-pointer flex items-center gap-1.5"
            >
              Register <ArrowUpRight size={14} />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-[#0B2D5C]"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 bg-white text-[#172033] rounded-[24px] p-5 shadow-xl space-y-4 animate-dropdown-in">
            <div className="flex flex-col space-y-3 font-semibold text-sm">
              <a href="#home" onClick={() => setMobileMenuOpen(false)}>Home</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            </div>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 text-center text-xs font-bold text-[#0B2D5C] bg-[#F0F7FF] rounded-full"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 text-center text-xs font-bold text-white bg-[#145DA0] rounded-full"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Section 5, 6: HERO CONTENT ── */}
      <section id="home" className="pt-16 pb-20 px-4 max-w-5xl mx-auto text-center relative z-20">
        {/* Badge Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs font-bold text-[#F59A23] mb-6 animate-fade-in">
          <Sparkles size={14} className="text-[#F59A23]" />
          <span>Next-Generation Indian HR SaaS</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.15] text-white max-w-4xl mx-auto animate-slide-up">
          Modern Employee Management <br className="hidden sm:block" /> Made Simple
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
          A unified employee management system for attendance, leave, payroll, recruitment, and workforce operations.
        </p>

        {/* Section 6: Hero CTA Button */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3.5 rounded-full text-sm font-bold text-white bg-[#F59A23] hover:bg-[#E08512] shadow-[0_8px_24px_rgba(245,154,35,0.35)] transition-all hover:-translate-y-1 flex items-center gap-2 group cursor-pointer"
          >
            <span>Explore Kaaryasetu</span>
            <ArrowUpRight size={18} className="transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </section>

      {/* ── Section 7, 8, 9, 10, 11: CENTRAL MOCKUP & FLOATING UI CARDS ── */}
      <section className="relative max-w-6xl mx-auto px-4 pb-28 relative z-20">
        <div className="relative flex justify-center items-center">

          {/* Floating UI Card 1: Attendance Check-In (Left Top) */}
          <div
            className="hidden lg:block absolute -left-4 top-8 w-72 bg-white text-[#172033] p-4 rounded-[18px] shadow-[0_16px_36px_rgba(0,0,0,0.3)] border border-slate-200/90 -rotate-1 z-30 transition-transform duration-300 hover:scale-105"
            style={{ animation: 'floatCard 6s ease-in-out infinite' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-[#E8F6F0] text-[#22A06B] font-bold text-xs flex items-center justify-center shrink-0">
                P
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#172033] truncate">Good Morning, Priya 👋</p>
                <p className="text-[10px] text-slate-500 font-medium">Please confirm today's shift</p>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#22A06B] bg-[#E8F6F0] px-2 py-0.5 rounded-full">
                ● Shift Starting
              </span>
              <button
                onClick={() => navigate('/login')}
                className="px-3 py-1 rounded-full bg-[#22A06B] text-white text-[11px] font-bold shadow-xs hover:bg-emerald-700"
              >
                Check In
              </button>
            </div>
          </div>

          {/* Floating UI Card 2: Leave Request Approved (Left Bottom) */}
          <div
            className="hidden lg:block absolute -left-8 bottom-12 w-64 bg-white text-[#172033] p-4 rounded-[18px] shadow-[0_16px_36px_rgba(0,0,0,0.3)] border border-slate-200/90 -rotate-2 z-30 transition-transform duration-300 hover:scale-105"
            style={{ animation: 'floatCard 7s ease-in-out infinite 1s' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#E8F6F0] text-[#22A06B] flex items-center justify-center shrink-0">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#172033]">Leave Request Approved</p>
                <p className="text-[10px] text-slate-500 font-medium">Your leave for 24 Aug is approved.</p>
              </div>
            </div>
          </div>

          {/* Central Mockup Device Frame (Section 7 & 8) */}
          <div className="w-full max-w-3xl bg-[#0B2D5C] rounded-[28px] p-3 sm:p-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] border border-white/20 relative z-10 hover:shadow-[0_30px_70px_-10px_rgba(20,93,160,0.4)] transition-all duration-300">
            {/* Device Screen Header */}
            <div className="bg-[#071827] rounded-[20px] p-4 sm:p-6 text-white space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <Logo size="sm" />
                <span className="text-[11px] font-bold text-[#22A06B] bg-[#E8F6F0]/10 border border-[#22A06B]/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#22A06B] animate-ping" />
                  Live Attendance Console
                </span>
              </div>

              {/* Console Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-[14px] p-3 text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Check In Time</p>
                  <p className="text-sm font-extrabold text-white mt-1">09:15 AM</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-[14px] p-3 text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Working Hours</p>
                  <p className="text-sm font-extrabold text-[#F59A23] mt-1">6h 45m</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-[14px] p-3 text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Attendance %</p>
                  <p className="text-sm font-extrabold text-[#22A06B] mt-1">98%</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-[14px] p-3 text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Pending Requests</p>
                  <p className="text-sm font-extrabold text-[#3B82F6] mt-1">2</p>
                </div>
              </div>

              {/* Action Strip inside Mockup */}
              <div className="bg-white/10 rounded-[14px] p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-[#F59A23]" />
                  <span className="text-xs font-semibold text-slate-200">Session Status: Currently Clocked In</span>
                </div>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-1.5 rounded-full bg-[#F59A23] text-white text-xs font-bold hover:bg-[#E08512]"
                >
                  Check Out
                </button>
              </div>
            </div>
          </div>

          {/* Floating UI Card 3: Check-Out Reminder (Right Top) */}
          <div
            className="hidden lg:block absolute -right-4 top-12 w-72 bg-white text-[#172033] p-4 rounded-[18px] shadow-[0_16px_36px_rgba(0,0,0,0.3)] border border-slate-200/90 rotate-1 z-30 transition-transform duration-300 hover:scale-105"
            style={{ animation: 'floatCard 6.5s ease-in-out infinite 0.5s' }}
          >
            <div className="flex items-center gap-2.5 mb-1.5">
              <Clock size={16} className="text-[#F59A23]" />
              <p className="text-xs font-bold text-[#172033]">Check-Out Reminder</p>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              Your shift is ending soon. Please complete tasks before checking out.
            </p>
            <div className="mt-2.5 flex justify-end">
              <button
                onClick={() => navigate('/login')}
                className="px-3 py-1 rounded-full bg-[#E5484D] text-white text-[11px] font-bold shadow-xs hover:bg-rose-700"
              >
                Check Out
              </button>
            </div>
          </div>

          {/* Floating UI Card 4: Salary Processed (Right Bottom) */}
          <div
            className="hidden lg:block absolute -right-8 bottom-10 w-64 bg-white text-[#172033] p-4 rounded-[18px] shadow-[0_16px_36px_rgba(0,0,0,0.3)] border border-slate-200/90 rotate-2 z-30 transition-transform duration-300 hover:scale-105"
            style={{ animation: 'floatCard 7.5s ease-in-out infinite 1.5s' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center shrink-0">
                <DollarSign size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#172033]">Salary Processed</p>
                <p className="text-[10px] text-slate-500 font-medium">Your monthly payroll payslip is generated.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Section 14 & 15: LIGHT FEATURES SECTION ── */}
      <section id="features" className="bg-[#F7F9FC] text-[#172033] py-24 px-4 rounded-t-[40px] relative z-20">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B2D5C] tracking-tight">
              Everything Your Team Needs
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-medium max-w-xl mx-auto">
              Streamline attendance tracking, leave workflows, payroll generation, and talent hiring on one unified platform.
            </p>
          </div>

          {/* Feature Grid with 24px Rounded Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Employee Directory',
                desc: 'Comprehensive employee records, departmental roles, contact info, and profile management.',
                icon: Users,
                color: 'bg-[#E6F0FA] text-[#0B2D5C]',
              },
              {
                title: 'Attendance Management',
                desc: 'Real-time check-in/check-out tracking, working hour timers, and regularization approvals.',
                icon: Clock,
                color: 'bg-[#FEF7E6] text-[#F59A23]',
              },
              {
                title: 'Leave Workflows',
                desc: 'Request paid, sick, or casual leaves with automated approval notifications and balance logs.',
                icon: CalendarDays,
                color: 'bg-[#E8F6F0] text-[#22A06B]',
              },
              {
                title: 'Payroll & Compensation',
                desc: 'Automated salary calculation, HRA allowances, tax deductions, and downloadable payslips.',
                icon: DollarSign,
                color: 'bg-[#EFF6FF] text-[#3B82F6]',
              },
              {
                title: 'Recruitment Pipeline',
                desc: 'Kanban candidate tracking from screening to interview and final hiring selection.',
                icon: Briefcase,
                color: 'bg-[#FDF7E7] text-[#E7B44A]',
              },
              {
                title: 'Reports & Analytics',
                desc: 'Insightful visual charts for attendance trends, headcount growth, absenteeism, and expenses.',
                icon: BarChart3,
                color: 'bg-[#FDE8E9] text-[#E5484D]',
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200/90 rounded-[24px] p-6 shadow-soft hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 space-y-4"
              >
                <div className={`w-12 h-12 rounded-[16px] ${f.color} flex items-center justify-center shrink-0`}>
                  <f.icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-[#0B2D5C]">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#071827] border-t border-white/10 text-slate-400 py-12 px-4 text-xs font-medium relative z-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-slate-300">© 2026 Work Bridge | KaaryaSetu. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-slate-400">
            <a href="#home" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#home" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#home" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>

      {/* Floating Card Animation Keyframes */}
      <style>{`
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
