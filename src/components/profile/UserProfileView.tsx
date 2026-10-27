import React, { useState } from 'react';
import { 
  User, 
  Shield, 
  Key, 
  Lock, 
  Check, 
  AlertCircle, 
  UserCheck, 
  Users, 
  UserPlus, 
  Trash2, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Smartphone, 
  Bell, 
  Mail, 
  Phone, 
  Briefcase, 
  Building2, 
  Save, 
  Eye, 
  EyeOff, 
  Download, 
  Search,
  History,
  Laptop
} from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';
import { UserRole, UserProfile } from '../../types';
import { ROLE_PERMISSIONS } from '../../data/mockWarehouse';

export const UserProfileView: React.FC = () => {
  const { 
    currentUser, 
    updateUserProfile, 
    changePassword, 
    users, 
    addUser, 
    deleteUser, 
    updateUserRole, 
    updateUserStatus,
    exportToCsv,
    logout
  } = useWarehouse();

  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'notifications' | 'permissions' | 'directory'>('general');

  // General profile form state
  const [profileForm, setProfileForm] = useState({
    name: currentUser.name,
    email: currentUser.email,
    title: currentUser.title || '',
    department: currentUser.department || '',
    phone: currentUser.phone || '',
  });
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(!!currentUser.twoFactorEnabled);

  // Notification preferences state
  const [notifPrefs, setNotifPrefs] = useState({
    emailAlerts: currentUser.notificationPreferences?.emailAlerts ?? true,
    criticalOnly: currentUser.notificationPreferences?.criticalOnly ?? false,
    dailyDigest: currentUser.notificationPreferences?.dailyDigest ?? true,
  });

  // Admin user directory management state
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: 'analyst' as UserRole,
    department: 'Analytics & Operations',
    title: 'Data Specialist',
    temporaryPassword: 'TempPass2026!'
  });

  // Handle saving general profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(currentUser.id, {
      name: profileForm.name,
      title: profileForm.title,
      department: profileForm.department,
      phone: profileForm.phone
    });
    setProfileSavedToast(true);
    setTimeout(() => setProfileSavedToast(false), 3000);
  };

  // Handle saving notifications
  const handleSaveNotifications = () => {
    updateUserProfile(currentUser.id, {
      notificationPreferences: notifPrefs
    });
    setProfileSavedToast(true);
    setTimeout(() => setProfileSavedToast(false), 3000);
  };

  // Handle password update
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ success: false, message: 'New passwords do not match.' });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordStatus({ success: false, message: 'New password must be at least 8 characters long.' });
      return;
    }

    const res = changePassword(currentUser.id, passwordForm.currentPassword, passwordForm.newPassword);
    if (res.success) {
      setPasswordStatus({ success: true, message: 'Password updated successfully.' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setPasswordStatus({ success: false, message: res.error || 'Failed to update password.' });
    }
  };

  // Toggle 2FA
  const handleToggle2FA = () => {
    const nextVal = !twoFactorEnabled;
    setTwoFactorEnabled(nextVal);
    updateUserProfile(currentUser.id, { twoFactorEnabled: nextVal });
  };

  // Handle Add User
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email) return;

    addUser({
      name: newUserForm.name,
      email: newUserForm.email,
      role: newUserForm.role,
      department: newUserForm.department,
      title: newUserForm.title,
      status: 'active',
      twoFactorEnabled: false,
      notificationPreferences: {
        emailAlerts: true,
        criticalOnly: newUserForm.role === 'guest',
        dailyDigest: true
      },
      passwordHash: newUserForm.temporaryPassword
    });

    setShowAddUserModal(false);
    setNewUserForm({
      name: '',
      email: '',
      role: 'analyst',
      department: 'Analytics & Operations',
      title: 'Data Specialist',
      temporaryPassword: 'TempPass2026!'
    });
  };

  // Export User Directory to CSV
  const handleExportUsers = () => {
    const exportData = users.map(u => ({
      ID: u.id,
      Name: u.name,
      Email: u.email,
      Role: u.role,
      Department: u.department,
      Title: u.title || 'N/A',
      Status: u.status,
      TwoFactorEnabled: u.twoFactorEnabled ? 'Yes' : 'No',
      LastLogin: u.lastLoginAt || 'Never',
      Created: u.createdAt
    }));
    exportToCsv(`oracle_users_directory_${new Date().toISOString().slice(0, 10)}`, exportData);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md ${
            currentUser.role === 'admin' ? 'bg-red-600' :
            currentUser.role === 'analyst' ? 'bg-blue-600' : 'bg-emerald-600'
          }`}>
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {currentUser.name}
              </h1>
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${
                currentUser.role === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800' :
                currentUser.role === 'analyst' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800' :
                'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              }`}>
                {currentUser.role}
              </span>
              <span className="px-2 py-0.5 text-xs rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                {currentUser.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              <span>{currentUser.email}</span>
              <span>·</span>
              <span>{currentUser.title || 'Enterprise Associate'}</span>
              <span>·</span>
              <span>{currentUser.department}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={logout}
            className="px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl transition-colors cursor-pointer"
          >
            Sign Out of Hub
          </button>
        </div>
      </div>

      {/* Profile Saved Toast Feedback */}
      {profileSavedToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Profile configuration updated successfully. All changes are stored securely.</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'general'
              ? 'border-red-600 text-red-600 dark:text-red-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          General Profile
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'security'
              ? 'border-red-600 text-red-600 dark:text-red-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Lock className="w-4 h-4" />
          Security & Password
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'notifications'
              ? 'border-red-600 text-red-600 dark:text-red-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          Alert Preferences
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'permissions'
              ? 'border-red-600 text-red-600 dark:text-red-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4" />
          Role Permissions Matrix
        </button>

        {currentUser.role === 'admin' && (
          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'directory'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            User Access Directory
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-bold">
              {users.length}
            </span>
          </button>
        )}
      </div>

      {/* Tab 1: General Profile */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Personal Information
            </h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={e => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Enterprise Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      disabled
                      value={profileForm.email}
                      className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Managed by enterprise LDAP/ActiveDirectory.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Job Title / Function
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={profileForm.title}
                      onChange={e => setProfileForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Lead Database Administrator"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Department / Business Unit
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={profileForm.department}
                      onChange={e => setProfileForm(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="e.g. Enterprise Data Architecture"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Direct Phone / Urgent Paging
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={e => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Profile Details
                </button>
              </div>
            </form>
          </div>

          {/* Account Meta Summary */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Security Account Metadata
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Account ID</span>
                <span className="font-mono text-slate-900 dark:text-white font-medium">{currentUser.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Security Clearance</span>
                <span className="font-semibold capitalize text-slate-900 dark:text-white">{currentUser.role} Level</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">2FA Protection</span>
                <span className={`font-semibold ${currentUser.twoFactorEnabled ? 'text-emerald-600' : 'text-amber-500'}`}>
                  {currentUser.twoFactorEnabled ? 'Active (TOTP)' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Last Authentication</span>
                <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  {currentUser.lastLoginAt ? new Date(currentUser.lastLoginAt).toLocaleString() : 'Current Session'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Account Created</span>
                <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  {new Date(currentUser.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Security & Password */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Change Password Card */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Update Security Password
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Enter your current password and specify a strong new credential (min 8 characters).
            </p>

            {passwordStatus && (
              <div className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                passwordStatus.success 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200' 
                  : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
              }`}>
                {passwordStatus.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{passwordStatus.message}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordForm.currentPassword}
                    onChange={e => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Update Account Password
                </button>
              </div>
            </form>
          </div>

          {/* Two-Factor Authentication Card */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Two-Factor Authentication (TOTP)
                    </h3>
                    <p className="text-xs text-slate-500">Requires a 6-digit verification code on sign-in.</p>
                  </div>
                </div>

                <button
                  onClick={handleToggle2FA}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    twoFactorEnabled
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {twoFactorEnabled ? '2FA Enabled' : 'Enable 2FA'}
                </button>
              </div>

              {twoFactorEnabled ? (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> High Assurance Level Active
                  </div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Your session requires physical hardware or TOTP token authorization. Demo TOTP code is <span className="font-mono font-bold">123456</span>.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500">
                  Enable two-factor authentication to enforce secondary verification for administrative database mutations.
                </div>
              )}
            </div>

            {/* Active Session Fingerprint */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Laptop className="w-4 h-4 text-slate-500" />
                Active Authenticated Session
              </h3>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Current Workstation</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold">ACTIVE NOW</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Origin: 10.1.0.122 · Protocol: HTTPS/TLS 1.3 · Agent: Enterprise Chrome 124
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Notification Preferences */}
      {activeTab === 'notifications' && (
        <div className="max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
              Automated Alert Notification Settings
            </h2>
            <p className="text-xs text-slate-500">
              Configure how and when the Oracle warehouse threshold monitoring engine delivers incident alerts.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                  Automated Incident Emails
                </span>
                <span className="text-[11px] text-slate-500">
                  Receive instant automated emails whenever critical metrics cross threshold limits.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifPrefs.emailAlerts}
                onChange={e => setNotifPrefs(prev => ({ ...prev, emailAlerts: e.target.checked }))}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                  Critical Severity Filter
                </span>
                <span className="text-[11px] text-slate-500">
                  Only notify for CRITICAL severity breaches (suppress WARNING and INFO level logs).
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifPrefs.criticalOnly}
                onChange={e => setNotifPrefs(prev => ({ ...prev, criticalOnly: e.target.checked }))}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                  Daily Warehouse Executive Digest
                </span>
                <span className="text-[11px] text-slate-500">
                  Send a consolidated 24-hour summary of warehouse performance and KPI milestones at 08:00 UTC.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifPrefs.dailyDigest}
                onChange={e => setNotifPrefs(prev => ({ ...prev, dailyDigest: e.target.checked }))}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSaveNotifications}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Save Alert Preferences
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Role Permissions Matrix */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Enterprise Role-Based Access Control (RBAC) Matrix
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Granular capabilities enforced per user role across Oracle 11g database connection, Dataset Studio, drag-and-drop builder, and alerting.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">System Capability</th>
                    <th className="py-3 px-4 font-semibold text-red-600 dark:text-red-400 text-center">
                      Administrator (DBA)
                    </th>
                    <th className="py-3 px-4 font-semibold text-blue-600 dark:text-blue-400 text-center">
                      Data Analyst
                    </th>
                    <th className="py-3 px-4 font-semibold text-emerald-600 dark:text-emerald-400 text-center">
                      Guest / Auditor
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {[
                    { label: 'Oracle 11g Connection Config & Gateway TNS', admin: true, analyst: false, guest: false },
                    { label: 'Dataset Studio: Prepare & Introspect Datasets', admin: true, analyst: true, guest: false },
                    { label: 'Dataset Studio: Delete or Purge Datasets', admin: true, analyst: false, guest: false },
                    { label: 'Drag-and-Drop Builder: Compose Visual Slices', admin: true, analyst: true, guest: false },
                    { label: 'SQL Workbench: Ad-hoc Queries & Execution', admin: true, analyst: true, guest: false },
                    { label: 'Automated Threshold Alerts: Rule Authoring', admin: true, analyst: false, guest: false },
                    { label: 'User Directory: Register, Modify & Suspend Users', admin: true, analyst: false, guest: false },
                    { label: 'Third-Party Integration: API Key & Webhook Dispatch', admin: true, analyst: false, guest: false },
                    { label: 'Export Reports: CSV, JSON & PDF Download', admin: true, analyst: true, guest: true },
                    { label: 'Executive Dashboard: View KPIs & Dynamic Slices', admin: true, analyst: true, guest: true },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {row.label}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {row.admin ? (
                          <CheckCircle2 className="w-4 h-4 text-red-600 dark:text-red-400 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {row.analyst ? (
                          <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {row.guest ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: User Directory (Admin Only) */}
      {activeTab === 'directory' && currentUser.role === 'admin' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Enterprise User Access Directory
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Register, provision roles, and govern access control across all database warehouse stakeholders.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter users..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white w-48 focus:ring-2 focus:ring-red-500"
                />
              </div>

              <button
                onClick={handleExportUsers}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>

              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add User
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">User Details</th>
                    <th className="py-3 px-4">Department / Title</th>
                    <th className="py-3 px-4">System Role</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">2FA Security</th>
                    <th className="py-3 px-4">Last Logon</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs ${
                            user.role === 'admin' ? 'bg-red-600' :
                            user.role === 'analyst' ? 'bg-blue-600' : 'bg-emerald-600'
                          }`}>
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white block">
                              {user.name} {user.id === currentUser.id && <span className="text-[10px] text-red-500 font-mono">(You)</span>}
                            </span>
                            <span className="text-[11px] text-slate-500">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        <div>{user.department}</div>
                        <div className="text-[10px] text-slate-400">{user.title || 'Specialist'}</div>
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={user.role}
                          disabled={user.id === currentUser.id}
                          onChange={e => updateUserRole(user.id, e.target.value as UserRole)}
                          className="px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-medium capitalize"
                        >
                          <option value="admin">Admin</option>
                          <option value="analyst">Analyst</option>
                          <option value="guest">Guest</option>
                        </select>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                          user.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                        }`}>
                          {user.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {user.twoFactorEnabled ? (
                          <span className="text-emerald-600 font-medium flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Enforced
                          </span>
                        ) : (
                          <span className="text-slate-400">Optional</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {user.id !== currentUser.id && (
                            <>
                              <button
                                onClick={() => updateUserStatus(user.id, user.status === 'active' ? 'suspended' : 'active')}
                                className={`px-2 py-1 text-[11px] font-medium rounded-lg transition-colors cursor-pointer ${
                                  user.status === 'active' 
                                    ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30' 
                                    : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                                }`}
                              >
                                {user.status === 'active' ? 'Suspend' : 'Activate'}
                              </button>
                              
                              <button
                                onClick={() => deleteUser(user.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Delete User"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add User Modal */}
          {showAddUserModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-red-600" />
                    Register Enterprise User
                  </h3>
                  <button 
                    onClick={() => setShowAddUserModal(false)}
                    className="text-slate-400 hover:text-slate-600 text-sm"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. David Ross"
                      value={newUserForm.name}
                      onChange={e => setNewUserForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. david.ross@corp.com"
                      value={newUserForm.email}
                      onChange={e => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        System Role
                      </label>
                      <select
                        value={newUserForm.role}
                        onChange={e => setNewUserForm(prev => ({ ...prev, role: e.target.value as UserRole }))}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                      >
                        <option value="analyst">Data Analyst</option>
                        <option value="guest">Guest / Viewer</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        value={newUserForm.department}
                        onChange={e => setNewUserForm(prev => ({ ...prev, department: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Initial Temporary Password
                    </label>
                    <input
                      type="text"
                      value={newUserForm.temporaryPassword}
                      onChange={e => setNewUserForm(prev => ({ ...prev, temporaryPassword: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="pt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddUserModal(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs cursor-pointer"
                    >
                      Create Account
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
