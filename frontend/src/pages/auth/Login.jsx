import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter your email and password.'); return; }

    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.firstName || 'User'}!`);
      if (['admin', 'hr'].includes(user.role)) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/employee/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary-800/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-glow-primary mb-4">
            <span className="font-display font-bold text-white text-xl">KS</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-white mb-1">
            <span className="text-gradient">KaaryaSetu</span>
          </h1>
          <p className="text-gray-400 text-sm">Dayflow HRMS — Every workday, perfectly aligned.</p>
        </div>

        {/* Card */}
        <div className="glass p-8 shadow-card">
          <div className="mb-6">
            <h2 className="text-xl font-display font-600 text-white">Welcome back</h2>
            <p className="text-gray-400 text-sm mt-1">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 bg-danger-700/15 border border-danger-700/30 text-danger-400 rounded-xl px-4 py-3 mb-5 text-sm animate-fade-in">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@kaaryasetu.com"
                className="form-input"
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="form-label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="form-input pr-10"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full btn-lg mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-dark-900/60 rounded-xl border border-white/[0.06]">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Demo Credentials</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Admin</span>
                <span className="text-gray-300 font-mono">admin@kaaryasetu.com</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">HR</span>
                <span className="text-gray-300 font-mono">priya.sharma@kaaryasetu.com</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Employee</span>
                <span className="text-gray-300 font-mono">rahul.patil@kaaryasetu.com</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Password</span>
                <span className="text-gray-300 font-mono">Dayflow@2026</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          © 2026 KaaryaSetu Technologies. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
