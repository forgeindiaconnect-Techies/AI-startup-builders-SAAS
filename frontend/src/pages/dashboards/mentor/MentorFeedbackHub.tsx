import React, { useState } from 'react';
import { CheckSquare, ThumbsUp } from 'lucide-react';
import MentorFeedback from './MentorFeedback';
import MentorRatings from './MentorRatings';

const tabs = [
  { id: 'given', label: 'Feedback Given', icon: CheckSquare, component: MentorFeedback },
  { id: 'ratings', label: 'Reviews & Ratings', icon: ThumbsUp, component: MentorRatings },
];

const MentorFeedbackHub: React.FC = () => {
  const [active, setActive] = useState('given');
  const ActiveComponent = tabs.find(t => t.id === active)!.component;

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Feedback & Reviews</h1>
        <p className="text-gray-500 mt-1">Review feedback you have shared with startups and see your reviews and ratings.</p>
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

      <ActiveComponent />
    </div>
  );
};

export default MentorFeedbackHub;
