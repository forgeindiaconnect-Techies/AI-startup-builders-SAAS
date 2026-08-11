import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Lightbulb, FileText, BarChart3, Search, ClipboardList, MessageSquare, RefreshCw, Play, ChevronDown, Download, File as FileIcon, Sparkles, Scale, Lock, ShieldCheck, Target, Layers, IndianRupee, Send } from 'lucide-react';
import FounderIdeaGenerator from './FounderIdeaGenerator';
import FounderIdeaValidation from './FounderIdeaValidation';
import FounderCompetitorAnalysis from './FounderCompetitorAnalysis';
import FounderMVPPlanner from './FounderMVPPlanner';
import FounderFinancialPlan from './FounderFinancialPlan';
import FounderGTMStrategy from './FounderGTMStrategy';
import FounderBranding from './FounderBranding';
import FounderBusinessPlan from './FounderBusinessPlan';
import FounderPitchDeck from './FounderPitchDeck';
import FounderMarketResearch from './FounderMarketResearch';
import FounderReports from './FounderReports';
import FounderAIChat from './FounderAIChat';
import FounderLegalDocs from './FounderLegalDocs';
import PlanGate, { usePlanAccess } from '../../../components/shared/PlanGate';
import { getStartups, getStartupById, updateStartup, generateStartupFromBackend, generateRoadmapAndTasks, addNotification, saveDocument, getDocuments, deleteDocument, detectStartupCategory, generateCategoryDocuments, sanitizeStartupId } from '../../../utils/localStorageHelper';

const tabs = [
  { id: 'idea',                label: 'AI Idea Generator',    icon: Lightbulb,     component: FounderIdeaGenerator },
  { id: 'idea_validation',     label: 'Idea Validation',      icon: ShieldCheck,   component: FounderIdeaValidation },
  { id: 'competitor_analysis', label: 'Competitor Analysis',  icon: Target,        component: FounderCompetitorAnalysis },
  { id: 'mvp_planner',         label: 'MVP Planner',          icon: Layers,        component: FounderMVPPlanner },
  { id: 'financial_plan',      label: 'Financial Plan',       icon: IndianRupee,   component: FounderFinancialPlan },
  { id: 'gtm_strategy',        label: 'Go-To-Market Strategy', icon: Send,         component: FounderGTMStrategy },
  { id: 'branding',            label: 'Logo & Branding',      icon: Sparkles,      component: FounderBranding, plans: ['pro', 'premium_startup_builder'] },
  { id: 'plan',                label: 'Business Plan',        icon: FileText,      component: FounderBusinessPlan },
  { id: 'pitch',               label: 'Pitch Deck',           icon: BarChart3,     component: FounderPitchDeck },
  { id: 'market',              label: 'Market Research',      icon: Search,        component: FounderMarketResearch },
  { id: 'legal',               label: 'Legal & Documents',    icon: Scale,         component: FounderLegalDocs },
  { id: 'reports',             label: 'AI Reports',           icon: ClipboardList, component: FounderReports },
  { id: 'chat',                label: 'AI Chat',              icon: MessageSquare, component: FounderAIChat, plans: ['pro', 'premium_startup_builder'] },
];

const FounderAIBuilder: React.FC = () => {
  const [active, setActive] = useState('idea');
  const [startupData, setStartupData] = useState<any>(null);
  const [allStartups, setAllStartups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const startupId = sanitizeStartupId(searchParams.get('id') || searchParams.get('startupId'));
  const { canAccess } = usePlanAccess();

  const activeTab = tabs.find(t => t.id === active)!;
  const ActiveComponent = activeTab.component;

  useEffect(() => {
    const fetchStartup = async () => {
      if (!startupId) {
        const locals = await getStartups();
        setAllStartups(locals);
        if (locals.length > 0 && !startupData) {
          setStartupData(locals[0]);
        }
        return;
      }
      
      setLoading(true);
      setError('');
      try {
        let savedData = await getStartupById(startupId);
        if (!savedData) {
          const locals = await getStartups();
          savedData = locals.find((s: any) => String(s.startupId || s._id || s.id) === String(startupId)) || null;
        }
        if (savedData) {
          setStartupData(savedData);
        } else {
          const locals = await getStartups();
          if (locals.length > 0) {
            setStartupData(locals[0]);
          } else {
            setError('Could not load startup data. It may not exist.');
          }
        }
      } catch (err) {
        setError('Failed to load from database.');
      } finally {
        setLoading(false);
      }
    };

    fetchStartup();
  }, [startupId]);

  const handleGenerate = async () => {
    if (!startupId || !startupData) return;
    setGenerating(true);
    setError('');

    try {
      const aiOutput = await generateStartupFromBackend(startupData);
      const { roadmap, tasks } = generateRoadmapAndTasks(startupData);
        
        const updatedStartup = await updateStartup(startupId, {
          status: 'generated',
          aiGenerated: aiOutput,
          roadmap,
          tasks
        });
        
        if (updatedStartup) {
          setStartupData(updatedStartup);
        }
        
        // Generate category-specific documents based on business type
        const existingDocs = (await getDocuments()).filter((d: any) => d.startupId === startupId);
        existingDocs.forEach((doc: any) => deleteDocument(doc.id));

        const startupCategory = detectStartupCategory(startupData);
        const categoryDocs = generateCategoryDocuments(
          startupId,
          startupData.founderId || 'founder_demo_user',
          startupData.startupName,
          startupCategory
        );
        categoryDocs.forEach(doc => saveDocument(doc));

        // Dispatch notification
        addNotification({
          id: `notification_${Date.now()}`,
          userId: startupData.founderId || "founder_demo_user",
          title: "Startup Plan Generated Successfully",
          message: "AI has generated your startup plan, roadmap, tasks, and milestones.",
          type: "ai_builder",
          isRead: false,
          actionUrl: `/dashboard/founder/ai-builder?startupId=${startupId}`,
          createdAt: new Date().toISOString()
        });

        // Notify admin about new AI generation
        addNotification({
          id: `notification_${Date.now()}_admin`,
          userId: 'admin',
          title: 'Founder Generated Startup Plan',
          message: `${startupData.startupName}: ${startupData.startupIdea} (${startupCategory})`,
          type: 'ai_builder',
          isRead: false,
          actionUrl: `/dashboard/admin/startups`,
          createdAt: new Date().toISOString()
        });
    } catch (err) {
      setError(err instanceof Error && err.message !== 'AI generation failed'
        ? err.message
        : 'AI generation failed. Please try again.');
      setStartupData(prev => prev ? { ...prev, status: 'failed' } : null);
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = (fileType: string) => {
    if (!startupId || !startupData) return;
    setExporting(true);
    setShowExportMenu(false);
    
    setTimeout(() => {
      addNotification({
        id: `notification_${Date.now()}`,
        userId: startupData.founderId || "founder_demo_user",
        title: "Documents exported successfully.",
        message: `All startup documents have been exported as ${fileType}.`,
        type: "document_export",
        isRead: false,
        actionUrl: `/dashboard/founder/documents`,
        createdAt: new Date().toISOString()
      });
      
      setExporting(false);
      window.alert(`All documents successfully exported as ${fileType}!`);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
        <RefreshCw size={32} className="animate-spin text-[#5B21B6] mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Loading your startup...</h2>
      </div>
    );
  }

  if (!startupId) {
    return (
      <div className="animate-fade-in-up pb-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">AI Builder</h1>
          <p className="text-gray-500 mt-1">Select a startup idea to generate or view its AI-powered documents.</p>
        </div>

        {allStartups.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb size={24} className="text-[#5B21B6]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No startup ideas found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">You haven't added any startup ideas yet. Go to 'My Startups' to add your first idea.</p>
            <button 
              onClick={() => window.location.href = '/dashboard/founder/startups'}
              className="px-6 py-2.5 bg-[#5B21B6] text-white font-bold rounded-xl shadow-md"
            >
              Go to My Startups
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allStartups.map(startup => (
              <div key={startup.startupId} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#5B21B6]/30 hover:shadow-md transition-all group flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center font-black text-xl shadow-sm">
                    {startup.startupName.charAt(0)}
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                    startup.status === 'generated' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  }`}>
                    {startup.status === 'generated' ? 'Generated' : 'Draft'}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2">{startup.startupName}</h3>
                <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-3">{startup.startupIdea}</p>
                
                <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => setSearchParams({ startupId: startup.startupId || startup.id || startup._id })}
                    className="flex-1 py-2 bg-purple-50 hover:bg-[#5B21B6] text-[#5B21B6] hover:text-white rounded-lg font-bold text-sm transition-colors border border-purple-100 hover:border-[#5B21B6]"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this startup?')) {
                        localStorage.removeItem(startup.startupId);
                        setAllStartups(prev => prev.filter(s => s.startupId !== startup.startupId));
                      }
                    }}
                    className="px-4 py-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg font-bold text-sm transition-colors border border-red-100 hover:border-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{startupData?.startupName || 'AI Builder'}</h1>
            {startupData?.status && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                startupData.status === 'generated' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {startupData.status === 'generated' ? 'AI Generated' : startupData.status === 'pending_analysis' ? 'Draft' : startupData.status}
              </span>
            )}
          </div>
          <p className="text-gray-500 mt-1">All your AI-powered startup tools in one place.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {startupData && startupData.status !== 'generated' && (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-5 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl text-sm transition-all shadow flex items-center gap-2 disabled:opacity-50"
            >
              {generating ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
              {generating ? 'Analyzing & Generating...' : 'Generate with AI'}
            </button>
          )}

          {startupData && startupData.status === 'generated' && (
            <>
              <button 
                onClick={() => {
                  alert('Saved to My Startups!');
                  window.location.href = '/dashboard/founder/startups';
                }}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-sm transition-colors flex items-center border border-blue-100"
              >
                <FileIcon size={16} className="mr-2" />
                Save to My Startups
              </button>

              <div className="relative">
                <button 
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={exporting}
                  className="flex items-center px-4 py-2 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl shadow text-sm transition-colors disabled:opacity-50"
                >
                  {exporting ? <RefreshCw size={16} className="animate-spin mr-2" /> : <Download size={16} className="mr-2" />}
                  {exporting ? 'Exporting...' : 'Export'}
                  <ChevronDown size={16} className="ml-2" />
                </button>
                
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in-up">
                    <button 
                      onClick={() => handleExport('PDF')}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center text-sm font-bold text-gray-700"
                    >
                      <FileText size={16} className="mr-3 text-red-500" /> Export PDF
                    </button>
                    <button 
                      onClick={() => handleExport('WORD')}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center text-sm font-bold text-gray-700"
                    >
                      <FileIcon size={16} className="mr-3 text-blue-500" /> Export Word
                    </button>
                    <button 
                      onClick={() => handleExport('PPT')}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center text-sm font-bold text-gray-700"
                    >
                      <BarChart3 size={16} className="mr-3 text-orange-500" /> Export Pitch Deck
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button 
                      onClick={() => handleExport('ZIP')}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center text-sm font-bold text-gray-700"
                    >
                      <Download size={16} className="mr-3 text-purple-500" /> Download All as ZIP
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      {error && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl font-bold text-sm">{error}</div>}

      {/* Tab Bar */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-7 overflow-x-auto flex-wrap">
        {tabs.map(t => {
          const isLocked = t.plans ? !canAccess(t.plans) : false;
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                active === t.id
                  ? 'bg-white text-[#5B21B6] shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              } ${isLocked ? 'opacity-80' : ''}`}
            >
              <t.icon size={15} /> {t.label}
              {isLocked && <Lock size={13} className="text-amber-500" />}
            </button>
          );
        })}
      </div>

      {startupData && (() => {
        const Comp = ActiveComponent as any;
        return activeTab.plans ? (
          <PlanGate requiredPlans={activeTab.plans}>
            <Comp startupData={startupData} setStartupData={setStartupData} onBackToBuilder={() => setActive('idea')} />
          </PlanGate>
        ) : (
          <Comp startupData={startupData} setStartupData={setStartupData} onBackToBuilder={() => setActive('idea')} />
        );
      })()}
    </div>
  );
};

export default FounderAIBuilder;
