import React, { useState, useEffect } from 'react';
import { Search, Eye, Trash2, Download, X, ShieldCheck, Lock, KeyRound } from 'lucide-react';
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
  const { getAllUsers, deleteUser, approveUser, resetUserPassword, refreshUsers } = useAuth();
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
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Trial Expiry</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Subscription Expiry</th>
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
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {u.trialEndDate ? (
                      <span className={`font-medium ${new Date(u.trialEndDate) < new Date() ? 'text-red-600' : 'text-gray-700'}`}>
                        {formatDate(u.trialEndDate)}
                        {new Date(u.trialEndDate) < new Date() && <span className="ml-1 text-[10px] font-bold text-red-500">(Expired)</span>}
                      </span>
                    ) : <span className="text-gray-400 italic">—</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {u.subscriptionEndDate ? (
                      <span className={`font-medium ${new Date(u.subscriptionEndDate) < new Date() ? 'text-red-600' : 'text-gray-700'}`}>
                        {formatDate(u.subscriptionEndDate)}
                        {new Date(u.subscriptionEndDate) < new Date() && <span className="ml-1 text-[10px] font-bold text-red-500">(Expired)</span>}
                      </span>
                    ) : <span className="text-gray-400 italic">—</span>}
                  </td>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-xl flex flex-col" style={{ maxHeight: 'calc(100vh - 48px)' }}>

            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white text-xl font-black shadow-md flex-shrink-0">
                  {(selectedUser.name || selectedUser.fullName || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-xl leading-tight">{selectedUser.name || selectedUser.fullName}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${roleColors[selectedUser.role] || roleColors.founder}`}>
                      {selectedUser.role}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors shrink-0 ml-3"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              {/* Basic Information */}
              <div>
                <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-1 h-3 rounded-full bg-[#5B21B6] inline-block"></span> Basic Information
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Role</span>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold self-start ${roleColors[selectedUser.role] || roleColors.founder}`}>
                      {selectedUser.role}
                    </span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Login Count</span>
                    <span className="font-extrabold text-gray-900 text-2xl leading-none">{selectedUser.loginCount || 0}</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 col-span-2 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Signup Date</span>
                    <span className="font-semibold text-gray-900">{formatDate(selectedUser.signupDate)}</span>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div>
                <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-1 h-3 rounded-full bg-emerald-500 inline-block"></span> Account Status
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</span>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold self-start ${statusColors[selectedUser.status] || statusColors.active}`}>
                      {selectedUser.status || 'active'}
                    </span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Approval</span>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold self-start ${approvalColors[selectedUser.approvalStatus] || approvalColors.approved}`}>
                      {selectedUser.approvalStatus || 'approved'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Login Activity */}
              <div>
                <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-1 h-3 rounded-full bg-blue-500 inline-block"></span> Login Activity
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Last Login</span>
                    <span className="font-semibold text-gray-900 text-sm">
                      {selectedUser.lastLoginAt ? formatDate(selectedUser.lastLoginAt) : <span className="text-gray-400 italic text-xs font-normal">Never logged in</span>}
                    </span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Logins</span>
                    <span className="font-extrabold text-gray-900 text-2xl leading-none">{selectedUser.loginCount || 0}</span>
                  </div>
                </div>
              </div>

              {/* Subscription Information */}
              <div>
                <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-1 h-3 rounded-full bg-purple-500 inline-block"></span> Subscription
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Current Plan</span>
                    <span className="font-semibold text-gray-900 capitalize text-sm">{selectedUser.plan || 'none'}</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sub. Status</span>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold self-start ${statusColors[selectedUser.subscriptionStatus] || statusColors.none}`}>
                      {selectedUser.subscriptionStatus || 'none'}
                    </span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Trial Expiry</span>
                    <span className={`font-semibold text-sm ${selectedUser.trialEndDate && new Date(selectedUser.trialEndDate) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                      {selectedUser.trialEndDate ? formatDate(selectedUser.trialEndDate) : <span className="text-gray-400 italic text-xs font-normal">N/A</span>}
                    </span>
                    {selectedUser.trialEndDate && new Date(selectedUser.trialEndDate) < new Date() && (
                      <span className="text-[10px] font-bold text-red-500">Expired</span>
                    )}
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sub. Expiry</span>
                    <span className={`font-semibold text-sm ${selectedUser.subscriptionEndDate && new Date(selectedUser.subscriptionEndDate) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                      {selectedUser.subscriptionEndDate ? formatDate(selectedUser.subscriptionEndDate) : <span className="text-gray-400 italic text-xs font-normal">N/A</span>}
                    </span>
                    {selectedUser.subscriptionEndDate && new Date(selectedUser.subscriptionEndDate) < new Date() && (
                      <span className="text-[10px] font-bold text-red-500">Expired</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Security */}
              <div>
                <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-1 h-3 rounded-full bg-amber-500 inline-block"></span> Security
                </h4>
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Lock size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-800">Password Management</p>
                      <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">Password is hidden for security. Admin can reset it if needed.</p>
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
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm shrink-0 whitespace-nowrap"
                  >
                    <KeyRound size={13} /> Reset Password
                  </button>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0 bg-gray-50/60 rounded-b-3xl">
              <div className="flex flex-wrap items-center gap-2">
                {(selectedUser.approvalStatus === 'pending') && (
                  <button
                    onClick={() => handleApproveUser(selectedUser.id, selectedUser.name || selectedUser.fullName)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm inline-flex items-center gap-1.5"
                  >
                    <ShieldCheck size={14} /> Approve Account
                  </button>
                )}
                <button
                  onClick={() => { handleDeleteUser(selectedUser.id, selectedUser.name || selectedUser.fullName); setSelectedUser(null); }}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition-colors border border-red-100 inline-flex items-center gap-1.5"
                >
                  <Trash2 size={14} /> Delete User
                </button>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl transition-colors"
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
