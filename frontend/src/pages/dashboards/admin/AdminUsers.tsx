import React, { useState, useEffect } from 'react';
import { Search, Eye, Trash2, Download, X, AlertCircle, CheckCircle, ChevronDown, ExternalLink } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const roleColors: Record<string, string> = {
  founder: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  mentor: 'bg-blue-100 text-blue-700 border border-blue-200',
  investor: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  admin: 'bg-purple-100 text-[#5B21B6] border border-purple-200',
};

const statusDotColors: Record<string, string> = {
  active: 'bg-emerald-500',
  inactive: 'bg-gray-400',
  suspended: 'bg-red-500',
};

const statusBgColors: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive: 'bg-gray-100 text-gray-600 border-gray-200',
  suspended: 'bg-red-50 text-red-600 border-red-200',
};

const approvalDotColors: Record<string, string> = {
  approved: 'bg-emerald-500',
  pending: 'bg-amber-400',
  rejected: 'bg-red-500',
};

const approvalBgColors: Record<string, string> = {
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
};

const AdminUsers: React.FC = () => {
  const { user: currentUser, getAllUsers, deleteUser, approveUser, rejectUser, updateUserStatus, refreshUsers } = useAuth();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Tracks when the next background refresh is allowed (locked after manual changes)
  const lockUntilRef = React.useRef<number>(0);

  const loadUsers = (force = false) => {
    if (!force && Date.now() < lockUntilRef.current) return; // skip if locked
    refreshUsers();
    setUsersList(getAllUsers());
  };

  useEffect(() => {
    loadUsers(true);
    const interval = setInterval(() => loadUsers(), 10000); // poll every 10s
    return () => clearInterval(interval);
  }, []);

  const filtered = usersList.filter(u =>
    (roleFilter === 'All' || u.role === roleFilter) &&
    ((u.name || '').toLowerCase().includes(search.toLowerCase()) ||
     (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
     (u.fullName || '').toLowerCase().includes(search.toLowerCase()))
  );

  const handleDeleteUser = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete ${name}?`)) {
      deleteUser(id);
      if (selectedUser?.id === id) setSelectedUser(null);
      loadUsers();
      showToast(`User "${name}" deleted successfully.`);
    }
  };

  const handleStatusChange = (userId: string, userName: string, newStatus: string) => {
    if (newStatus === 'inactive' || newStatus === 'suspended') {
      if (!window.confirm(`Set ${userName} to "${newStatus}"? They will not be able to access the dashboard.`)) {
        loadUsers();
        return;
      }
    }
    updateUserStatus(userId, newStatus);
    if (selectedUser?.id === userId) {
      setSelectedUser({ ...selectedUser, status: newStatus });
    }
    loadUsers();
    showToast(`${userName}'s status updated to "${newStatus}".`);
  };

  const handleApprovalChange = (userId: string, userName: string, newApproval: string) => {
    if (newApproval === 'rejected') {
      if (!window.confirm(`Reject ${userName}'s account? They will not be able to log in.`)) {
        return;
      }
      // Lock polling for 10s so background refresh doesn't overwrite this change
      lockUntilRef.current = Date.now() + 10000;
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, approvalStatus: 'rejected' } : u));
      rejectUser(userId);
      showToast(`${userName}'s account has been rejected.`);
    } else if (newApproval === 'approved') {
      // Lock polling for 10s so background refresh doesn't overwrite this change
      lockUntilRef.current = Date.now() + 10000;
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, approvalStatus: 'approved' } : u));
      approveUser(userId);
      showToast(`${userName}'s account has been approved.`);
    }
    if (selectedUser?.id === userId) {
      setSelectedUser({ ...selectedUser, approvalStatus: newApproval });
    }
  };

  const handleExportCSV = () => {
    if (usersList.length === 0) {
      window.alert("No user data available to export.");
      return;
    }
    const headers = ["User ID", "Name", "Email", "Role", "Status", "Approval", "Signup Date", "Last Login", "Login Count", "Trial Expiry", "Subscription Expiry"];
    const rows = usersList.map(u => [
      u.id, u.name || u.fullName, u.email, u.role, u.status || 'active',
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

  const isSelf = (u: any) => currentUser && u.id === currentUser.id;

  const renderStatusDropdown = (u: any) => {
    const disabled = isSelf(u) && u.role === 'admin';
    const currentStatus = u.status || 'active';
    return (
      <div className="relative inline-flex">
        <select
          value={currentStatus}
          disabled={disabled}
          onChange={(e) => handleStatusChange(u.id, u.name || u.fullName, e.target.value)}
          className={`appearance-none pl-6 pr-6 py-1 rounded-full text-[11px] font-bold border cursor-pointer outline-none transition-all hover:shadow-sm ${
            disabled ? 'opacity-60 cursor-not-allowed ' : ''
          }${statusBgColors[currentStatus] || statusBgColors.active}`}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
        <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${statusDotColors[currentStatus] || statusDotColors.active}`} />
        <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-current opacity-50 pointer-events-none" />
      </div>
    );
  };

  const renderApprovalDropdown = (u: any) => {
    const disabled = isSelf(u);
    const currentApproval = u.approvalStatus || 'approved';
    return (
      <div className="relative inline-flex">
        <select
          value={currentApproval}
          disabled={disabled}
          onChange={(e) => handleApprovalChange(u.id, u.name || u.fullName, e.target.value)}
          className={`appearance-none pl-6 pr-6 py-1 rounded-full text-[11px] font-bold border cursor-pointer outline-none transition-all hover:shadow-sm ${
            disabled ? 'opacity-60 cursor-not-allowed ' : ''
          }${approvalBgColors[currentApproval] || approvalBgColors.approved}`}
        >
          <option value="pending" disabled>Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${approvalDotColors[currentApproval] || approvalDotColors.approved}`} />
        <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-current opacity-50 pointer-events-none" />
      </div>
    );
  };

  return (
    <div className="animate-fade-in-up pb-10">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-xl shadow-xl font-semibold text-sm flex items-center gap-2 animate-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-gray-500 mt-1">View and manage all registered platform users.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl border border-gray-200 text-sm transition-colors shadow-sm"
          >
            <Download size={15} className="mr-2 text-gray-600" /> Export CSV
          </button>
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="px-3 py-1.5 bg-purple-100 text-[#5B21B6] rounded-lg">{usersList.length} Total</span>
            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg">{usersList.filter(u => u.status === 'active').length} Active</span>
            <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg">{usersList.filter(u => u.status === 'inactive').length} Inactive</span>
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
                {!['admin', 'mentor'].includes(roleFilter) && <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Trial Expiry</th>}
                {!['admin', 'mentor'].includes(roleFilter) && <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Subscription Expiry</th>}
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
                  {!['admin', 'mentor'].includes(roleFilter) && (
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {u.trialEndDate ? (
                        <span className={`font-medium ${new Date(u.trialEndDate) < new Date() ? 'text-red-600' : 'text-gray-700'}`}>
                          {formatDate(u.trialEndDate)}
                          {new Date(u.trialEndDate) < new Date() && <span className="ml-1 text-[10px] font-bold text-red-500">(Expired)</span>}
                        </span>
                      ) : <span className="text-gray-400 italic">—</span>}
                    </td>
                  )}
                  {!['admin', 'mentor'].includes(roleFilter) && (
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
                    {renderStatusDropdown(u)}
                  </td>
                  <td className="px-6 py-4">
                    {renderApprovalDropdown(u)}
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
                      {!isSelf(u) && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name || u.fullName)}
                          className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1"
                          title="Delete User"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      )}
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
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Mobile Number</span>
                    <span className="font-bold text-gray-900">{selectedUser.mobile || '—'}</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Location</span>
                    <span className="font-bold text-gray-900">{selectedUser.location || '—'}</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 sm:col-span-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Signup Date</span>
                    <span className="font-bold text-gray-900">{formatDate(selectedUser.signupDate)}</span>
                  </div>
                </div>
              </div>

              <div className="my-4 border-t border-gray-100" />

              {/* Role-Specific Details */}
              {selectedUser.role === 'mentor' && (
                <>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <span className="w-1 h-4 rounded-full bg-blue-500"></span> Mentor Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Expertise</span>
                        <span className="font-bold text-gray-900">{selectedUser.expertise || '—'}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Experience</span>
                        <span className="font-bold text-gray-900">{selectedUser.experienceYears ? `${selectedUser.experienceYears} Years` : '—'}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">LinkedIn</span>
                        {selectedUser.linkedin ? (
                          <a href={selectedUser.linkedin} target="_blank" rel="noopener noreferrer" className="font-bold text-[#5B21B6] hover:underline truncate block">
                            {selectedUser.linkedin}
                          </a>
                        ) : (
                          <span className="font-bold text-gray-900">—</span>
                        )}
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Mobile</span>
                        <span className="font-bold text-gray-900">{selectedUser.mobile || '—'}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Location</span>
                        <span className="font-bold text-gray-900">{selectedUser.location || '—'}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Verification Status</span>
                        <span className="font-bold text-gray-900 capitalize">{selectedUser.approvalStatus || 'pending'}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 sm:col-span-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Bio</span>
                        <p className="text-sm text-gray-800">{selectedUser.bio || '—'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="my-4 border-t border-gray-100" />

                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <span className="w-1 h-4 rounded-full bg-amber-500"></span> KYC / Proof Documents
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Aadhaar Number</span>
                        <span className="font-bold text-gray-900">{selectedUser.aadharNumber || '—'}</span>
                        {selectedUser.aadharDocUrl && (
                          <a href={selectedUser.aadharDocUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-[#5B21B6] hover:underline mt-1.5">
                            <ExternalLink size={12} /> View Aadhaar Document
                          </a>
                        )}
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">PAN Number</span>
                        <span className="font-bold text-gray-900">{selectedUser.panNumber || '—'}</span>
                        {selectedUser.panDocUrl && (
                          <a href={selectedUser.panDocUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-[#5B21B6] hover:underline mt-1.5">
                            <ExternalLink size={12} /> View PAN Document
                          </a>
                        )}
                      </div>
                      {selectedUser.otherDocType && (
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 sm:col-span-2">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Additional Document ({selectedUser.otherDocType})</span>
                          <span className="font-bold text-gray-900">{selectedUser.otherDocNumber || '—'}</span>
                          {selectedUser.otherDocUrl && (
                            <a href={selectedUser.otherDocUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-[#5B21B6] hover:underline mt-1.5">
                              <ExternalLink size={12} /> View Additional Document
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="my-4 border-t border-gray-100" />
                </>
              )}

              {selectedUser.role === 'founder' && (
                <>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <span className="w-1 h-4 rounded-full bg-yellow-500"></span> Founder Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Startup Name</span>
                        <span className="font-bold text-gray-900">{selectedUser.startupName || '—'}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Industry</span>
                        <span className="font-bold text-gray-900">{selectedUser.industry || '—'}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Startup Stage</span>
                        <span className="font-bold text-gray-900">{selectedUser.startupStage || '—'}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Current Role</span>
                        <span className="font-bold text-gray-900">{selectedUser.currentRole || '—'}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Mobile</span>
                        <span className="font-bold text-gray-900">{selectedUser.mobile || '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="my-4 border-t border-gray-100" />
                </>
              )}

              {selectedUser.role === 'investor' && (
                <>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <span className="w-1 h-4 rounded-full bg-emerald-500"></span> Investor Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Company Name</span>
                        <span className="font-bold text-gray-900">{selectedUser.companyName || '—'}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Investor Type</span>
                        <span className="font-bold text-gray-900">{selectedUser.investorType || '—'}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Preferred Industry</span>
                        <span className="font-bold text-gray-900">{selectedUser.preferredIndustry || '—'}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Investment Range</span>
                        <span className="font-bold text-gray-900">
                          {selectedUser.minInvestment ? `₹${selectedUser.minInvestment}` : '—'} - {selectedUser.maxInvestment ? `₹${selectedUser.maxInvestment}` : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="my-4 border-t border-gray-100" />
                </>
              )}

              {/* Account Status */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="w-1 h-4 rounded-full bg-emerald-500"></span> Account Status
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Status</span>
                    {renderStatusDropdown(selectedUser)}
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Approval Status</span>
                    {renderApprovalDropdown(selectedUser)}
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
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusBgColors[selectedUser.subscriptionStatus] || statusBgColors.inactive}`}>
                      {selectedUser.subscriptionStatus || 'none'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer actions */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0 bg-gray-50/60 rounded-b-3xl">
              <div className="flex flex-wrap items-center gap-2">
                {!isSelf(selectedUser) && (
                  <button
                    onClick={() => { handleDeleteUser(selectedUser.id, selectedUser.name || selectedUser.fullName); setSelectedUser(null); }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm inline-flex items-center gap-1.5"
                  >
                    <Trash2 size={14} /> Delete User
                  </button>
                )}
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
