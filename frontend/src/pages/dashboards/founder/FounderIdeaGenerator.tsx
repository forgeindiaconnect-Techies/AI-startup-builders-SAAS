import React, { useState } from 'react';
import { Lightbulb, Sparkles, RefreshCw, Rocket, Target, Briefcase } from 'lucide-react';

interface Props {
  startupData?: any;
  setStartupData?: (data: any) => void;
}

import { generateStartupOutput, generateRoadmapAndTasks, updateStartup, addNotification } from '../../../utils/localStorageHelper';

const FounderIdeaGenerator: React.FC<Props> = ({ startupData = {}, setStartupData = () => {} }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const regenerate = () => {
    if (!startupData) return;
    
    setLoading(true);
    setError('');
    
    setTimeout(() => {
      try {
        const aiOutput = generateStartupOutput(startupData);
        const { roadmap, tasks } = generateRoadmapAndTasks(startupData);
        
        const updatedStartup = updateStartup(startupData.id || startupData.startupId, {
          aiGenerated: aiOutput,
          roadmap,
          tasks
        });
        
        if (updatedStartup) {
          setStartupData(updatedStartup);
          addNotification({
            id: `notification_${Date.now()}`,
            userId: 'admin',
            title: 'Startup Idea Regenerated',
            message: `${startupData.startupName}: ${startupData.startupIdea}`,
            type: 'ai_builder',
            isRead: false,
            actionUrl: `/dashboard/admin/startups`,
            createdAt: new Date().toISOString()
          });
          window.alert('Success: Startup regenerated successfully');
        }
      } catch (err) {
        setError('Failed to regenerate startup');
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  if (startupData) {
    const ai = startupData.aiGenerated?.ideaAnalysis || {};
    return (
      <div className="animate-fade-in-up space-y-8">
        {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl font-bold">{error}</div>}
        
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8">
          
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <h2 className="text-[32px] font-bold text-gray-900 leading-tight">{startupData.startupName}</h2>
            <span className="bg-purple-100 text-[#5B21B6] text-xs font-black uppercase px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1 shrink-0 w-fit">
              <Sparkles size={12} /> AI Generated
            </span>
          </div>
          
          <p className="text-[#5B21B6] font-bold text-[15px] leading-[1.7] mb-8">{ai.refinedStartupIdea || ai.refinedIdea || startupData.startupIdea}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-6 rounded-[20px] border border-gray-100 h-full flex flex-col">
              <h3 className="font-semibold text-[18px] text-gray-900 mb-4 tracking-wide uppercase">Problem</h3>
              <p className="text-gray-700 text-[15px] leading-[1.7] break-words">{ai.problemStatement}</p>
            </div>
            <div className="bg-purple-50/50 p-6 rounded-[20px] border border-purple-100/50 h-full flex flex-col">
              <h3 className="font-semibold text-[18px] text-[#5B21B6] mb-4 tracking-wide uppercase">Solution</h3>
              <p className="text-gray-700 text-[15px] leading-[1.7] break-words">{ai.solution}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="border border-gray-100 rounded-[20px] p-6 h-full flex flex-col">
              <h3 className="font-semibold text-[18px] text-gray-900 mb-4 flex items-center gap-2 tracking-wide"><Target size={18} /> Target Customers</h3>
              <ul className="list-disc pl-5 text-[15px] leading-[1.7] text-gray-700 space-y-3 break-words">
                {ai.targetCustomers?.map((c: string, i: number) => <li key={i}>{c}</li>)}
              </ul>
            </div>
            <div className="border border-gray-100 rounded-[20px] p-6 h-full flex flex-col">
              <h3 className="font-semibold text-[18px] text-gray-900 mb-4 flex items-center gap-2 tracking-wide"><Briefcase size={18} /> Business Model</h3>
              <p className="text-[15px] leading-[1.7] text-gray-700 mb-3 font-bold break-words">{ai.businessModel}</p>
              <p className="text-[15px] leading-[1.7] text-gray-500 break-words">{ai.revenueModel}</p>
            </div>
            <div className="border border-gray-100 rounded-[20px] p-6 h-full flex flex-col">
              <h3 className="font-semibold text-[18px] text-gray-900 mb-4 flex items-center gap-2 tracking-wide"><Rocket size={18} /> Core Features</h3>
              <ul className="list-disc pl-5 text-[15px] leading-[1.7] text-gray-700 space-y-3 break-words">
                {ai.coreFeatures?.map((f: string, i: number) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-[20px] border border-gray-100 p-6 mb-8">
              <h3 className="font-semibold text-[18px] text-gray-900 mb-4 tracking-wide uppercase">Unique Value Proposition</h3>
              <p className="text-[15px] leading-[1.7] text-gray-700 break-words">{ai.uniqueValueProposition}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-[20px] border border-gray-100 p-6">
                <h3 className="font-semibold text-[18px] text-gray-900 mb-4 tracking-wide uppercase flex items-center gap-2">Market Opportunity</h3>
                <p className="text-[15px] leading-[1.7] text-gray-700 break-words">{ai.marketOpportunity}</p>
            </div>
            
            <div className="bg-emerald-50/50 rounded-[20px] border border-emerald-100 p-6">
                <h3 className="font-semibold text-[18px] text-emerald-900 mb-4 tracking-wide uppercase flex items-center gap-2">Next Steps</h3>
                <ul className="list-decimal pl-5 text-[15px] leading-[1.7] text-emerald-800 space-y-2 break-words font-medium">
                  {ai.nextSteps?.map((step: string, i: number) => <li key={i}>{step}</li>)}
                </ul>
            </div>
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
              value={startupData?.startupName || ''}
              onChange={(e) => setStartupData({...startupData, startupName: e.target.value})}
              placeholder="e.g. Hotel AI Platform"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] bg-gray-50 focus:bg-white transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2">
              <Lightbulb size={16} className="text-[#5B21B6]" /> Startup Idea / Short Description
            </label>
            <textarea
              value={startupData?.startupIdea || ''}
              onChange={e => setStartupData({...startupData, startupIdea: e.target.value})}
              placeholder="e.g. I want to build a luxury hotel management and booking platform using AI."
              className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] bg-gray-50 focus:bg-white transition-colors resize-none"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={regenerate}
            disabled={loading || (!startupData?.startupName || !startupData?.startupIdea)}
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
