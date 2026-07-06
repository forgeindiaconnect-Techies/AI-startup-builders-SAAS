import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MoreVertical, LayoutGrid, List, X, Rocket, Sparkles, RefreshCw } from 'lucide-react';

type Startup = {
  id: string;
  name: string;
  description: string;
  status: 'Approved' | 'In Review' | 'Draft' | 'Rejected' | 'generated';
  score: number;
  stage: string;
  color: string;
  category?: string;
  problem?: string;
  customers?: string;
  businessModel?: string;
};

const initialStartups: Startup[] = [
  { id: '1', name: 'EcoPackage Hub', description: 'Sustainable packaging marketplace connecting green manufacturers with D2C e-commerce brands.', status: 'Approved', score: 92, stage: 'Pre-Seed', color: 'bg-green-100 text-green-600' },
  { id: '2', name: 'FinFlow AI', description: 'Automated financial forecasting for SaaS companies using LLM-based data extraction.', status: 'In Review', score: 85, stage: 'Idea Phase', color: 'bg-blue-100 text-blue-600' },
  { id: '3', name: 'LegalLens AI', description: 'AI-powered contract review and risk analysis platform for small law firms.', status: 'Approved', score: 95, stage: 'Seed', color: 'bg-purple-100 text-purple-600' },
];

const statusStyles: Record<string, string> = {
  'Approved': 'text-green-700 bg-green-50 border-green-200',
  'In Review': 'text-yellow-700 bg-yellow-50 border-yellow-200',
  'Draft': 'text-gray-700 bg-gray-50 border-gray-200',
  'Rejected': 'text-red-700 bg-red-50 border-red-200',
  'generated': 'text-purple-700 bg-purple-50 border-purple-200',
};

const FounderStartups: React.FC = () => {
  const [startups, setStartups] = useState<Startup[]>(initialStartups);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStartupName, setNewStartupName] = useState('');
  const [newStartupDesc, setNewStartupDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const filteredStartups = startups.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddStartup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStartupName.trim() || !newStartupDesc.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/startups/create-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          startupName: newStartupName, 
          startupIdea: newStartupDesc 
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setIsModalOpen(false);
        setNewStartupName('');
        setNewStartupDesc('');
        
        navigate(`/dashboard/founder/ai-builder?id=${data.data.startupId}`);
      } else {
        setError(data.message || 'Failed to save startup idea');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Startups</h1>
          <p className="text-gray-500 mt-1">Manage and track your submitted startup ideas.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl transition-all shadow-sm active:scale-95"
        >
          <Plus size={18} className="mr-2" />
          Add New Startup
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search startups by name or description..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B21B6] text-sm"
            />
          </div>
          <div className="hidden sm:flex items-center gap-1.5 border border-gray-200 rounded-lg p-1 bg-white">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'text-[#5B21B6] bg-purple-50' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}
              title="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'text-[#5B21B6] bg-purple-50' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}
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
              {filteredStartups.map(startup => (
                <div key={startup.id} className="border border-gray-200 rounded-xl p-5 hover:border-[#5B21B6]/30 hover:shadow-md transition-all group flex flex-col h-full bg-white">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-sm ${startup.color}`}>
                      {startup.name.charAt(0)}
                    </div>
                    <button className="text-gray-400 hover:text-[#5B21B6] hover:bg-purple-50 p-1.5 rounded-lg transition-colors"><MoreVertical size={16} /></button>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{startup.name}</h3>
                  <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-3">{startup.description}</p>
                  
                  <div className="space-y-3 mb-6 bg-gray-50/50 p-3 rounded-lg border border-gray-100/50">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium">Status</span>
                      <span className={`font-bold px-2.5 py-0.5 rounded-md border text-xs ${statusStyles[startup.status]}`}>{startup.status}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium">AI Score</span>
                      <span className={`font-black ${startup.score >= 90 ? 'text-green-600' : startup.score > 80 ? 'text-blue-600' : 'text-gray-900'}`}>{startup.score}/100</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium">Stage</span>
                      <span className="font-bold text-gray-900">{startup.stage}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => navigate('/dashboard/founder/ai-builder')}
                    className="w-full py-2.5 bg-gray-50 group-hover:bg-[#5B21B6] text-gray-700 group-hover:text-white rounded-lg font-bold text-sm transition-all duration-200 border border-gray-200 group-hover:border-[#5B21B6] shadow-sm group-hover:shadow"
                  >
                    Manage Startup
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider rounded-tl-lg">Startup</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">AI Score</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Stage</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right rounded-tr-lg">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredStartups.map(startup => (
                    <tr key={startup.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shadow-sm flex-shrink-0 ${startup.color}`}>
                            {startup.name.charAt(0)}
                          </div>
                          <div className="min-w-0 max-w-[200px] sm:max-w-[300px]">
                            <p className="font-bold text-gray-900 truncate">{startup.name}</p>
                            <p className="text-xs text-gray-500 truncate">{startup.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`font-bold px-2.5 py-1 rounded-md border text-[11px] ${statusStyles[startup.status]}`}>{startup.status}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`font-black text-sm ${startup.score >= 90 ? 'text-green-600' : startup.score > 80 ? 'text-blue-600' : 'text-gray-900'}`}>{startup.score}/100</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-bold text-gray-900 text-sm">{startup.stage}</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button 
                          onClick={() => navigate('/dashboard/founder/ai-builder')}
                          className="px-4 py-1.5 bg-white border border-gray-200 group-hover:border-[#5B21B6] group-hover:text-[#5B21B6] rounded-lg font-bold text-xs transition-colors shadow-sm text-gray-700"
                        >
                          Manage
                        </button>
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
