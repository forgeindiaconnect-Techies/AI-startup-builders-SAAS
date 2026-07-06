import React, { useState } from 'react';
import { Lightbulb, Sparkles, RefreshCw, Rocket, Target, Briefcase, FileText, Download, Copy, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  startupData: any;
  setStartupData: (data: any) => void;
}

const FounderIdeaGenerator: React.FC<Props> = ({ startupData, setStartupData }) => {
  const [startupName, setStartupName] = useState('');
  const [startupIdea, setStartupIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const generate = async () => {
    if (!startupName || !startupIdea) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/ai-builder/generate-startup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startupName, startupIdea })
      });

      const data = await response.json();
      
      if (data.success) {
        setStartupData(data.data);
        window.alert('Success: Startup generated successfully');
        
        // Trigger notification
        fetch('http://localhost:5000/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            title: 'Startup Generated Successfully', 
            message: 'Your startup idea has been generated successfully with AI.', 
            type: 'ai_builder' 
          })
        }).catch(e => console.error(e));

        navigate(`?id=${data.data.startupId}`);

      } else {
        setError(data.message || 'Failed to generate startup');
      }
    } catch (err) {
      setError('Failed to connect to AI server');
    } finally {
      setLoading(false);
    }
  };

  const regenerate = async () => {
    if (!startupData) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:5000/api/ai-builder/regenerate/${startupData.startupId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      
      if (data.success) {
        setStartupData(data.data);
        window.alert('Success: Startup regenerated successfully');
      } else {
        setError(data.message || 'Failed to regenerate startup');
      }
    } catch (err) {
      setError('Failed to connect to AI server');
    } finally {
      setLoading(false);
    }
  };

  if (startupData) {
    const ai = startupData.aiGenerated?.ideaAnalysis || {};
    return (
      <div className="animate-fade-in-up space-y-6">
        {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl font-bold">{error}</div>}
        
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-purple-100 text-[#5B21B6] text-[10px] font-black uppercase px-3 py-1.5 rounded-bl-xl shadow-sm z-10 flex items-center gap-1">
            <Sparkles size={10} /> AI Generated
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{startupData.startupName}</h2>
          <p className="text-[#5B21B6] font-bold mb-6">{ai.refinedStartupIdea || ai.refinedIdea || startupData.startupIdea}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2 text-sm uppercase tracking-wide">Problem</h3>
              <p className="text-gray-700 text-sm">{ai.problemStatement}</p>
            </div>
            <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100/50">
              <h3 className="font-bold text-[#5B21B6] mb-2 text-sm uppercase tracking-wide">Solution</h3>
              <p className="text-gray-700 text-sm">{ai.solution}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="border border-gray-100 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 mb-2 text-sm uppercase tracking-wide flex items-center gap-2"><Target size={14} /> Target Customers</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                {ai.targetCustomers?.map((c: string, i: number) => <li key={i}>{c}</li>)}
              </ul>
            </div>
            <div className="border border-gray-100 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 mb-2 text-sm uppercase tracking-wide flex items-center gap-2"><Briefcase size={14} /> Business Model</h3>
              <p className="text-sm text-gray-700 mb-2 font-bold">{ai.businessModel}</p>
              <p className="text-sm text-gray-500">{ai.revenueModel}</p>
            </div>
            <div className="border border-gray-100 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 mb-2 text-sm uppercase tracking-wide flex items-center gap-2"><Rocket size={14} /> Core Features</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                {ai.coreFeatures?.map((f: string, i: number) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 mb-6">
              <h3 className="font-bold text-gray-900 mb-2 text-sm uppercase tracking-wide">Unique Value Proposition</h3>
              <p className="text-sm text-gray-700">{ai.uniqueValueProposition}</p>
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-50">
            <button onClick={() => window.alert('Saved to My Startups')} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-sm transition-colors">
              <Save size={14} /> Save to My Startups
            </button>
            <button onClick={regenerate} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-sm transition-colors disabled:opacity-50">
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />} Regenerate
            </button>
            <button onClick={() => window.alert('Copied to clipboard')} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-sm transition-colors">
              <Copy size={14} /> Copy
            </button>
            <button onClick={() => window.alert('Exporting PDF...')} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-sm transition-colors ml-auto">
              <Download size={14} /> Export PDF
            </button>
            <button onClick={() => window.alert('Exporting Pitch Deck...')} className="flex items-center gap-2 px-4 py-2 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-lg text-sm transition-colors shadow">
              <FileText size={14} /> Export Pitch Deck
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">AI Idea Generator</h1>
        <p className="text-gray-500 mt-1">Provide your startup concept — our AI will generate validated startup ideas, pivots, and improvements.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8 max-w-3xl">
        {error && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl font-bold">{error}</div>}
        
        <div className="space-y-5 mb-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2">
              <Rocket size={16} className="text-[#5B21B6]" /> Startup Name
            </label>
            <input 
              type="text"
              value={startupName}
              onChange={(e) => setStartupName(e.target.value)}
              placeholder="e.g. Hotel AI Platform"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] bg-gray-50 focus:bg-white transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2">
              <Lightbulb size={16} className="text-[#5B21B6]" /> Startup Idea / Short Description
            </label>
            <textarea
              value={startupIdea}
              onChange={e => setStartupIdea(e.target.value)}
              placeholder="e.g. I want to build a luxury hotel management and booking platform using AI."
              className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] bg-gray-50 focus:bg-white transition-colors resize-none"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={generate}
            disabled={loading || (!startupName || !startupIdea)}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] hover:from-[#4C1D95] hover:to-[#6D28D9] text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 active:scale-95 w-full justify-center"
          >
            {loading ? <RefreshCw size={18} className="mr-2 animate-spin" /> : <Sparkles size={18} className="mr-2" />}
            {loading ? 'AI is generating...' : 'Generate Startup with AI'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FounderIdeaGenerator;
