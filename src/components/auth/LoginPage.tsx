import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!login(username, password)) {
      setError('Invalid username or password. Please try again.');
    }
  }

  function noOp(e: React.MouseEvent) {
    e.preventDefault();
  }

  return (
    <div className="min-h-screen bg-[#1d2125] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo / branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#579dff]/10 border border-[#579dff]/20 mb-4">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-[#579dff]">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
              <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[#e8ecf0] tracking-wide">Anchor Point Lending</h1>
          <p className="text-sm text-[#7a8899] mt-1">Loan Pipeline Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-[#22272b] border border-[#3d4b5c] rounded-xl p-8">
          <h2 className="text-base font-semibold text-[#e8ecf0] mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#b6c2cf] mb-1.5" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                placeholder="Enter your username"
                className="w-full px-3 py-2 text-sm bg-[#1d2125] border border-[#3d4b5c] rounded-lg text-[#e8ecf0] placeholder-[#5d6f7e] focus:outline-none focus:border-[#579dff] focus:ring-1 focus:ring-[#579dff]/30 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-[#b6c2cf]" htmlFor="password">
                  Password
                </label>
                <a
                  href="#"
                  onClick={noOp}
                  className="text-xs text-[#579dff] hover:text-[#4a8fe8] transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2 pr-10 text-sm bg-[#1d2125] border border-[#3d4b5c] rounded-lg text-[#e8ecf0] placeholder-[#5d6f7e] focus:outline-none focus:border-[#579dff] focus:ring-1 focus:ring-[#579dff]/30 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5d6f7e] hover:text-[#7a8899] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                      <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M3 3l14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                      <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 px-3 py-2.5 bg-[#f87168]/10 border border-[#f87168]/20 rounded-lg">
                <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-[#f87168] flex-shrink-0 mt-0.5">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                <p className="text-xs text-[#f87168]">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 text-sm font-semibold text-white bg-[#579dff] hover:bg-[#4a8fe8] active:bg-[#3d7fd6] rounded-lg transition-colors mt-2"
            >
              Sign in
            </button>
          </form>

          {/* Secondary links */}
          <div className="mt-6 pt-5 border-t border-[#3d4b5c] flex flex-col gap-2 text-center">
            <p className="text-xs text-[#5d6f7e]">
              Don't have an account?{' '}
              <a href="#" onClick={noOp} className="text-[#579dff] hover:text-[#4a8fe8] transition-colors">
                Request access
              </a>
            </p>
            <a href="#" onClick={noOp} className="text-xs text-[#5d6f7e] hover:text-[#7a8899] transition-colors">
              Contact your administrator
            </a>
            <a href="#" onClick={noOp} className="text-xs text-[#5d6f7e] hover:text-[#7a8899] transition-colors">
              Privacy policy &amp; Terms of service
            </a>
          </div>
        </div>

        <p className="text-center text-[10px] text-[#3d4b5c] mt-6">
          © {new Date().getFullYear()} Anchor Point Lending. All rights reserved.
        </p>
      </div>
    </div>
  );
}
