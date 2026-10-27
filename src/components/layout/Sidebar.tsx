import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Sparkles, 
  Database, 
  Terminal, 
  BellRing, 
  FileDown, 
  Webhook, 
  ShieldAlert,
  Server,
  Layers,
  X,
  UserCog
} from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { activeView, setActiveView, connection, alertBreaches, currentUser } = useWarehouse();
  const unreadAlerts = alertBreaches.filter(b => !b.resolved).length;

  const navItems = [
    { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard, category: 'Analytics' },
    { id: 'visualizer', label: 'Superset Slices', icon: BarChart3, category: 'Analytics' },
    { id: 'builder', label: 'Drag-and-Drop Builder', icon: Layers, category: 'Analytics' },
    { id: 'dataset_studio', label: 'Dataset Studio', icon: Sparkles, category: 'Infrastructure' },
    { id: 'oracle', label: 'Oracle 11g Gateway', icon: Database, category: 'Infrastructure' },
    { id: 'sql', label: 'SQL Workbench', icon: Terminal, category: 'Infrastructure' },
    { id: 'alerts', label: 'Threshold Alerts', icon: BellRing, badge: unreadAlerts > 0 ? unreadAlerts : undefined, category: 'Operations' },
    { id: 'reports', label: 'Reports & Export Center', icon: FileDown, category: 'Operations' },
    { id: 'api', label: 'Third-Party API Hub', icon: Webhook, category: 'Operations' },
    { id: 'profile', label: 'Profile & Access Control', icon: UserCog, category: 'Governance' },
  ];

  const handleSelect = (id: any) => {
    setActiveView(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed md:sticky top-0 md:top-16 z-50 md:z-30 h-screen md:h-[calc(100vh-4rem)]
        w-64 bg-slate-50 dark:bg-slate-900/90 border-r border-slate-200 dark:border-slate-800
        flex flex-col transition-transform duration-200 ease-in-out shrink-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Mobile Header */}
        <div className="flex md:hidden items-center justify-between px-4 h-16 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-red-600 flex items-center justify-center text-white">
              <Database className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              Oracle 11g Datahub
            </span>
          </div>
          <button 
            onClick={onCloseMobile}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Categories */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              Analytics & Slices
            </div>
            <div className="space-y-1">
              {navItems.filter(item => item.category === 'Analytics').map(item => {
                const Icon = item.icon;
                const active = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                      active 
                        ? 'bg-red-500 text-white font-semibold shadow-xs' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              Oracle 11g Engine
            </div>
            <div className="space-y-1">
              {navItems.filter(item => item.category === 'Infrastructure').map(item => {
                const Icon = item.icon;
                const active = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                      active 
                        ? 'bg-red-500 text-white font-semibold shadow-xs' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              Operations & Integration
            </div>
            <div className="space-y-1">
              {navItems.filter(item => item.category === 'Operations').map(item => {
                const Icon = item.icon;
                const active = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                      active 
                        ? 'bg-red-500 text-white font-semibold shadow-xs' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-red-600 text-white tabular-nums">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              Security & Governance
            </div>
            <div className="space-y-1">
              {navItems.filter(item => item.category === 'Governance').map(item => {
                const Icon = item.icon;
                const active = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                      active 
                        ? 'bg-red-500 text-white font-semibold shadow-xs' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Oracle Node Footer Card */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60">
          <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Server className="w-3 h-3 text-slate-400" />
                <span>Instance {connection.sid}</span>
              </span>
              <span className="font-mono text-[10px] tabular-nums text-emerald-600 dark:text-emerald-400">
                {connection.latencyMs}ms
              </span>
            </div>
            <div className="mt-1 text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
              {connection.username}@{connection.host}
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between text-[10px] text-slate-500">
              <span>Role: <strong className="capitalize text-slate-700 dark:text-slate-300">{currentUser.role}</strong></span>
              <button 
                onClick={() => setActiveView('oracle')}
                className="text-red-600 dark:text-red-400 hover:underline font-medium"
              >
                Configure
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
