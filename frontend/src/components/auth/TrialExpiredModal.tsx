import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TrialExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TrialExpiredModal: React.FC<TrialExpiredModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubscribe = () => {
    onClose();
    navigate('/dashboard/founder/billing', { replace: true });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5 ring-4 ring-red-100">
            <AlertTriangle size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">Free Trial Expired</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Your <strong>1-Day Free Trial</strong> has ended. To continue using AI Startup Builder's premium features, please subscribe to a plan.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">What you'll unlock:</p>
            <ul className="space-y-1.5">
              {['Full AI Business Plan Generator', 'Premium Pitch Deck Builder', 'Advanced Market Research', 'Priority Support & Mentors'].map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-amber-800 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleSubscribe}
            className="w-full h-12 text-sm font-bold rounded-xl shadow-lg shadow-[#6C4CF1]/20 bg-gradient-to-r from-[#6C4CF1] to-[#5B21B6] text-white hover:from-[#5B21B6] hover:to-[#4C1D95] transition-all flex items-center justify-center gap-2"
          >
            Subscribe Now <ArrowRight size={16} />
          </button>

          <button
            onClick={onClose}
            className="mt-3 text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrialExpiredModal;
