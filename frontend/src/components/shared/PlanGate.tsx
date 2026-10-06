import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';

export type PlanName = 'free_trial' | 'pro' | 'premium_startup_builder' | 'none';

export const usePlanAccess = () => {
  const { user } = useAuth();
  const plan: PlanName = (user?.plan as PlanName) || 'none';
  return {
    plan,
    canAccess: (requiredPlans: string[]) => requiredPlans.includes(plan),
  };
};

interface PlanGateProps {
  requiredPlans: string[];
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const PlanGate: React.FC<PlanGateProps> = ({
  requiredPlans,
  children,
  title = 'Upgrade to unlock this feature',
  description = 'This feature is included in the Pro Plan or above. Upgrade your plan to continue using it.',
}) => {
  const { canAccess } = usePlanAccess();
  const navigate = useNavigate();

  if (canAccess(requiredPlans)) return <>{children}</>;

  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 animate-fade-in-up">
      <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-5 ring-4 ring-purple-100">
        <Lock size={28} className="text-[#5B21B6]" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-sm text-gray-500 mb-6 max-w-md leading-relaxed">{description}</p>
      <button
        onClick={() => navigate('/dashboard/founder/billing')}
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl transition-colors shadow-md shadow-purple-500/20"
      >
        <Sparkles size={16} /> Upgrade Now <ArrowRight size={16} />
      </button>
    </div>
  );
};

export default PlanGate;
