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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 shadow-sm mb-3">
            <span className="font-bold text-white text-lg">KS</span>
          </div>
          <h1 className="font-bold text-2xl text-slate-900 mb-1">
            KaaryaSetu
          </h1>
          <p className="text-slate-500 text-sm">Dayflow HRMS — Every workday, perfectly aligned.</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Sign in to your account</h2>
            <p className="text-slate-500 text-sm mt-0.5">Enter your email and password to access the portal</p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg px-4 py-3 mb-5 text-sm">
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
                className="input"
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="form-label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input pr-10"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 mt-2"
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
          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Demo Credentials</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Admin</span>
                <span className="text-slate-900 font-mono font-medium">admin@kaaryasetu.com</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">HR Manager</span>
                <span className="text-slate-900 font-mono font-medium">priya.sharma@kaaryasetu.com</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Employee</span>
                <span className="text-slate-900 font-mono font-medium">rahul.patil@kaaryasetu.com</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Password</span>
                <span className="text-slate-900 font-mono font-medium">Dayflow@2026</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-400 text-xs mt-6">
          © 2026 KaaryaSetu Technologies. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
