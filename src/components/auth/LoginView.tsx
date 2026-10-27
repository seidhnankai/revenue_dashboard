import React, { useState } from 'react';
import { 
  Database, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  KeyRound, 
  CheckCircle2, 
  Shield, 
  Terminal,
  RefreshCw,
  Fingerprint
} from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';
import { UserRole } from '../../types';

export const LoginView: React.FC = () => {
  const { login, users, darkMode, toggleDarkMode } = useWarehouse();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 2FA state
  const [require2fa, setRequire2fa] = useState(false);
  const [totpCode, setTotpCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please provide both enterprise email and authentication password.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await login(email, password, require2fa ? totpCode : undefined);
      if (res.require2fa) {
        setRequire2fa(true);
        setIsLoading(false);
        return;
      }

      if (!res.success) {
        setErrorMessage(res.error || 'Authentication rejected by security gateway.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    setRequire2fa(false);
    setTotpCode('');
    setErrorMessage(null);

    const user = users.find(u => u.role === role);
    if (user) {
      setEmail(user.email);
      setPassword(user.passwordHash || (role === 'admin' ? 'Admin2026!' : role === 'analyst' ? 'Analyst2026!' : 'Guest2026!'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Background Decorative Tech Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Minimal */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-900/30">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              Oracle 11g Datahub
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/80 border border-red-800 text-red-300">
                ENTERPRISE
              </span>
            </h1>
            <p className="text-xs text-slate-400">Secure Warehouse Analytics & Real-Time Visualization</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>FIPS 140-2 Level 3</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Gateway Ready</span>
          </div>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800/90 rounded-2xl shadow-2xl backdrop-blur-xl p-8 transition-all">
          
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-600/10 border border-red-500/20 text-red-500 mb-3">
              {require2fa ? <Fingerprint className="w-6 h-6 text-amber-400" /> : <Lock className="w-6 h-6 text-red-500" />}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {require2fa ? 'Two-Factor Authentication' : 'Enterprise Access Gateway'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {require2fa 
                ? 'Enter the 6-digit TOTP code generated by your Authenticator app' 
                : 'Sign in to access your role-based warehouse workspace'}
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">Authentication Failure</span>
                <span className="font-mono text-[11px] leading-relaxed text-red-300 block">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!require2fa ? (
              <>
                {/* Email Input */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Enterprise Email / User Principal
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. sarah.chen@enterprise.oracle.corp"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Security Password
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">Min. 8 characters</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-red-600 focus:ring-red-500"
                    />
                    <span>Remember session on this device</span>
                  </label>
                  <span className="text-xs text-slate-500">Single Sign-On (SSO)</span>
                </div>
              </>
            ) : (
              /* 2FA Input Step */
              <div className="space-y-3 animate-in fade-in">
                <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-xl text-amber-200 text-xs">
                  <div className="font-semibold flex items-center gap-1.5 mb-1">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    Account Protected with 2FA
                  </div>
                  <span>Administrator Sarah Chen requires a 6-digit TOTP code. For testing, enter <strong className="font-mono text-amber-300">123456</strong> or any 6 digits.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    6-Digit Security Token
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    required
                    value={totpCode}
                    onChange={e => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full text-center tracking-[0.5em] font-mono text-xl py-3 bg-slate-950/70 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setRequire2fa(false);
                    setTotpCode('');
                  }}
                  className="w-full text-xs text-slate-400 hover:text-slate-200 py-1 transition-colors"
                >
                  ← Back to Email & Password
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-lg shadow-red-900/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>{require2fa ? 'Verify & Authenticate' : 'Sign In to Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Role Fillers */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                1-Click Role Login Presets
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Instant Test</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-2 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-red-600/50 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-xs font-semibold text-white group-hover:text-red-400">Admin</span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">DBA Lead</p>
                <span className="text-[9px] text-amber-400 font-mono mt-0.5 block">+2FA active</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('analyst')}
                className="p-2 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-blue-600/50 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs font-semibold text-white group-hover:text-blue-400">Analyst</span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">M. Vance</p>
                <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">Builder / SQL</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('guest')}
                className="p-2 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-emerald-600/50 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-white group-hover:text-emerald-400">Guest</span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">Auditor</p>
                <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">Read-only</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Security Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 border-t border-slate-900 gap-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-slate-400" />
          <span>Oracle 11g R2 Datawarehouse Security Architecture (TLS v1.3 & SHA-256)</span>
        </div>
        <div>
          <span>Role-Based Access Control (RBAC) enforced per ISO/IEC 27001 standard</span>
        </div>
      </footer>
    </div>
  );
};
