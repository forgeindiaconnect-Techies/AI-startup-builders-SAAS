import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, LayoutGrid, List, X, Rocket, Sparkles, RefreshCw, Trash2, Eye, ShieldCheck } from 'lucide-react';
import { createStartupDraft, getStartups, addNotification } from '../../../utils/localStorageHelper';
import { useAuth } from '../../../context/AuthContext';
import { getStartupVisibilityMap, setStartupInvestorVisibility } from '../../../utils/investorModuleStorage';

type Startup = {
  id: string;
  name: string;
  description: string;
  status: 'Approved' | 'In Review' | 'Draft' | 'Rejected' | 'generated' | 'active' | string;
  score: number;
  stage: string;
  color: string;
  category?: string;
  problem?: string;
  customers?: string;
  businessModel?: string;
};

const initialStartups: Startup[] = [];

const statusStyles: Record<string, string> = {
  'Approved': 'text-emerald-700 bg-emerald-50 border-emerald-200 font-extrabold shadow-2xs',
  'In Review': 'text-amber-700 bg-amber-50 border-amber-200 font-extrabold shadow-2xs',
  'Draft': 'text-slate-700 bg-slate-100 border-slate-200 font-extrabold shadow-2xs',
  'Rejected': 'text-rose-700 bg-rose-50 border-rose-200 font-extrabold shadow-2xs',
  'generated': 'text-purple-700 bg-purple-50 border-purple-200 font-extrabold shadow-2xs',
  'active': 'text-emerald-800 bg-emerald-100/90 border-emerald-300 font-black tracking-wide uppercase shadow-2xs px-3 py-1 rounded-full text-[10px]',
};

const getGradientBg = (idx: number) => {
  const bgClasses = [
    'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25',
    'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25',
    'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/25',
    'bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25',
    'bg-gradient-to-tr from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/25',
    'bg-gradient-to-tr from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/25',
  ];
  return bgClasses[idx % bgClasses.length];
};

const FounderStartups: React.FC = () => {
  const [startups, setStartups] = useState<Startup[]>(initialStartups);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStartupName, setNewStartupName] = useState('');
  const [newStartupDesc, setNewStartupDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { user } = useAuth();

  const filteredStartups = startups.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  const [visibilityMap, setVisibilityMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Load startups from backend on mount
    const loadLocalStartups = async () => {
      const deletedDummies = JSON.parse(localStorage.getItem('deleted_dummies') || '[]');
      const filteredInitial = initialStartups.filter(s => !deletedDummies.includes(s.id));

      const localData = await getStartups();
      const mappedStartups = localData.map((data: any, index: number) => ({
        id: data.startupId || data.id || data._id,
        name: data.startupName || 'Untitled Startup',
        description: data.startupIdea || data.problemStatement || data.description || 'No description provided.',
        status: data.status === 'pending_analysis' ? 'Draft' : (data.status || 'active'),
        score: data.aiGenerated?.aiReport?.investmentReadinessScore || data.aiReport?.investmentReadinessScore || 7,
        stage: 'Idea Phase',
        color: getGradientBg(index)
      }));
      setStartups([...filteredInitial, ...mappedStartups]);
      setVisibilityMap(getStartupVisibilityMap());
    };
    loadLocalStartups();
  }, []);

  const handleAddStartup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStartupName.trim() || !newStartupDesc.trim()) return;

    setLoading(true);
    setError('');

    try {
      const newStartupData = await createStartupDraft(newStartupName, newStartupDesc, user?.id);
      
      if (!newStartupData) {
        throw new Error('Failed to create startup');
      }

      addNotification({
        id: `notification_${Date.now()}`,
        userId: 'admin',
        title: 'New Startup Idea Submitted',
        message: `${newStartupName}: ${newStartupDesc}`,
        type: 'ai_builder',
        isRead: false,
        actionUrl: `/dashboard/admin/startups`,
        createdAt: new Date().toISOString()
      });

      setIsModalOpen(false);
      setNewStartupName('');
      setNewStartupDesc('');
      
      navigate(`/dashboard/founder/ai-builder?startupId=${newStartupData.id}`);
    } catch (err) {
      setError('Failed to save to database');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (startupId: string) => {
    if (window.confirm('Are you sure you want to delete this startup?')) {
      localStorage.removeItem(startupId);
      localStorage.removeItem(`startup_${startupId}`);
      if (startupId.startsWith('startup_')) {
        localStorage.removeItem(startupId.replace('startup_', ''));
      } else {
        const deletedDummies = JSON.parse(localStorage.getItem('deleted_dummies') || '[]');
        deletedDummies.push(startupId);
        localStorage.setItem('deleted_dummies', JSON.stringify(deletedDummies));
      }
      setStartups(prev => prev.filter(s => s.id !== startupId && `startup_${s.id}` !== startupId));
    }
  };

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Startups</h1>
          <p className="text-gray-500 text-sm mt-0.5 font-medium">Manage, analyze, and track your submitted startup ideas.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-5 py-2.5 bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] hover:from-[#4C1D95] hover:to-[#6D28D9] text-white font-extrabold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
        >
          <Plus size={18} className="mr-2" />
          Add New Startup
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 text-white rounded-2xl p-5 shadow-lg shadow-purple-500/15 flex items-center justify-between border border-purple-400/20">
          <div>
            <p className="text-[11px] font-bold text-purple-200 uppercase tracking-wider">Total Ideas</p>
            <p className="text-3xl font-black mt-1">{startups.length}</p>
          </div>
          <div className="p-3.5 bg-white/15 backdrop-blur-md rounded-2xl text-white border border-white/20">
            <Rocket size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 text-white rounded-2xl p-5 shadow-lg shadow-emerald-500/15 flex items-center justify-between border border-emerald-400/20">
          <div>
            <p className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider">AI Score Active</p>
            <p className="text-3xl font-black mt-1">{startups.filter(s => s.score > 0).length}</p>
          </div>
          <div className="p-3.5 bg-white/15 backdrop-blur-md rounded-2xl text-white border border-white/20">
            <Sparkles size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-800 text-white rounded-2xl p-5 shadow-lg shadow-blue-500/15 flex items-center justify-between border border-blue-400/20">
          <div>
            <p className="text-[11px] font-bold text-blue-200 uppercase tracking-wider">Investor Visible</p>
            <p className="text-3xl font-black mt-1">{Object.values(visibilityMap).filter(Boolean).length}</p>
          </div>
          <div className="p-3.5 bg-white/15 backdrop-blur-md rounded-2xl text-white border border-white/20">
            <ShieldCheck size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/70">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={17} />
            <input 
              type="text" 
              placeholder="Search startups by name or description..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B21B6] text-xs font-bold"
            />
          </div>
          <div className="hidden sm:flex items-center gap-1.5 border border-gray-200 rounded-xl p-1 bg-white">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'grid' ? 'text-[#5B21B6] bg-purple-50' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}
              title="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'list' ? 'text-[#5B21B6] bg-purple-50' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Startups Content */}
        <div className="p-6">
          {filteredStartups.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <Search size={24} className="text-gray-300" />
              </div>
              <h3 className="text-gray-900 font-bold mb-1">No startups found</h3>
              <p className="text-gray-500 text-sm">Try adjusting your search or add a new startup idea.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStartups.map((startup, idx) => (
                <div key={startup.id} className="border border-purple-100/80 rounded-2xl p-5 hover:border-[#5B21B6] hover:shadow-lg transition-all group flex flex-col h-full bg-white relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-md ${startup.color || getGradientBg(idx)}`}>
                      {startup.name.charAt(0).toUpperCase()}
                    </div>
                    <span className={`font-bold px-3 py-1 rounded-full border text-[10px] ${statusStyles[startup.status] || statusStyles['active']}`}>
                      {startup.status}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-gray-900 mb-1">{startup.name}</h3>
                  <p className="text-xs text-gray-500 mb-6 flex-1 line-clamp-3 leading-relaxed">{startup.description}</p>
                  
                  <div className="space-y-3 mb-6 bg-purple-50/40 p-3.5 rounded-xl border border-purple-100/60">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-bold">AI Score</span>
                      <span className="px-2.5 py-0.5 rounded-lg font-black text-purple-700 bg-purple-100 border border-purple-200 text-xs">
                        {startup.score}/100
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-bold">Readiness Stage</span>
                      <span className="font-extrabold text-[#5B21B6] text-xs flex items-center gap-1">
                        <Sparkles size={11} className="text-purple-500" />
                        {visibilityMap[startup.id] ? 'Investor Visible' : startup.score > 0 ? 'AI Analysis Complete' : 'Idea Phase'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1.5 border-t border-purple-100/60">
                      <span className="text-gray-500 font-bold">Investor Visibility</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const nextVal = !visibilityMap[startup.id];
                          setStartupInvestorVisibility(startup.id, nextVal);
                          setVisibilityMap(prev => ({ ...prev, [startup.id]: nextVal }));
                        }}
                        className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase transition-all shadow-2xs cursor-pointer ${
                          visibilityMap[startup.id]
                            ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {visibilityMap[startup.id] ? 'ON (Visible)' : 'OFF (Private)'}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-auto">
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/founder/ai-builder?startupId=${startup.id}`); }}
                      className="flex-1 py-2.5 bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] hover:from-[#4C1D95] hover:to-[#6D28D9] text-white rounded-xl font-extrabold text-xs transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles size={14} /> AI Builder
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(startup.id); }}
                      className="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded-xl transition-colors border border-rose-100 shadow-sm cursor-pointer"
                      title="Delete Startup"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap text-xs font-medium">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white">
                    <th className="px-5 py-4 font-black uppercase tracking-wider rounded-tl-xl">Startup</th>
                    <th className="px-5 py-4 font-black uppercase tracking-wider">Status</th>
                    <th className="px-5 py-4 font-black uppercase tracking-wider">AI Score</th>
                    <th className="px-5 py-4 font-black uppercase tracking-wider">Stage</th>
                    <th className="px-5 py-4 font-black uppercase tracking-wider text-right rounded-tr-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {filteredStartups.map((startup, idx) => (
                    <tr key={startup.id} className="hover:bg-purple-50/40 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base shadow-md flex-shrink-0 ${startup.color || getGradientBg(idx)}`}>
                            {startup.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 max-w-[220px] sm:max-w-[320px]">
                            <p className="font-extrabold text-gray-900 text-sm truncate">{startup.name}</p>
                            <p className="text-xs text-gray-500 truncate mt-0.5">{startup.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`font-bold px-3 py-1 rounded-full border text-[10px] ${statusStyles[startup.status] || statusStyles['active']}`}>
                          {startup.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-black border inline-flex items-center gap-1 ${
                          startup.score >= 80 ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          startup.score >= 50 ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          <Sparkles size={11} className="text-purple-500" />
                          {startup.score}/100
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-3 py-1 rounded-lg text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100 inline-flex items-center gap-1.5">
                          <Rocket size={12} className="text-indigo-500" />
                          {startup.stage || 'Idea Phase'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/founder/ai-builder?startupId=${startup.id}`); }}
                            className="px-4 py-2 bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] hover:from-[#4C1D95] hover:to-[#6D28D9] text-white rounded-xl font-extrabold text-xs shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <Sparkles size={13} /> AI Builder
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(startup.id); }}
                            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors border border-rose-100 shadow-sm cursor-pointer"
                            title="Delete Startup"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Startup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative animate-fade-in-up flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="bg-purple-100 p-1.5 rounded-lg">
                  <Rocket size={18} className="text-[#5B21B6]" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Add New Startup Idea</h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddStartup} className="p-6 overflow-y-auto">
              
              {error && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl font-bold text-sm">{error}</div>}

              <div className="mb-5">
                <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-1.5">Startup Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={newStartupName}
                  onChange={e => setNewStartupName(e.target.value)}
                  placeholder="e.g. EcoPackage Hub"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] bg-gray-50 focus:bg-white transition-colors"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="desc" className="block text-sm font-bold text-gray-700 mb-1.5">Startup Idea / Short Description</label>
                <textarea
                  id="desc"
                  required
                  rows={3}
                  value={newStartupDesc}
                  onChange={e => setNewStartupDesc(e.target.value)}
                  placeholder="Describe your startup idea in simple words..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] bg-gray-50 focus:bg-white transition-colors resize-none"
                ></textarea>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-gray-50 flex-shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={loading}
                  className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading || !newStartupName || !newStartupDesc}
                  className="flex items-center px-6 py-2.5 text-sm font-bold text-white bg-[#5B21B6] hover:bg-[#7C3AED] rounded-xl transition-all shadow-md shadow-purple-900/20 active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin mr-2" />
                      Saving your startup idea...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} className="mr-2" />
                      Continue to AI Builder
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FounderStartups;
