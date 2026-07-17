import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Check, Zap, Crown, X, ArrowRight,
  Copy, CheckCircle2, UploadCloud, Loader2, Clock, AlertTriangle, Shield
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { API_URL } from '../../../config/api';

// ── Plan Definitions ────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'free_trial',
    name: 'Free Trial',
    price: 0,
    badge: 'Current',
    icon: Zap,
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    desc: '1 day to explore the platform fully.',
    features: [
      'Basic AI idea generation',
      'Basic business plan',
      'Basic pitch deck',
      'Limited AI reports',
      'Limited document export',
    ],
    buttonText: 'Current Plan',
    buttonStyle: 'bg-gray-100 text-gray-400 cursor-default',
    disabled: true,
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: 999,
    badge: 'Best Value',
    icon: Shield,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-700',
    desc: 'For serious founders scaling up.',
    features: [
      'Full AI Startup Builder',
      'Business Plan Generator',
      'Pitch Deck Generator',
      'Market Research',
      'AI Reports (unlimited)',
      'Roadmap & Tasks',
      'Logo & Branding Suggestions',
      'PDF and Word export',
      'Mentor request access',
    ],
    buttonText: 'Upgrade to Pro',
    buttonStyle: 'bg-purple-700 hover:bg-purple-800 text-white shadow-lg shadow-purple-500/20',
    disabled: false,
  },
  {
    id: 'premium_startup_builder',
    name: 'Premium Startup Builder',
    price: 2999,
    badge: 'Most Popular',
    icon: Crown,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    desc: 'The complete funding accelerator.',
    features: [
      'Everything in Pro',
      'Investor Marketplace access',
      'Funding Readiness Score',
      'AI Due Diligence Report',
      'Investor Matching',
      'Advanced Pitch Deck',
      'ZIP document export',
      'Mentor session booking',
      'Priority support',
    ],
    buttonText: 'Upgrade to Premium',
    buttonStyle: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25',
    disabled: false,
    popular: true,
  },
];

const PAYMENT_APPS = [
  { id: 'UPI', name: 'UPI', emoji: '🏦' },
  { id: 'Google Pay', name: 'Google Pay', emoji: '📱' },
  { id: 'PhonePe', name: 'PhonePe', emoji: '💜' },
  { id: 'Paytm', name: 'Paytm', emoji: '💙' },
];

// ── Helper: Time remaining ──────────────────────────────────────────────────────
const getTimeRemaining = (endDate: string) => {
  const now = Date.now();
  const end = new Date(endDate).getTime();
  const diff = end - now;
  if (diff <= 0) return null;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

// ── Main Component ──────────────────────────────────────────────────────────────
const FounderBilling: React.FC = () => {
  const { user, getToken, checkAuth } = useAuth();
  const location = useLocation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetPlan, setTargetPlan] = useState<typeof PLANS[0] | null>(null);
  const [paymentApp, setPaymentApp] = useState('UPI');
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [expiredBanner, setExpiredBanner] = useState(false);

  // Check expiry redirect state
  useEffect(() => {
    if ((location.state as any)?.expired) {
      setExpiredBanner(true);
    }
  }, [location.state]);

  // Live countdown timer
  useEffect(() => {
    if (!user?.trialEndDate) return;
    const update = () => setTimeRemaining(getTimeRemaining(user.trialEndDate));
    update();
    const interval = setInterval(update, 60 * 1000);
    return () => clearInterval(interval);
  }, [user?.trialEndDate]);

  const currentPlanName: string = user?.plan || 'none';
  const currentStatus: string = user?.subscriptionStatus || 'none';

  const handleUpgradeClick = (plan: typeof PLANS[0]) => {
    if (plan.disabled || currentPlanName === plan.id) return;
    setTargetPlan(plan);
    setTransactionId('');
    setScreenshot('');
    setSubmitSuccess(false);
    setSubmitError('');
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setScreenshot(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText('aistartupbuilder@okaxis');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitPayment = async () => {
    if (!transactionId.trim()) {
      setSubmitError('Please enter your Transaction ID / UTR Number.');
      return;
    }
    if (!screenshot) {
      setSubmitError('Please upload a payment screenshot.');
      return;
    }
    if (!targetPlan || !user) return;

    setIsSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch(`${API_URL}/payments/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          planName: targetPlan.id,
          amount: targetPlan.price,
          paymentMethod: paymentApp,
          transactionId: transactionId.trim(),
          screenshot,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
        await checkAuth(); // refresh user context
      } else {
        setSubmitError(data.error || 'Submission failed. Please try again.');
      }
    } catch {
      setSubmitError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const planLabel: Record<string, string> = {
    free_trial: 'Free Trial',
    pro: 'Pro Plan',
    premium_startup_builder: 'Premium Startup Builder',
    none: 'No Active Plan',
  };
  return (
    <div className="animate-fade-in-up pb-10">
      <div className="mb-8">
        <h1 className="font-['Poppins'] text-2xl font-bold text-[#1F2937]">Subscription & Billing</h1>
        <p className="text-[#6B7280] mt-1">Manage your plan, upgrade, and payment history.</p>
      </div>

      {/* Expired Banner */}
      {expiredBanner && (
        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl">
          <AlertTriangle size={20} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Your free trial has expired.</p>
            <p className="text-sm mt-0.5">Please choose a plan below to continue using all AI features.</p>
          </div>
          <button onClick={() => setExpiredBanner(false)} className="ml-auto text-red-400 hover:text-red-600">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Current Plan Banner */}
      <div className="bg-gradient-to-r from-[#4C1D95] to-[#6D28D9] rounded-[20px] p-6 text-white mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-[40%] h-[200%] bg-white/5 rotate-12 pointer-events-none" />
        <div className="relative z-10">
          <p className="text-sm font-bold text-white/60 uppercase tracking-wider mb-1 flex items-center gap-2">
            Current Plan
            {currentStatus === 'active' && currentPlanName === 'free_trial' && (
              <span className="bg-amber-400 text-gray-900 text-[10px] px-2 py-0.5 rounded-full font-bold">TRIAL ACTIVE</span>
            )}
            {currentStatus === 'expired' && (
              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">EXPIRED</span>
            )}
            {currentStatus === 'pending_verification' && (
              <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">PAYMENT PENDING REVIEW</span>
            )}
          </p>
          <p className="text-2xl font-extrabold">{planLabel[currentPlanName] || 'No Active Plan'}</p>

          {currentPlanName === 'free_trial' && timeRemaining && currentStatus === 'active' && (
            <p className="text-sm text-white/80 mt-1 flex items-center gap-1.5">
              <Clock size={14} /> Trial ends in: <strong>{timeRemaining}</strong>
            </p>
          )}
          {currentStatus === 'expired' && (
            <p className="text-sm text-white/70 mt-1">Your trial has expired. Upgrade to continue.</p>
          )}
          {(currentStatus === 'active' && currentPlanName !== 'free_trial') && user?.trialEndDate && (
            <p className="text-sm text-white/70 mt-1">
              Renews on: {new Date(new Date(user.trialEndDate).setMonth(new Date(user.trialEndDate).getMonth() + 1)).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          )}
        </div>
        {currentStatus !== 'pending_verification' && (
          <div className="relative z-10">
            <button
              onClick={() => handleUpgradeClick(PLANS.find(p => p.id === 'premium_startup_builder')!)}
              disabled={currentPlanName === 'premium_startup_builder'}
              className="px-4 py-2.5 bg-[#FBBF24] hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-default text-gray-900 font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-yellow-500/20"
            >
              Upgrade Now ↗
            </button>
          </div>
        )}
      </div>

      {/* Plan Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {PLANS.map((plan) => {
          const isCurrent = currentPlanName === plan.id;
          const Icon = plan.icon;
          return (
            <div
              key={plan.id}
              className={`group relative bg-white rounded-[20px] flex flex-col transition-all duration-300 ${
                plan.popular
                  ? 'border-2 border-amber-400 shadow-xl shadow-amber-500/10'
                  : 'border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1'
              } ${isCurrent ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-full tracking-wider shadow-sm">
                  MOST POPULAR
                </div>
              )}
              {!plan.popular && (
                <div className={`absolute top-4 right-4 text-[10px] font-bold px-3 py-1 rounded-full ${isCurrent ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                  {isCurrent ? 'Current' : plan.badge}
                </div>
              )}

              <div className="p-7 pt-10 flex flex-col flex-1">
                <div className={`w-12 h-12 rounded-xl ${plan.iconBg} ${plan.iconColor} flex items-center justify-center mb-4`}>
                  <Icon size={24} />
                </div>
                <h4 className="font-['Poppins'] text-lg font-bold text-[#1F2937] mb-1">{plan.name}</h4>
                <p className="text-xs text-[#6B7280] mb-4">{plan.desc}</p>

                <div className="mb-5">
                  {plan.price === 0 ? (
                    <div className="text-3xl font-black text-[#1F2937]">₹0 <span className="text-base font-medium text-gray-400">/ 1 day</span></div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-[#1F2937]">₹{plan.price.toLocaleString('en-IN')}</span>
                      <span className="text-sm text-[#6B7280] font-medium">/month</span>
                    </div>
                  )}
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start text-sm text-[#4B5563] gap-2">
                      <Check size={15} className={`shrink-0 mt-0.5 ${plan.popular ? 'text-amber-500' : 'text-emerald-500'}`} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgradeClick(plan)}
                  disabled={plan.disabled || isCurrent}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    isCurrent
                      ? 'bg-gray-100 text-gray-400 cursor-default'
                      : plan.buttonStyle
                  }`}
                >
                  {isCurrent ? '✓ Current Plan' : plan.buttonText}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Modal */}
      {isModalOpen && targetPlan && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md my-8 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-[#1F2937] text-lg">Complete Upgrade Payment</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {submitSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} className="text-emerald-600" />
                  </div>
                  <h4 className="text-xl font-bold text-[#1F2937] mb-2">Payment Submitted!</h4>
                  <p className="text-[#6B7280] text-sm">Your payment is being verified by our admin team. Your plan will be activated within 24 hours.</p>
                  <button onClick={() => setIsModalOpen(false)} className="mt-6 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition-colors">
                    Close
                  </button>
                </div>
              ) : (
                <>
                  {/* Plan Summary */}
                  <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 mb-5 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-0.5">Upgrading to</p>
                      <p className="text-lg font-extrabold text-[#1F2937]">{targetPlan.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-purple-700">₹{targetPlan.price.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-purple-500 font-semibold">per month</p>
                    </div>
                  </div>

                  {/* UPI Details */}
                  <div className="text-center mb-5">
                    <p className="text-sm font-bold text-[#1F2937] mb-3">Pay via UPI</p>
                    <div className="w-44 h-44 bg-gray-50 border-2 border-dashed border-purple-200 rounded-2xl mx-auto flex items-center justify-center mb-3">
                      <div className="text-center">
                        <div className="text-4xl mb-2">📲</div>
                        <p className="text-xs text-gray-500 font-medium">QR Code</p>
                        <p className="text-[10px] text-gray-400">(Coming Soon)</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-600">UPI ID:</span>
                      <code className="text-sm font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg">aistartupbuilder@okaxis</code>
                      <button onClick={handleCopyUPI} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-500">
                        {copied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Payment App Selector */}
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Payment App Used</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PAYMENT_APPS.map(app => (
                        <button
                          key={app.id}
                          onClick={() => setPaymentApp(app.id)}
                          className={`py-2 px-3 rounded-xl border text-sm font-bold flex items-center gap-2 transition-all ${
                            paymentApp === app.id
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <span>{app.emoji}</span> {app.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Transaction ID */}
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Transaction ID / UTR Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={e => setTransactionId(e.target.value)}
                      placeholder="e.g. 421987654321"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                    />
                  </div>

                  {/* Screenshot Upload */}
                  <div className="mb-5">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Payment Screenshot <span className="text-red-500">*</span>
                    </label>
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center py-4">
                        {screenshot ? (
                          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                            <CheckCircle2 size={20} /> Screenshot Attached
                          </div>
                        ) : (
                          <>
                            <UploadCloud className="w-6 h-6 mb-1 text-gray-400" />
                            <p className="text-xs text-gray-500 font-medium">Click to upload payment screenshot</p>
                          </>
                        )}
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                  </div>

                  {submitError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium flex items-center gap-2">
                      <AlertTriangle size={16} /> {submitError}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl font-semibold text-sm text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors">
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitPayment}
                      disabled={isSubmitting}
                      className="flex-1 py-3 rounded-xl font-semibold text-sm bg-purple-600 hover:bg-purple-700 text-white shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                    >
                      {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <>Submit Proof <ArrowRight size={16} /></>}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FounderBilling;
