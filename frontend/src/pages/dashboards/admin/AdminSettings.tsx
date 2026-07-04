import React from 'react';
import { Settings2, Cpu, Database, Save, Activity } from 'lucide-react';

const AdminSettings: React.FC = () => (
  <div className="animate-fade-in-up pb-10">
    <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Settings & System</h1>
        <p className="text-gray-500 mt-1">Configure global platform settings, LLM models, and monitor system health.</p>
      </div>
      <button className="flex items-center px-4 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl shadow text-sm transition-colors">
        <Save size={16} className="mr-2" /> Save Configuration
      </button>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* AI Configuration */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-5 pb-4 border-b border-gray-100 flex items-center gap-2">
          <Cpu size={18} className="text-[#5B21B6]" /> AI Engine Configuration
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Primary LLM Model (Idea Gen, Business Plan)</label>
            <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] bg-white">
              <option>GPT-4 Turbo (OpenAI)</option>
              <option>Claude 3 Opus (Anthropic)</option>
              <option>Gemini 1.5 Pro (Google)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Fast LLM Model (Chat, Small Queries)</label>
            <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] bg-white">
              <option>GPT-3.5 Turbo (OpenAI)</option>
              <option>Claude 3 Haiku (Anthropic)</option>
              <option>Gemini 1.5 Flash (Google)</option>
            </select>
          </div>
          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-5 h-5 text-[#5B21B6] rounded focus:ring-[#5B21B6]" />
              <span className="text-sm font-bold text-gray-700">Enable AI content caching (reduces API costs)</span>
            </label>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-5 pb-4 border-b border-gray-100 flex items-center gap-2">
          <Activity size={18} className="text-emerald-500" /> System Health
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-sm font-semibold text-gray-700">API Latency (Global)</span>
            <span className="text-sm font-bold text-emerald-600">42ms</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-sm font-semibold text-gray-700">Database Load</span>
            <div className="flex items-center gap-3">
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="w-[30%] h-full bg-emerald-500 rounded-full" />
              </div>
              <span className="text-sm font-bold text-gray-600">30%</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-sm font-semibold text-gray-700">OpenAI API Quota</span>
            <div className="flex items-center gap-3">
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="w-[85%] h-full bg-amber-500 rounded-full" />
              </div>
              <span className="text-sm font-bold text-gray-600">85%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default AdminSettings;
