import React, { useState } from 'react';
import { Cpu, Save, Key, TestTube, CheckCircle2 } from 'lucide-react';

const models = [
  { id: 'gpt4t', label: 'GPT-4 Turbo', provider: 'OpenAI', use: 'Primary — Business Plan, Idea Gen, Pitch Deck' },
  { id: 'gpt35', label: 'GPT-3.5 Turbo', provider: 'OpenAI', use: 'Fast — Chat, small queries' },
  { id: 'claude3', label: 'Claude 3 Opus', provider: 'Anthropic', use: 'Alternative — Long-form content' },
  { id: 'gemini', label: 'Gemini 1.5 Pro', provider: 'Google', use: 'Multimodal — Image analysis' },
];

const AdminAISettings: React.FC = () => {
  const [primaryModel, setPrimaryModel] = useState('gpt4t');
  const [fastModel, setFastModel] = useState('gpt35');
  const [tested, setTested] = useState<string | null>(null);

  const testKey = (provider: string) => {
    setTested(provider);
    setTimeout(() => setTested(null), 3000);
  };

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Model Settings</h1>
          <p className="text-gray-500 mt-1">Configure LLM providers, API keys, and model selection for each AI feature.</p>
        </div>
        <button className="flex items-center px-4 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl shadow text-sm transition-colors">
          <Save size={16} className="mr-2" /> Save Configuration
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Model Selection */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 text-base mb-5 pb-4 border-b border-gray-100 flex items-center gap-2">
            <Cpu size={18} className="text-[#5B21B6]" /> Model Selection
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Primary Model (Complex Tasks)</label>
              <select value={primaryModel} onChange={e => setPrimaryModel(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] bg-white">
                {models.map(m => <option key={m.id} value={m.id}>{m.label} — {m.provider}</option>)}
              </select>
              <p className="text-xs text-gray-400 mt-1">{models.find(m => m.id === primaryModel)?.use}</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Fast Model (Chat & Quick Queries)</label>
              <select value={fastModel} onChange={e => setFastModel(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] bg-white">
                {models.map(m => <option key={m.id} value={m.id}>{m.label} — {m.provider}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <input type="checkbox" id="cache" defaultChecked className="w-4 h-4 text-[#5B21B6] rounded" />
              <label htmlFor="cache" className="text-sm font-bold text-gray-700">Enable AI response caching (saves API costs)</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="fallback" defaultChecked className="w-4 h-4 text-[#5B21B6] rounded" />
              <label htmlFor="fallback" className="text-sm font-bold text-gray-700">Auto-fallback to secondary model on error</label>
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 text-base mb-5 pb-4 border-b border-gray-100 flex items-center gap-2">
            <Key size={18} className="text-[#5B21B6]" /> API Keys
          </h2>
          <div className="space-y-4">
            {[
              { label: 'OpenAI API Key', placeholder: 'sk-••••••••••••••••••••••••••••', provider: 'OpenAI' },
              { label: 'Anthropic API Key', placeholder: 'sk-ant-••••••••••••••••••••••••••', provider: 'Anthropic' },
              { label: 'Google AI API Key', placeholder: 'AIza••••••••••••••••••••••••••', provider: 'Google' },
            ].map(k => (
              <div key={k.provider}>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">{k.label}</label>
                <div className="flex gap-2">
                  <input type="password" placeholder={k.placeholder} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] font-mono" />
                  <button onClick={() => testKey(k.provider)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex-shrink-0 ${tested === k.provider ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {tested === k.provider ? <><CheckCircle2 size={13} /> OK</> : <><TestTube size={13} /> Test</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Token usage */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 text-base mb-5">Token Usage This Month</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'OpenAI', used: 4200000, limit: 5000000, color: 'bg-[#5B21B6]', pct: 84 },
            { label: 'Anthropic', used: 800000, limit: 2000000, color: 'bg-blue-500', pct: 40 },
            { label: 'Google AI', used: 200000, limit: 1000000, color: 'bg-amber-500', pct: 20 },
          ].map(t => (
            <div key={t.label} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-700">{t.label}</span>
                <span className={`text-xs font-black ${t.pct > 80 ? 'text-red-600' : 'text-emerald-600'}`}>{t.pct}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                <div className={`h-full ${t.color} rounded-full`} style={{ width: `${t.pct}%` }} />
              </div>
              <p className="text-xs text-gray-400">{(t.used / 1000000).toFixed(1)}M / {(t.limit / 1000000).toFixed(0)}M tokens</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAISettings;
