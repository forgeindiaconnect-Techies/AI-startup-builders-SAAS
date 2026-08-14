import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, FolderLock, Eye, AlertTriangle, FileText, CheckCircle2, UserCheck, RefreshCw } from 'lucide-react';
import { fetchAllDataRoomsAdmin } from '../../../utils/dataroomApi';

const AdminDataRooms: React.FC = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDataRooms = async () => {
    setLoading(true);
    try {
      const data = await fetchAllDataRoomsAdmin();
      setRooms(data || []);
    } catch (err) {
      console.error('Error fetching admin data rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataRooms();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Data Room Governance</h1>
          <p className="text-xs text-gray-500 mt-1">
            Monitor startup due diligence rooms, review uploaded documents, audit investor access permissions, and check AI readiness.
          </p>
        </div>
        <button
          onClick={loadDataRooms}
          className="px-4 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
        >
          <RefreshCw size={14} /> Refresh Governance
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-gray-900 text-sm">Platform Startup Data Rooms ({rooms.length})</h3>

        {loading ? (
          <div className="p-8 text-center text-gray-400 font-medium text-xs animate-pulse">
            Loading platform data rooms...
          </div>
        ) : rooms.length === 0 ? (
          <div className="p-8 bg-gray-50 rounded-xl text-center text-xs text-gray-500 font-medium">
            No active data rooms created across the platform yet.
          </div>
        ) : (
          <div className="space-y-4">
            {rooms.map((room) => (
              <div key={room._id || room.startupId} className="p-5 rounded-2xl border border-gray-200 bg-gray-50/60 space-y-3 text-xs">
                <div className="flex flex-wrap justify-between items-center gap-2 border-b border-gray-200 pb-3">
                  <div>
                    <span className="font-bold text-gray-900 text-base">{room.startupName}</span>
                    <span className="text-gray-500 ml-2">Founder ID: {room.founderId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-purple-50 text-[#5B21B6] border border-purple-100 rounded-full font-extrabold text-[10px]">
                      Readiness: {room.aiAnalysis?.overallReadiness || 78}%
                    </span>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-extrabold text-[10px]">
                      {room.documents?.length || 0} Files
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <span className="font-bold text-gray-400 block mb-1 uppercase tracking-wider text-[10px]">Investor Access Granted</span>
                    <span className="font-extrabold text-gray-900 text-sm block">
                      {room.investorAccess?.filter((a: any) => a.status === 'granted').length || 0} Investors
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <span className="font-bold text-gray-400 block mb-1 uppercase tracking-wider text-[10px]">Pending Investor Q&A</span>
                    <span className="font-extrabold text-amber-600 text-sm block">
                      {room.questions?.filter((q: any) => q.status === 'pending').length || 0} Questions
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <span className="font-bold text-gray-400 block mb-1 uppercase tracking-wider text-[10px]">Missing Critical Docs</span>
                    <span className="font-bold text-red-600 text-xs block">
                      {room.aiAnalysis?.missingDocuments?.length || 0} Flagged
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDataRooms;
