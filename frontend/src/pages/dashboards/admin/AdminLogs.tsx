import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, RefreshCw, LogIn, X, Trash2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const AdminLogs: React.FC = () => {
  const { getLoginLogs } = useAuth();
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [loginLogs, setLoginLogs] = useState<any[]>([]);

  const loadLogs = () => {
    setLoginLogs(getLoginLogs());
  };

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  const filtered = loginLogs.filter(l => filter === 'all' || l.status === filter);

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const [selectedLog, setSelectedLog] = useState<any>(null);

  const handleClearAllLogs = () => {
    if (window.confirm('Are you sure you want to permanently delete ALL login logs? This action cannot be undone.')) {
      localStorage.removeItem('ai_startup_builder_login_logs');
      setLoginLogs([]);
      window.alert('All login logs have been cleared.');
    }
  };

  return (
    <div className="animate-fade-in-up pb-10 space-y-8">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Login Activity Logs</h1>
          <p className="text-gray-500 mt-1">Track all user login attempts — successful and failed.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadLogs}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold rounded-xl text-sm transition-colors"
          >
            <RefreshCw size={15} /> Refresh
          </button>
          <button
            onClick={handleClearAllLogs}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 font-bold rounded-xl text-sm transition-colors"
          >
            <Trash2 size={15} /> Clear All Logs
          </button>
        </div>
      </div>

      {/* Filter + Stats */}
      <div className="flex gap-2 mb-2 flex-wrap">
        {(['all', 'success', 'failed'] as const).map(lvl => (
          <button
            key={lvl}
            onClick={() => setFilter(lvl)}
            className={`px-3 py-2 rounded-lg text-sm font-bold capitalize transition-colors ${filter === lvl ? 'bg-[#5B21B6] text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {lvl === 'all' ? 'All Logs' : lvl}
            <span className="ml-1.5 text-xs opacity-70">
              ({lvl === 'all' ? loginLogs.length : loginLogs.filter(l => l.status === lvl).length})
            </span>
          </button>
        ))}
      </div>

      {/* Login Logs Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
          <LogIn size={16} className="text-[#5B21B6]" />
          <span className="text-sm font-bold text-gray-700">Login Activity Log</span>
          <span className="ml-auto text-xs font-bold text-gray-400">
            {loginLogs.length} total entries
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-500">
                    No login logs found.
                  </td>
                </tr>
              ) : (
                filtered.slice(0, 100).map((log: any) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white text-xs font-black shadow">
                          {(log.fullName || '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-gray-900 text-sm">{log.fullName || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{log.email}</td>
                    <td className="px-5 py-3.5">
                      {log.role ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
                          {log.role}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{formatTime(log.loginTime)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                        log.status === 'success'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {log.status === 'success' ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                        {log.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 max-w-[200px] truncate">{log.message}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {loginLogs.length > 100 && (
          <div className="px-5 py-3 border-t border-gray-100 text-center text-xs text-gray-400 bg-gray-50/50">
            Showing last 100 entries. {loginLogs.length - 100} older entries hidden.
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <LogIn size={16} className="text-[#5B21B6]" /> Login Log Detail
              </h3>
              <button onClick={() => setSelectedLog(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xs font-bold text-gray-400 uppercase block mb-1">User</span>
                  <span className="font-bold text-gray-900">{selectedLog.fullName || 'Unknown'}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Email</span>
                  <span className="font-bold text-gray-900">{selectedLog.email}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Role</span>
                  <span className="font-bold text-gray-900">{selectedLog.role || '—'}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Time</span>
                  <span className="font-bold text-gray-900">{formatTime(selectedLog.loginTime)}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Status</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                    selectedLog.status === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {selectedLog.status === 'success' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                    {selectedLog.status}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 col-span-2">
                  <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Message</span>
                  <span className="font-bold text-gray-900">{selectedLog.message}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
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

export default AdminLogs;
