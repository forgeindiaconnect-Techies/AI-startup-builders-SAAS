import React, { useState } from 'react';
import { CheckCircle2, Circle, ChevronRight, Plus } from 'lucide-react';
import { updateStartup } from '../../../utils/localStorageHelper';

const initialPhases: any[] = [];

const statusColors: Record<string, string> = {
  completed: 'from-emerald-500 to-teal-500',
  'in-progress': 'from-[#5B21B6] to-[#7C3AED]',
  upcoming: 'from-gray-600 to-gray-500',
};
const statusLabels: Record<string, string> = {
  completed: 'Completed',
  'in-progress': 'In Progress',
  upcoming: 'Upcoming',
};

interface Props {
  startupData?: any;
  setStartupData?: (d: any) => void;
}

const FounderRoadmap: React.FC<Props> = ({ startupData, setStartupData }) => {
  const [activePhase, setActivePhase] = useState(2);
  const [phases, setPhases] = useState(initialPhases);

  React.useEffect(() => {
    if (startupData?.roadmap && startupData.roadmap.length > 0) {
      setPhases(startupData.roadmap);
    }
  }, [startupData]);

  const handleAddMilestone = () => {
    const milestoneName = window.prompt("Enter new milestone name:");
    if (milestoneName) {
      const updatedPhases = phases.map(p => {
        if (p.id === activePhase || (activePhase === 0 && p.id === 1)) {
          return {
            ...p,
            milestones: [...p.milestones, { name: milestoneName, done: false }]
          };
        }
        return p;
      });
      setPhases(updatedPhases);
      if (startupData && startupData.id && setStartupData) {
        const updated = updateStartup(startupData.id, { roadmap: updatedPhases });
        if (updated) setStartupData(updated);
      }
    }
  };
  
  const toggleMilestone = (phaseId: number, msIndex: number) => {
    const updatedPhases = phases.map(p => {
      if (p.id === phaseId) {
        const newMs = [...p.milestones];
        newMs[msIndex].done = !newMs[msIndex].done;
        return { ...p, milestones: newMs };
      }
      return p;
    });
    setPhases(updatedPhases);
    if (startupData && startupData.id && setStartupData) {
      const updated = updateStartup(startupData.id, { roadmap: updatedPhases });
      if (updated) setStartupData(updated);
    }
  };

  const total = phases.reduce((acc, p) => acc + p.milestones.length, 0);
  const done = phases.reduce((acc, p) => acc + p.milestones.filter(m => m.done).length, 0);
  const progressPercent = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Startup Roadmap</h1>
          <p className="text-gray-500 mt-1">Track your startup journey from idea to funded company.</p>
        </div>
        <button onClick={handleAddMilestone} className="flex items-center px-4 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl shadow text-sm transition-colors">
          <Plus size={16} className="mr-2" /> Add Milestone
        </button>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-bold text-gray-700">Overall Progress</p>
          <p className="text-sm font-bold text-[#5B21B6]">{progressPercent}%</p>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-3 rounded-full bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="flex justify-between mt-3 text-xs text-gray-400 font-medium">
          <span>Idea</span><span>MVP</span><span>Launch</span><span>Growth</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {phases.map((p, idx) => {
          const done = p.milestones.filter(m => m.done).length;
          const total = p.milestones.length;
          return (
            <div
              key={p.id}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all cursor-pointer ${activePhase === p.id ? 'border-[#5B21B6]/40 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}
              onClick={() => setActivePhase(activePhase === p.id ? 0 : p.id)}
            >
              <div className="flex items-center p-5 gap-4">
                {/* Connector line */}
                <div className="relative flex flex-col items-center flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${statusColors[p.status]} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                    {p.status === 'completed' ? <CheckCircle2 size={20} /> : idx + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{p.phase}</p>
                  <h3 className="text-base font-bold text-gray-900">{p.title}</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-bold text-gray-900">{done}/{total}</p>
                    <p className="text-xs text-gray-400">milestones</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    p.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                    p.status === 'in-progress' ? 'bg-purple-50 text-[#5B21B6]' :
                    'bg-gray-100 text-gray-500'
                  }`}>{statusLabels[p.status]}</span>
                  <ChevronRight size={18} className={`text-gray-400 transition-transform ${activePhase === p.id ? 'rotate-90' : ''}`} />
                </div>
              </div>

              {activePhase === p.id && (
                <div className="border-t border-gray-100 p-5 bg-gray-50/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {p.milestones.map((m, mi) => (
                      <div 
                        key={mi} 
                        onClick={() => toggleMilestone(p.id, mi)}
                        className={`flex items-center gap-3 p-3 rounded-xl bg-white border cursor-pointer hover:shadow-sm transition-all ${m.done ? 'border-emerald-100' : 'border-gray-100 hover:border-[#5B21B6]/30'}`}
                      >
                        {m.done
                          ? <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                          : <Circle size={18} className="text-gray-300 flex-shrink-0" />
                        }
                        <span className={`text-sm font-medium ${m.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{m.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FounderRoadmap;
