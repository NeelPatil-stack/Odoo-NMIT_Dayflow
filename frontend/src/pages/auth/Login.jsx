import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/ui/Logo';
import { Eye, EyeOff, LogIn, AlertCircle, Sparkles, Users, Network } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Desktop Mouse Parallax state (4px - 8px max movement)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (window.innerWidth >= 1024) {
        const x = (e.clientX / window.innerWidth - 0.5) * 12; // max ~6px
        const y = (e.clientY / window.innerHeight - 0.5) * 12;
        setMousePos({ x, y });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter your work email and password.'); return; }

    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome to कार्य-सेतु | KaaryaSetu, ${user.firstName || 'User'}! 🎉`);
      if (['admin', 'hr'].includes(user.role)) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/employee/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-[#145DA0] selection:text-white">
      {/* ── Background Layer 1: Subtle Dotted Grid ── */}
      <div
        className="absolute inset-0 opacity-[0.22] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#0B2D5C 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* ── Background Layer 2: Animated Gradient Blobs ── */}
      {/* Top-Left Royal Blue Shape */}
      <div
        className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-[#145DA0]/15 to-[#0B2D5C]/5 rounded-full blur-3xl pointer-events-none transition-transform duration-1000 ease-out"
        style={{
          transform: `translate(${mousePos.x * -1}px, ${mousePos.y * -1}px)`,
          animation: 'blobFloat1 14s ease-in-out infinite alternate',
        }}
      />
      {/* Bottom-Right Warm Orange Glow */}
      <div
        className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-gradient-to-tl from-[#F59A23]/15 to-[#E7B44A]/10 rounded-full blur-3xl pointer-events-none transition-transform duration-1000 ease-out"
        style={{
          transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
          animation: 'blobFloat2 16s ease-in-out infinite alternate',
        }}
      />

      {/* ── Background Layer 3: Workforce Connection & Bridge Network SVG ── */}
      <div
        className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`,
        }}
      >
        <svg className="w-full h-full max-w-6xl max-h-[800px] opacity-25" viewBox="0 0 1000 700" fill="none">
          {/* Bridge Arch Connection Lines */}
          <path
            d="M 100 450 Q 500 120 900 450"
            stroke="url(#bridgeGrad1)"
            strokeWidth="2.5"
            strokeDasharray="6 6"
            className="animate-dash"
          />
          <path
            d="M 150 500 Q 500 220 850 500"
            stroke="url(#bridgeGrad2)"
            strokeWidth="1.5"
            opacity="0.7"
          />

          {/* Connected Network Paths */}
          <path d="M 220 300 L 320 220 L 450 260" stroke="#145DA0" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
          <path d="M 780 300 L 680 220 L 550 260" stroke="#F59A23" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />

          {/* Circular Nodes & Floating Avatars around Card outer edges */}
          {/* Node 1: Left Upper */}
          <g style={{ animation: 'nodeFloat 7s ease-in-out infinite' }}>
            <circle cx="220" cy="300" r="7" fill="#0B2D5C" />
            <circle cx="220" cy="300" r="14" stroke="#145DA0" strokeWidth="1.5" opacity="0.5" />
          </g>

          {/* Node 2: Left Lower */}
          <g style={{ animation: 'nodeFloat 9s ease-in-out infinite 1s' }}>
            <circle cx="160" cy="460" r="6" fill="#F59A23" />
            <circle cx="160" cy="460" r="12" stroke="#F59A23" strokeWidth="1.5" opacity="0.5" />
          </g>

          {/* Node 3: Right Upper */}
          <g style={{ animation: 'nodeFloat 8s ease-in-out infinite 0.5s' }}>
            <circle cx="780" cy="300" r="7" fill="#145DA0" />
            <circle cx="780" cy="300" r="14" stroke="#0B2D5C" strokeWidth="1.5" opacity="0.5" />
          </g>

          {/* Node 4: Right Lower */}
          <g style={{ animation: 'nodeFloat 10s ease-in-out infinite 1.5s' }}>
            <circle cx="840" cy="460" r="6" fill="#E7B44A" />
            <circle cx="840" cy="460" r="12" stroke="#E7B44A" strokeWidth="1.5" opacity="0.5" />
          </g>

          {/* SVG Gradients */}
          <defs>
            <linearGradient id="bridgeGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0B2D5C" />
              <stop offset="50%" stopColor="#F59A23" />
              <stop offset="100%" stopColor="#145DA0" />
            </linearGradient>
            <linearGradient id="bridgeGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#145DA0" />
              <stop offset="100%" stopColor="#F59A23" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ── Main Login Container ── */}
      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header (Logo Entry Animation: 450ms) */}
        <div
          className="text-center space-y-2 opacity-0 animate-fade-in"
          style={{ animation: 'logoEntry 450ms cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
        >
          <div className="inline-flex items-center justify-center mb-2">
            <Logo size="xl" />
          </div>
          <h1 className="font-extrabold text-2xl text-[#0B2D5C] tracking-tight">
            Sign In to Work Bridge | KaaryaSetu
          </h1>
          <p className="text-slate-500 text-xs font-medium">
            Next-Generation Employee & HR Management Platform
          </p>
        </div>

        {/* Main Card (Card Entry Animation: 500ms ease-out) */}
        <div
          className="bg-white/95 backdrop-blur-sm border border-slate-200/90 p-8 rounded-[24px] shadow-[0_20px_40px_-8px_rgba(11,45,92,0.1)] opacity-0"
          style={{ animation: 'cardEntry 500ms cubic-bezier(0.16, 1, 0.3, 1) 120ms forwards' }}
        >
          {error && (
            <div className="flex items-start gap-2.5 bg-[#FDE8E9] border border-[#F9C3C5] text-[#E5484D] rounded-[12px] px-3.5 py-2.5 mb-5 text-xs font-medium animate-fade-in">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-[#E5484D]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5 uppercase tracking-wider">
                Work Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="input text-xs focus:border-[#145DA0] focus:ring-2 focus:ring-[#145DA0]/15 transition-all duration-150"
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#172033] uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input text-xs pr-9 focus:border-[#145DA0] focus:ring-2 focus:ring-[#145DA0]/15 transition-all duration-150"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0B2D5C] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-[14px] text-xs font-bold transition-all duration-150 shadow-md hover:-translate-y-[1px] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-[#F59A23]" />
              <span>Quick Demo Sign-In</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@kaaryasetu.com', 'Dayflow@2026')}
                className="py-2 px-2 bg-[#F0F7FF] hover:bg-[#E6F0FA] border border-[#B7D5F2] rounded-[10px] font-semibold text-[#0B2D5C] text-center transition-all cursor-pointer hover:-translate-y-0.5 active:scale-98"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('priya.sharma@kaaryasetu.com', 'Dayflow@2026')}
                className="py-2 px-2 bg-[#FEF4E6] hover:bg-[#FDE4C3] border border-[#FCCA8B] rounded-[10px] font-semibold text-[#E08512] text-center transition-all cursor-pointer hover:-translate-y-0.5 active:scale-98"
              >
                HR Manager
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('rahul.patil@kaaryasetu.com', 'Dayflow@2026')}
                className="py-2 px-2 bg-[#E8F6F0] hover:bg-[#C8ECE0] border border-[#BCE8D5] rounded-[10px] font-semibold text-[#22A06B] text-center transition-all cursor-pointer hover:-translate-y-0.5 active:scale-98"
              >
                Employee
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-400 text-[11px] font-medium">
          © 2026 Work Bridge | KaaryaSetu. All rights reserved.
        </p>
      </div>

      {/* ── Keyframe Animations ── */}
      <style>{`
        @keyframes logoEntry {
          0% { opacity: 0; transform: translateY(-8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes cardEntry {
          0% { opacity: 0; transform: translateY(14px) scale(0.985); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes nodeFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes blobFloat1 {
          0% { transform: translate(0px, 0px) scale(1); }
          100% { transform: translate(25px, -20px) scale(1.08); }
        }
        @keyframes blobFloat2 {
          0% { transform: translate(0px, 0px) scale(1); }
          100% { transform: translate(-25px, 20px) scale(1.05); }
        }
        .animate-dash {
          stroke-dashoffset: 100;
          animation: dashMove 10s linear infinite;
        }
        @keyframes dashMove {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
};

export default Login;
