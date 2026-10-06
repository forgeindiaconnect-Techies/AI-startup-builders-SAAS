import React, { useState, useEffect } from 'react';
import { Search, Eye, Trash2, X, AlertCircle, Calendar, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const roleColors: Record<string, string> = {
  founder: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  mentor: 'bg-blue-100 text-blue-700 border border-blue-200',
  investor: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  admin: 'bg-purple-100 text-[#5B21B6] border border-purple-200',
};

const AdminDeletedUsers: React.FC = () => {
  const { getDeletedUsers } = useAuth();
  const [deletedUsers, setDeletedUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDeleted = async () => {
    setIsLoading(true);
    try {
      const list = await getDeletedUsers();
      setDeletedUsers(list);
    } catch {
      setDeletedUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeleted();
  }, []);

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Filtering
  const filtered = deletedUsers.filter(u => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.fullName || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q) ||
      (u.location || '').toLowerCase().includes(q) ||
      (u.mobile || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Trash2 size={24} className="text-red-500" /> Deleted Details
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View details and history of accounts deleted from the platform.
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Search */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search deleted users by name, email, or role..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6C4CF1] focus:border-transparent text-sm bg-[#FAFAFA]"
            />
          </div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {filtered.length} of {deletedUsers.length} Deleted
          </div>
        </div>

        {/* Table / Loader */}
        {isLoading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-[#6C4CF1] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-semibold text-gray-500">Loading deleted accounts history...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#FAFAFA] border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Deleted At</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-400 to-amber-500 flex items-center justify-center text-white text-xs font-black shadow-sm">
                          {(u.fullName || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-[13px]">{u.fullName}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${roleColors[u.role] || roleColors.founder}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-700">{u.location || '—'}</td>
                    <td className="px-6 py-4 text-gray-600 font-semibold">{u.mobile || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-red-600 font-bold bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5 w-fit">
                        <Calendar size={13} /> {formatDate(u.deletedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 text-[#5B21B6] border border-purple-100 hover:bg-purple-100 transition-colors text-xs font-bold"
                      >
                        <Eye size={13} /> View Details
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm font-semibold text-gray-400">
                      No deleted records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 pb-6 px-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-md flex flex-col my-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-white text-base font-black shadow flex-shrink-0">
                  {(selectedUser.fullName || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{selectedUser.fullName}</h3>
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

            {/* Body */}
            <div className="p-6 text-sm text-gray-700 space-y-4">
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-bold">
                <ShieldAlert size={16} />
                This account was deleted from active service.
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Role</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${roleColors[selectedUser.role] || roleColors.founder}`}>
                    {selectedUser.role}
                  </span>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Mobile</span>
                  <span className="font-bold text-gray-900">{selectedUser.mobile || '—'}</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Location</span>
                  <span className="font-bold text-gray-900">{selectedUser.location || '—'}</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Signup Date</span>
                  <span className="font-bold text-gray-900">{formatDate(selectedUser.signupDate)}</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 col-span-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Deleted At</span>
                  <span className="font-bold text-red-600">{formatDate(selectedUser.deletedAt)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-[#FAFAFA] rounded-b-2xl text-right shrink-0">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold text-sm transition-colors"
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

export default AdminDeletedUsers;
