import React, { useState, useEffect } from 'react';
import { Map, ListChecks } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import FounderRoadmap from './FounderRoadmap';
import FounderTasks from './FounderTasks';
import { getStartups, getStartupById, sanitizeStartupId } from '../../../utils/localStorageHelper';

const tabs = [
  { id: 'roadmap', label: 'Startup Roadmap', icon: Map, component: FounderRoadmap },
  { id: 'tasks', label: 'Tasks & Milestones', icon: ListChecks, component: FounderTasks },
];

const FounderRoadmapTasks: React.FC = () => {
  const [active, setActive] = useState('roadmap');
  const [startupData, setStartupData] = useState<any>(null);
  const [searchParams] = useSearchParams();
  const startupId = sanitizeStartupId(searchParams.get('startupId') || searchParams.get('id'));

  useEffect(() => {
    const fetchData = async () => {
      if (startupId) {
        setStartupData(await getStartupById(startupId));
      } else {
        const startups = await getStartups();
        const all = startups.filter((s: any) => s.status === 'generated');
        if (all.length > 0) {
          setStartupData(all[0]);
        }
      }
    };
    fetchData();
  }, [startupId]);

  const ActiveComponent = tabs.find(t => t.id === active)!.component;

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Roadmap & Tasks</h1>
        <p className="text-gray-500 mt-1">Plan your startup journey and track milestones.</p>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-7 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all duration-200 ${
              active === t.id ? 'bg-white text-[#5B21B6] shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      <ActiveComponent startupData={startupData} setStartupData={setStartupData} />
    </div>
  );
};

export default FounderRoadmapTasks;
