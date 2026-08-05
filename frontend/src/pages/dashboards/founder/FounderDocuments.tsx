import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FileText, Building2, RefreshCw, Scale } from 'lucide-react';
import {
  getStartups, getStartupById,
} from '../../../utils/localStorageHelper';
import FounderLegalDocs from './FounderLegalDocs';

const FounderDocuments: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const startupId = searchParams.get('id') || searchParams.get('startupId');

  const [allStartups, setAllStartups] = useState<any[]>([]);
  const [selectedStartup, setSelectedStartup] = useState<any>(null);

  const refresh = useCallback(async () => {
    const allStartupsList = await getStartups() || [];
    setAllStartups(allStartupsList);
    const info = startupId ? await getStartupById(startupId) : null;
    setSelectedStartup(info);
  }, [startupId]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    const onFocus = () => refresh();
    const onStorage = (e: StorageEvent) => { if (e.key === 'ai_startup_builder_documents') refresh(); };
    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refresh(); });
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onStorage);
    };
  }, [refresh]);

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Legal & Documents</h1>
          <p className="text-gray-500 mt-1">
            {selectedStartup
              ? `Legal & compliance documents for ${selectedStartup.startupName}`
              : 'Generate and manage legal & compliance documents for your startup.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={refresh} className="px-3 py-1.5 text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1 transition-colors">
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      {allStartups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 size={24} className="text-[#5B21B6]" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">No Startups Found</h3>
          <p className="text-sm text-gray-500 mb-4">Create a startup idea first to generate its legal & compliance documents.</p>
          <button onClick={() => navigate('/dashboard/founder/startups')} className="px-5 py-2 bg-[#5B21B6] hover:bg-[#7C3AED] text-white text-sm font-bold rounded-xl transition-colors">
            Create Startup
          </button>
        </div>
      ) : (
        <>
          {/* Startup Selector */}
          <div className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Scale size={20} className="text-[#5B21B6]" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Select Startup</p>
                <select
                  value={startupId || ''}
                  onChange={(e) => {
                    if (e.target.value) setSearchParams({ startupId: e.target.value });
                    else setSearchParams({});
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5B21B6] bg-gray-50 focus:bg-white transition-colors cursor-pointer"
                >
                  <option value="">Select a startup...</option>
                  {allStartups.map((s: any) => (
                    <option key={s.startupId} value={s.startupId}>
                      {s.startupName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {startupId && selectedStartup ? (
            <FounderLegalDocs startupData={selectedStartup} />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={24} className="text-[#5B21B6]" />
              </div>
              <h3 className="text-gray-900 font-bold mb-1">Select a startup</h3>
              <p className="text-gray-500 text-sm">Choose a startup above to generate its legal & compliance documents.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FounderDocuments;
