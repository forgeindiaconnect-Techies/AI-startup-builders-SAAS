import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Lightbulb, FileText, BarChart3, Search, ClipboardList, MessageSquare, RefreshCw, Play } from 'lucide-react';
import FounderIdeaGenerator from './FounderIdeaGenerator';
import FounderBusinessPlan from './FounderBusinessPlan';
import FounderPitchDeck from './FounderPitchDeck';
import FounderMarketResearch from './FounderMarketResearch';
import FounderReports from './FounderReports';
import FounderAIChat from './FounderAIChat';

const tabs = [
  { id: 'idea',     label: 'AI Idea Generator',    icon: Lightbulb,    component: FounderIdeaGenerator },
  { id: 'plan',     label: 'Business Plan',         icon: FileText,     component: FounderBusinessPlan },
  { id: 'pitch',    label: 'Pitch Deck',             icon: BarChart3,    component: FounderPitchDeck },
  { id: 'market',   label: 'Market Research',        icon: Search,       component: FounderMarketResearch },
  { id: 'reports',  label: 'AI Reports',             icon: ClipboardList,component: FounderReports },
  { id: 'chat',     label: 'AI Chat',                icon: MessageSquare,component: FounderAIChat },
];

const FounderAIBuilder: React.FC = () => {
  const [active, setActive] = useState('idea');
  const [startupData, setStartupData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const startupId = searchParams.get('id') || searchParams.get('startupId');

  useEffect(() => {
    const fetchStartup = async () => {
      if (!startupId) return;
      
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`http://localhost:5000/api/startups/${startupId}`);
        const data = await response.json();
        
        if (data.success) {
          setStartupData(data.data);
        } else {
          setError('Could not load startup data.');
        }
      } catch (err) {
        setError('Failed to connect to server.');
      } finally {
        setLoading(false);
      }
    };

    fetchStartup();
  }, [startupId]);

  const handleGenerate = async () => {
    if (!startupId) return;
    setGenerating(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:5000/api/ai-builder/generate/${startupId}`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        setStartupData(data.data);
      } else {
        setError(data.message || 'AI generation failed. Please try again.');
        setStartupData(prev => prev ? { ...prev, status: 'failed' } : null);
      }
    } catch (err) {
      setError('AI generation failed. Please try again.');
      setStartupData(prev => prev ? { ...prev, status: 'failed' } : null);
    } finally {
      setGenerating(false);
    }
  };

  const ActiveComponent = tabs.find(t => t.id === active)!.component;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
        <RefreshCw size={32} className="animate-spin text-[#5B21B6] mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Loading your startup...</h2>
      </div>
    );
  }

  if (startupData?.status === 'generating' || generating) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
        <RefreshCw size={48} className="animate-spin text-[#5B21B6] mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI is analyzing your startup idea...</h2>
        <p className="text-gray-500 max-w-md text-center">
          Generating business plan, pitch deck, market research, and reports...
        </p>
      </div>
    );
  }

  if (startupData?.status === 'pending_analysis' || startupData?.status === 'failed') {
    return (
      <div className="animate-fade-in-up pb-10 max-w-3xl mx-auto mt-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lightbulb size={32} className="text-[#5B21B6]" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{startupData.startupName}</h1>
          <p className="text-gray-600 text-lg mb-8">{startupData.startupIdea}</p>

          {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl font-bold text-sm">{error}</div>}

          <div className="bg-purple-50 rounded-xl p-6 mb-8 border border-purple-100">
            <h3 className="font-bold text-purple-900 mb-2">Your startup idea is ready for AI analysis.</h3>
            <p className="text-purple-700 text-sm">
              Our AI will generate a complete business plan, pitch deck, market research, and readiness report based on your idea.
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center px-8 py-3.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl transition-all shadow-md shadow-purple-900/20 active:scale-95 text-lg"
          >
            <Play size={20} className="mr-3 fill-current" />
            Analyze & Generate with AI
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI Builder</h1>
        <p className="text-gray-500 mt-1">All your AI-powered startup tools in one place.</p>
      </div>
      
      {error && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl font-bold text-sm">{error}</div>}

      {/* Tab Bar */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-7 overflow-x-auto flex-wrap">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all duration-200 ${
              active === t.id
                ? 'bg-white text-[#5B21B6] shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {startupData && startupData.status === 'generated' && (
        <ActiveComponent startupData={startupData} setStartupData={setStartupData} />
      )}
    </div>
  );
};

export default FounderAIBuilder;
