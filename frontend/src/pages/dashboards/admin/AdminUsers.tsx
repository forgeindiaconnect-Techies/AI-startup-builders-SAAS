import React, { useState, useEffect } from 'react';
import { Search, Eye, Trash2, Download, X, ShieldCheck, Lock, KeyRound, UserX, UserCheck, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const roleColors: Record<string, string> = {
  founder: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  mentor: 'bg-blue-100 text-blue-700 border border-blue-200',
  investor: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  admin: 'bg-purple-100 text-[#5B21B6] border border-purple-200',
};

const statusColors: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  suspended: 'bg-red-50 text-red-600 border border-red-100',
  inactive: 'bg-amber-50 text-amber-600 border border-amber-100',
  expired: 'bg-red-50 text-red-600 border border-red-100',
  none: 'bg-gray-50 text-gray-500 border border-gray-100',
  pending_verification: 'bg-amber-50 text-amber-600 border border-amber-100',
  cancelled: 'bg-red-50 text-red-600 border border-red-100',
};

const approvalColors: Record<string, string> = {
  approved: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  pending: 'bg-amber-50 text-amber-600 border border-amber-100',
  rejected: 'bg-red-50 text-red-600 border border-red-100',
};

const AdminUsers: React.FC = () => {
  const { getAllUsers, deleteUser, approveUser, resetUserPassword, refreshUsers, updateUserStatus } = useAuth();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [approvedMsg, setApprovedMsg] = useState('');

  const loadUsers = () => {
    refreshUsers();
    setUsersList(getAllUsers());
  };

  useEffect(() => {
    loadUsers();
    const interval = setInterval(loadUsers, 2000);
    return () => clearInterval(interval);
  }, []);

  const filtered = usersList.filter(u =>
    (roleFilter === 'All' || u.role === roleFilter) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) ||
     u.email.toLowerCase().includes(search.toLowerCase()) ||
     u.fullName?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDeleteUser = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete ${name}?`)) {
      deleteUser(id);
      if (selectedUser?.id === id) setSelectedUser(null);
      loadUsers();
    }
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = (currentStatus === 'suspended' || currentStatus === 'inactive') ? 'active' : 'suspended';
    const action = newStatus === 'active' ? 'activate' : 'suspend';
    if (window.confirm(`Are you sure you want to ${action} this user?`)) {
      updateUserStatus(id, newStatus);
      if (selectedUser?.id === id) {
        setSelectedUser({ ...selectedUser, status: newStatus });
      }
      loadUsers();
    }
  };

  const handleApproveUser = (id: string, name: string) => {
    if (window.confirm(`Approve account for ${name}? They will be able to log in to their dashboard.`)) {
      approveUser(id);
      setApprovedMsg(`✓ ${name}'s account has been approved. They can now log in.`);
      setTimeout(() => setApprovedMsg(''), 5000);
      if (selectedUser?.id === id) setSelectedUser(null);
      loadUsers();
    }
  };

  const handleExportCSV = () => {
    if (usersList.length === 0) {
      window.alert("No user data available to export.");
      return;
    }
    const headers = ["User ID", "Name", "Email", "Role", "Status", "Approval", "Signup Date", "Last Login", "Login Count", "Trial Expiry", "Subscription Expiry"];
    const rows = usersList.map(u => [
      u.id, u.name, u.email, u.role, u.status || 'active',
      u.approvalStatus || 'approved', u.signupDate || '',
      u.lastLoginAt || 'Never', u.loginCount || 0,
      u.trialEndDate || '', u.subscriptionEndDate || ''
    ]);
    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map(e => e.map(val => `"${(val || '').toString().replace(/"/g, '""')}"`).join(","))
    ].join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `platform_users_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-gray-500 mt-1">View and manage all registered platform users.</p>
        </div>
        <div className="flex items-center gap-3">
          {approvedMsg && (
            <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold">
              {approvedMsg}
            </div>
          )}
          <button
            onClick={handleExportCSV}
            className="flex items-center px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl border border-gray-200 text-sm transition-colors shadow-sm"
          >
            <Download size={15} className="mr-2 text-gray-600" /> Export CSV
          </button>
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="px-3 py-1.5 bg-purple-100 text-[#5B21B6] rounded-lg">{usersList.length} Total</span>
            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg">{usersList.filter(u => u.status === 'active').length} Active</span>
            <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg">{usersList.filter(u => u.status === 'suspended' || u.status === 'inactive').length} Inactive</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Search users..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B21B6] text-sm" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['All', 'founder', 'mentor', 'investor', 'admin'].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)} className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${roleFilter === r ? 'bg-[#5B21B6] text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {r === 'All' ? 'All Roles' : r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Signup Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Login Count</th>
                {roleFilter !== 'admin' && <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Trial Expiry</th>}
                {roleFilter !== 'admin' && <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Subscription Expiry</th>}
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Approval</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u: any) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white text-sm font-black shadow flex-shrink-0">
                        {(u.name || u.fullName || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{u.name || u.fullName}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${roleColors[u.role] || roleColors.founder}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(u.signupDate)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.lastLoginAt ? formatDate(u.lastLoginAt) : <span className="text-gray-400 italic">Never</span>}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-700">{u.loginCount || 0}</td>
                  {roleFilter !== 'admin' && (
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {u.trialEndDate ? (
                        <span className={`font-medium ${new Date(u.trialEndDate) < new Date() ? 'text-red-600' : 'text-gray-700'}`}>
                          {formatDate(u.trialEndDate)}
                          {new Date(u.trialEndDate) < new Date() && <span className="ml-1 text-[10px] font-bold text-red-500">(Expired)</span>}
                        </span>
                      ) : <span className="text-gray-400 italic">—</span>}
                    </td>
                  )}
                  {roleFilter !== 'admin' && (
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {u.subscriptionEndDate ? (
                        <span className={`font-medium ${new Date(u.subscriptionEndDate) < new Date() ? 'text-red-600' : 'text-gray-700'}`}>
                          {formatDate(u.subscriptionEndDate)}
                          {new Date(u.subscriptionEndDate) < new Date() && <span className="ml-1 text-[10px] font-bold text-red-500">(Expired)</span>}
                        </span>
                      ) : <span className="text-gray-400 italic">—</span>}
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[u.status] || statusColors.active}`}>
                      {u.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${approvalColors[u.approvalStatus] || approvalColors.approved}`}>
                      {u.approvalStatus || 'approved'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1"
                        title="View Details"
                      >
                        <Eye size={14} /> View
                      </button>
                      {u.status === 'suspended' || u.status === 'inactive' ? (
                        <button
                          onClick={() => handleToggleStatus(u.id, u.status)}
                          className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Activate User"
                        >
                          <UserCheck size={15} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(u.id, u.status)}
                          className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Suspend User"
                        >
                          <UserX size={15} />
                        </button>
                      )}
                      {(u.approvalStatus === 'pending') && (
                        <button
                          onClick={() => handleApproveUser(u.id, u.name || u.fullName)}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1"
                          title="Approve User"
                        >
                          <ShieldCheck size={14} /> Approve
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name || u.fullName)}
                        className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1"
                        title="Delete User"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-sm text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 pb-6 px-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-lg flex flex-col my-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white text-base font-black shadow flex-shrink-0">
                  {(selectedUser.name || selectedUser.fullName || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-gray-900 text-lg">{selectedUser.name || selectedUser.fullName}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${roleColors[selectedUser.role] || roleColors.founder}`}>
                      {selectedUser.role}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="p-6 overflow-y-auto text-sm text-gray-700 space-y-0">
              {/* Basic Information */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="w-1 h-4 rounded-full bg-[#5B21B6]"></span> Basic Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Role</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${roleColors[selectedUser.role] || roleColors.founder}`}>
                      {selectedUser.role}
                    </span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Login Count</span>
                    <span className="font-bold text-gray-900 text-base">{selectedUser.loginCount || 0}</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 sm:col-span-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Signup Date</span>
                    <span className="font-bold text-gray-900">{formatDate(selectedUser.signupDate)}</span>
                  </div>
                </div>
              </div>

              <div className="my-4 border-t border-gray-100" />

              {/* Account Status */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="w-1 h-4 rounded-full bg-emerald-500"></span> Account Status
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Status</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[selectedUser.status] || statusColors.active}`}>
                      {selectedUser.status || 'active'}
                    </span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Approval Status</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${approvalColors[selectedUser.approvalStatus] || approvalColors.approved}`}>
                      {selectedUser.approvalStatus || 'approved'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="my-4 border-t border-gray-100" />

              {/* Login Activity */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="w-1 h-4 rounded-full bg-blue-500"></span> Login Activity
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Last Login</span>
                    <span className="font-bold text-gray-900">{selectedUser.lastLoginAt ? formatDate(selectedUser.lastLoginAt) : <span className="text-gray-400 italic">Never logged in</span>}</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Login Count</span>
                    <span className="font-bold text-gray-900">{selectedUser.loginCount || 0}</span>
                  </div>
                </div>
              </div>

              <div className="my-4 border-t border-gray-100" />

              {/* Subscription Information */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="w-1 h-4 rounded-full bg-purple-500"></span> Subscription Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Free Trial Expiry</span>
                    <span className={`font-bold ${selectedUser.trialEndDate && new Date(selectedUser.trialEndDate) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                      {selectedUser.trialEndDate ? formatDate(selectedUser.trialEndDate) : <span className="text-gray-400 italic">N/A</span>}
                    </span>
                    {selectedUser.trialEndDate && new Date(selectedUser.trialEndDate) < new Date() && (
                      <span className="text-[10px] font-bold text-red-500 block mt-1">Expired</span>
                    )}
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Subscription Plan Expiry</span>
                    <span className={`font-bold ${selectedUser.subscriptionEndDate && new Date(selectedUser.subscriptionEndDate) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                      {selectedUser.subscriptionEndDate ? formatDate(selectedUser.subscriptionEndDate) : <span className="text-gray-400 italic">N/A</span>}
                    </span>
                    {selectedUser.subscriptionEndDate && new Date(selectedUser.subscriptionEndDate) < new Date() && (
                      <span className="text-[10px] font-bold text-red-500 block mt-1">Expired</span>
                    )}
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Current Plan</span>
                    <span className="font-bold text-gray-900">{selectedUser.plan || 'none'}</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Subscription Status</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[selectedUser.subscriptionStatus] || statusColors.none}`}>
                      {selectedUser.subscriptionStatus || 'none'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="my-4 border-t border-gray-100" />

              {/* Security Information */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="w-1 h-4 rounded-full bg-red-500"></span> Security Information
                </h4>
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <Lock size={18} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-800">Password</p>
                      <p className="text-xs text-amber-700 mt-0.5">Password is hidden for security reasons. Admin can reset the password if needed.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm(`Reset password for ${selectedUser.name || selectedUser.fullName}? The new password will be "reset123".`)) {
                        resetUserPassword(selectedUser.id);
                        window.alert(`✅ Password for ${selectedUser.name || selectedUser.fullName} has been reset to "reset123".`);
                        loadUsers();
                      }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm shrink-0"
                  >
                    <KeyRound size={14} /> Reset Password
                  </button>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0 bg-gray-50/60 rounded-b-3xl">
              <div className="flex flex-wrap items-center gap-2">
                {selectedUser.status === 'suspended' || selectedUser.status === 'inactive' ? (
                  <button
                    onClick={() => { handleToggleStatus(selectedUser.id, selectedUser.status); setSelectedUser(null); }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm inline-flex items-center gap-1.5"
                  >
                    <CheckCircle size={14} /> Activate
                  </button>
                ) : (
                  <button
                    onClick={() => { handleToggleStatus(selectedUser.id, selectedUser.status); setSelectedUser(null); }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm inline-flex items-center gap-1.5"
                  >
                    <AlertCircle size={14} /> Suspend
                  </button>
                )}
                {(selectedUser.approvalStatus === 'pending') && (
                  <button
                    onClick={() => handleApproveUser(selectedUser.id, selectedUser.name || selectedUser.fullName)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm inline-flex items-center gap-1.5"
                  >
                    <ShieldCheck size={14} /> Approve
                  </button>
                )}
                <button
                  onClick={() => { handleDeleteUser(selectedUser.id, selectedUser.name || selectedUser.fullName); setSelectedUser(null); }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm inline-flex items-center gap-1.5"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
