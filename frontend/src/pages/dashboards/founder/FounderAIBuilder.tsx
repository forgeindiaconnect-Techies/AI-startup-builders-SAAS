import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Lightbulb, FileText, BarChart3, Search, ClipboardList, MessageSquare, RefreshCw, Play, ChevronDown, Download, File as FileIcon, Sparkles, Scale } from 'lucide-react';
import FounderIdeaGenerator from './FounderIdeaGenerator';
import FounderBranding from './FounderBranding';
import FounderBusinessPlan from './FounderBusinessPlan';
import FounderPitchDeck from './FounderPitchDeck';
import FounderMarketResearch from './FounderMarketResearch';
import FounderReports from './FounderReports';
import FounderAIChat from './FounderAIChat';
import FounderLegalDocs from './FounderLegalDocs';
import { getStartups, getStartupById, updateStartup, generateStartupOutput, generateRoadmapAndTasks, addNotification, saveDocument, getDocuments, deleteDocument } from '../../../utils/localStorageHelper';

const tabs = [
  { id: 'idea',     label: 'AI Idea Generator',    icon: Lightbulb,    component: FounderIdeaGenerator },
  { id: 'branding', label: 'Logo & Branding',      icon: Sparkles,     component: FounderBranding },
  { id: 'plan',     label: 'Business Plan',         icon: FileText,     component: FounderBusinessPlan },
  { id: 'pitch',    label: 'Pitch Deck',             icon: BarChart3,    component: FounderPitchDeck },
  { id: 'market',   label: 'Market Research',        icon: Search,       component: FounderMarketResearch },
  { id: 'legal',    label: 'Legal & Documents',      icon: Scale,        component: FounderLegalDocs },
  { id: 'reports',  label: 'AI Reports',             icon: ClipboardList,component: FounderReports },
  { id: 'chat',     label: 'AI Chat',                icon: MessageSquare,component: FounderAIChat },
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
  const startupId = searchParams.get('id') || searchParams.get('startupId');

  useEffect(() => {
    const fetchStartup = async () => {
      if (!startupId) {
        // Load all startups if no specific ID is provided
        const locals = getStartups();
        setAllStartups(locals);
        return;
      }
      
      setLoading(true);
      setError('');
      try {
        const savedData = getStartupById(startupId);
        if (savedData) {
          setStartupData(savedData);
        } else {
          setError('Could not load startup data. It may not exist.');
        }
      } catch (err) {
        setError('Failed to load from local storage.');
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

    // Simulate API delay for realism
    setTimeout(() => {
      try {
        const aiOutput = generateStartupOutput(startupData);
        const { roadmap, tasks } = generateRoadmapAndTasks(startupData);
        
        const updatedStartup = updateStartup(startupId, {
          status: 'generated',
          aiGenerated: aiOutput,
          roadmap,
          tasks
        });
        
        setStartupData(updatedStartup);
        
        // Generate automatic documents all in PDF initially
        const generatedDocs = [
          { category: 'AI Report', type: 'PDF' },
          { category: 'Business Plan', type: 'PDF' },
          { category: 'Pitch Deck', type: 'PDF' },
          { category: 'Market Research', type: 'PDF' },
          { category: 'Roadmap', type: 'PDF' },
          { category: 'Full Package', type: 'PDF' }
        ];

        generatedDocs.forEach(doc => {
          saveDocument({
            id: `doc_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            startupId: startupId,
            founderId: startupData.founderId || "founder_demo_user",
            fileName: `${startupData.startupName.replace(/\s+/g, '_')}_${doc.category.replace(/\s+/g, '_')}.${doc.type.toLowerCase()}`,
            fileType: doc.type,
            fileSize: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
            fileData: "base64_or_blob_url",
            category: doc.category,
            status: "private",
            sharedWith: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        });

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
      } catch (err) {
        setError('AI generation failed. Please try again.');
        setStartupData(prev => prev ? { ...prev, status: 'failed' } : null);
      } finally {
        setGenerating(false);
      }
    }, 2000);
  };

  const handleExport = (fileType: string) => {
    if (!startupId || !startupData) return;
    setExporting(true);
    setShowExportMenu(false);
    
    // Simulate generation time
    setTimeout(() => {
      // Delete existing documents for this startup to replace them with new format
      const existingDocs = getDocuments().filter((d: any) => d.startupId === startupId);
      existingDocs.forEach((doc: any) => {
        deleteDocument(doc.id);
      });

      const categories = ['AI Report', 'Business Plan', 'Pitch Deck', 'Market Research', 'Roadmap', 'Full Package'];
      
      categories.forEach(category => {
        const fileName = `${startupData.startupName.replace(/\s+/g, '_')}_${category.replace(/\s+/g, '_')}.${fileType.toLowerCase()}`;
        
        const newDoc = {
          id: `doc_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          startupId: startupId,
          founderId: startupData.founderId || "founder_demo_user",
          fileName: fileName,
          fileType: fileType,
          fileSize: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
          fileData: "base64_or_blob_url",
          category: category,
          status: "private",
          sharedWith: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        saveDocument(newDoc);
      });
      
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
    }, 2000);
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
                    onClick={() => setSearchParams({ startupId: startup.startupId })}
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
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Builder</h1>
          <p className="text-gray-500 mt-1">All your AI-powered startup tools in one place.</p>
        </div>
        
        {startupData && startupData.status === 'generated' && (
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={handleGenerate}
              disabled={generating}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors flex items-center"
            >
              <RefreshCw size={16} className={`mr-2 ${generating ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
            
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

            <button 
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(startupData.aiGenerated, null, 2));
                alert('Startup data copied to clipboard!');
              }}
              className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl text-sm transition-colors flex items-center border border-gray-200"
            >
              <ClipboardList size={16} className="mr-2" />
              Copy
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
          </div>
        )}
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
