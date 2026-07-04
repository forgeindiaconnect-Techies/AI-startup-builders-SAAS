import React, { useState } from 'react';
import { Database, AlertCircle, Info, CheckCircle2, RefreshCw } from 'lucide-react';

type LogLevel = 'error' | 'warn' | 'info' | 'success';

const logs: { id: number; time: string; level: LogLevel; source: string; message: string }[] = [
  { id: 1, time: '14:35:02', level: 'error', source: 'OpenAI API', message: 'Rate limit exceeded for user sarah@startup.ai — retrying in 5s' },
  { id: 2, time: '14:34:58', level: 'success', source: 'Auth Service', message: 'User james@startup.ai logged in from 192.168.1.1' },
  { id: 3, time: '14:34:21', level: 'warn', source: 'Billing Service', message: 'Stripe webhook retry for SUB-1038 — payment past due' },
  { id: 4, time: '14:33:44', level: 'info', source: 'AI Engine', message: 'Business Plan generated for startup EcoPackage Hub (1240 tokens used)' },
  { id: 5, time: '14:33:10', level: 'success', source: 'Database', message: 'Daily backup completed successfully — 2.4 GB' },
  { id: 6, time: '14:32:55', level: 'info', source: 'AI Engine', message: 'AI Chat session started — user tom@startup.ai' },
  { id: 7, time: '14:31:40', level: 'error', source: 'Email Service', message: 'Failed to send verification email to peter@startup.ai — SMTP timeout' },
  { id: 8, time: '14:30:12', level: 'warn', source: 'Auth Service', message: '3 failed login attempts for admin@startup.ai' },
];

const levelStyle: Record<LogLevel, { cls: string; icon: React.ElementType }> = {
  error: { cls: 'text-red-600 bg-red-50', icon: AlertCircle },
  warn: { cls: 'text-amber-600 bg-amber-50', icon: AlertCircle },
  info: { cls: 'text-blue-600 bg-blue-50', icon: Info },
  success: { cls: 'text-emerald-600 bg-emerald-50', icon: CheckCircle2 },
};

const AdminLogs: React.FC = () => {
  const [filter, setFilter] = useState<LogLevel | 'all'>('all');

  const filtered = logs.filter(l => filter === 'all' || l.level === filter);

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>
          <p className="text-gray-500 mt-1">Real-time platform logs — errors, warnings, and activity events.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold rounded-xl text-sm transition-colors">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {(['all', 'error', 'warn', 'info', 'success'] as const).map(lvl => (
          <button key={lvl} onClick={() => setFilter(lvl)} className={`px-3 py-2 rounded-lg text-sm font-bold capitalize transition-colors ${filter === lvl ? 'bg-[#5B21B6] text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {lvl === 'all' ? 'All Logs' : lvl}
            {lvl !== 'all' && <span className="ml-1.5 text-xs opacity-70">({logs.filter(l => l.level === lvl).length})</span>}
          </button>
        ))}
      </div>

      <div className="bg-[#0F1117] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
          <Database size={16} className="text-gray-400" />
          <span className="text-sm font-bold text-gray-400">Live Log Stream — Today, Jul 3 2026</span>
          <span className="ml-auto text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Live
          </span>
        </div>
        <div className="divide-y divide-white/5 max-h-[480px] overflow-y-auto">
          {filtered.map(log => {
            const { cls, icon: Icon } = levelStyle[log.level];
            return (
              <div key={log.id} className="flex items-start gap-4 px-5 py-3.5 hover:bg-white/5 transition-colors">
                <span className="text-xs text-gray-600 font-mono mt-0.5 flex-shrink-0">{log.time}</span>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 flex-shrink-0 ${cls}`}>
                  <Icon size={10} /> {log.level}
                </span>
                <span className="text-xs text-gray-500 font-semibold flex-shrink-0 w-28 truncate">{log.source}</span>
                <span className="text-xs text-gray-300 flex-1">{log.message}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminLogs;
