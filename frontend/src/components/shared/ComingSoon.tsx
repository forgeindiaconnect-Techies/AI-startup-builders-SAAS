import React from 'react';
import { Rocket, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ComingSoonProps {
  title?: string;
  description?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title = 'Coming Soon', description = 'This feature is currently being built. Check back soon!' }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 animate-fade-in-up">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-[#5B21B6] rounded-full opacity-20 blur-2xl scale-150"></div>
        <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] flex items-center justify-center shadow-2xl shadow-purple-500/30">
          <Rocket size={44} className="text-white" />
        </div>
      </div>

      <h1 className="text-3xl font-extrabold text-gray-900 mb-3">{title}</h1>
      <p className="text-gray-500 max-w-md mb-8 leading-relaxed">{description}</p>

      <div className="flex items-center gap-3 px-6 py-3 bg-purple-50 border border-purple-100 rounded-full text-sm font-medium text-[#5B21B6]">
        <span className="inline-block w-2 h-2 rounded-full bg-[#5B21B6] animate-pulse"></span>
        Our team is actively building this feature
      </div>

      <button
        onClick={() => navigate(-1)}
        className="mt-10 flex items-center text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft size={16} className="mr-2" />
        Go Back
      </button>
    </div>
  );
};

export default ComingSoon;
