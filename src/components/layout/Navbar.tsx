import React, { useState } from 'react';
import { 
  Database, 
  Sun, 
  Moon, 
  Mail, 
  Shield, 
  Radio, 
  Pause, 
  UserCheck, 
  ChevronDown,
  Menu,
  ExternalLink,
  Zap,
  User,
  LogOut,
  Settings
} from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';
import { UserRole } from '../../types';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar }) => {
  const { 
    connection, 
    currentUser, 
    switchRole, 
    darkMode, 
    toggleDarkMode, 
    realtimeStreaming, 
    toggleRealtimeStreaming,
    emailInbox,
    alertBreaches,
    openEmailModal,
    setActiveView,
    logout
  } = useWarehouse();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [emailDrawerOpen, setEmailDrawerOpen] = useState(false);

  const activeBreachesCount = alertBreaches.filter(b => !b.resolved).length;
  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'admin', label: 'Administrator', desc: 'Full control: schema, alerts, users & API keys' },
    { role: 'analyst', label: 'Data Analyst', desc: 'Drag-and-drop builder, queries & exports' },
    { role: 'guest', label: 'Guest / Viewer', desc: 'Read-only dashboards, filters & PDF exports' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between gap-4 md:gap-8 px-4 md:px-6 h-16">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div 
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-sm group-hover:bg-red-700 transition-colors">
              <Database className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                Oracle 11g Datahub
              </span>
            </div>
          </div>

          {/* Connection status display */}
          <div 
            onClick={() => setActiveView('oracle')}
            className="hidden sm:flex items-center gap-2 ml-3 px-2.5 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
            title="Click to view Oracle 11g Gateway connection details"
          >
            <span className={`w-2 h-2 rounded-full ${connection.status === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="font-mono text-[11px] font-medium">{connection.sid}</span>
            <span className="text-slate-400 dark:text-slate-500">·</span>
            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{connection.latencyMs}ms</span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button 
            onClick={() => setActiveView('dashboard')} 
            className="hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap"
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveView('dataset_studio')} 
            className="hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap font-medium text-red-600 dark:text-red-400"
          >
            Dataset Studio
          </button>
          <button 
            onClick={() => setActiveView('visualizer')} 
            className="hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap"
          >
            Superset Slices
          </button>
          <button 
            onClick={() => setActiveView('builder')} 
            className="hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap"
          >
            Report Builder
          </button>
          <button 
            onClick={() => setActiveView('sql')} 
            className="hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap"
          >
            SQL Workbench
          </button>
          <button 
            onClick={() => setActiveView('alerts')} 
            className="hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap"
          >
            Threshold Alerts
          </button>
        </nav>

        {/* Zone 3: Primary Actions & User Governance */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Live Streaming Toggle */}
          <button
            onClick={toggleRealtimeStreaming}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              realtimeStreaming 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800' 
                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
            }`}
            title={realtimeStreaming ? 'Pause live metric stream' : 'Resume real-time Oracle metrics stream'}
          >
            {realtimeStreaming ? (
              <>
                <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
                <span className="whitespace-nowrap">Live Stream</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 text-slate-500" />
                <span className="whitespace-nowrap">Paused</span>
              </>
            )}
          </button>

          {/* Email Alerts Dropdown / Notification Trigger */}
          <div className="relative">
            <button
              onClick={() => setEmailDrawerOpen(prev => !prev)}
              className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Automated Email Alerts Log"
              aria-label="View automated email alerts"
            >
              <Mail className="w-4 h-4" />
              {activeBreachesCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold text-white bg-red-600 rounded-full flex items-center justify-center tabular-nums">
                  {activeBreachesCount}
                </span>
              )}
            </button>

            {/* Email Alerts Flyout */}
            {emailDrawerOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                      Automated Email Alerts
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      setEmailDrawerOpen(false);
                      setActiveView('alerts');
                    }}
                    className="text-xs text-red-600 dark:text-red-400 hover:underline"
                  >
                    Manage Rules
                  </button>
                </div>

                <div className="mt-2 max-h-72 overflow-y-auto space-y-2">
                  {emailInbox.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">
                      No automated alerts dispatched yet.
                    </div>
                  ) : (
                    emailInbox.slice(0, 5).map(email => (
                      <div 
                        key={email.id}
                        onClick={() => {
                          setEmailDrawerOpen(false);
                          openEmailModal(email);
                        }}
                        className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span className={`font-semibold ${email.severity === 'CRITICAL' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {email.severity}
                          </span>
                          <span className="font-mono text-[10px]">
                            {new Date(email.sentAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-1 mt-0.5">
                          {email.subject}
                        </p>
                        <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                          <span>To: {email.to[0]}</span>
                          <span className="text-red-600 dark:text-red-400 flex items-center gap-0.5">
                            Read email <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Profile & Role Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(prev => !prev)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
              aria-label="User Profile & Roles"
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-[11px] font-bold ${
                currentUser.role === 'admin' ? 'bg-red-600' : 
                currentUser.role === 'analyst' ? 'bg-blue-600' : 'bg-emerald-600'
              }`}>
                {currentUser.name.charAt(0)}
              </div>
              <span className="hidden sm:inline font-semibold">{currentUser.name.split(' ')[0]}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 capitalize font-mono">
                {currentUser.role}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2.5 z-50 animate-in fade-in">
                {/* User Summary Header */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 mb-2 border border-slate-200/50 dark:border-slate-700/50">
                  <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {currentUser.email}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Clearance: <span className="capitalize font-bold text-slate-700 dark:text-slate-300">{currentUser.role}</span>
                  </div>
                </div>

                {/* Profile Settings Link */}
                <button
                  onClick={() => {
                    setActiveView('profile');
                    setRoleMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer mb-2"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Profile & Security Settings</span>
                </button>

                {/* Role Switcher Section */}
                <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-t border-slate-100 dark:border-slate-800 pt-2">
                  Role-Based Simulation
                </div>
                {roles.map(r => (
                  <button
                    key={r.role}
                    onClick={() => {
                      switchRole(r.role);
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex flex-col gap-0.5 cursor-pointer ${
                      currentUser.role === r.role 
                        ? 'bg-red-50 text-red-950 dark:bg-red-950/40 dark:text-red-200 font-semibold' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="capitalize font-medium">{r.label}</span>
                      {currentUser.role === r.role && <UserCheck className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                      {r.desc}
                    </span>
                  </button>
                ))}

                {/* Sign Out Action */}
                <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setRoleMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
