import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import QRCode from 'qrcode';
import {
  Check, Zap, Crown, X, ArrowRight,
  Copy, CheckCircle2, Loader2, Clock, AlertTriangle, Shield
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { API_URL } from '../../../config/api';

// ── Plan Definitions ────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'free_trial',
    name: 'Free Trial',
    price: 0,
    annualPrice: 0,
    badge: 'Current',
    icon: Zap,
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    desc: '1 day to explore the platform fully.',
    features: [
      'Basic AI Startup Idea Generator',
      'Basic Business Plan',
      'Basic Pitch Deck',
      'Basic Market Research',
      'Limited AI Reports',
      'Limited Document Export',
      'Trial countdown display',
    ],
    buttonText: 'Current Plan',
    buttonStyle: 'bg-gray-100 text-gray-400 cursor-default',
    disabled: true,
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: 999,
    annualPrice: 9990,
    badge: 'Best Value',
    icon: Shield,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-700',
    desc: 'For serious founders scaling up.',
    features: [
      'Full AI Startup Idea Generator',
      'Detailed Business Plan Generator',
      'Detailed Pitch Deck Generator',
      'Full Market Research',
      'AI Reports',
      'Roadmap & Tasks',
      'Logo & Branding Suggestions',
      'PDF Export',
      'Word Export',
      'Mentor Request Access',
      'AI Chat Assistant',
      'Save Multiple Startup Ideas',
    ],
    buttonText: 'Upgrade to Pro',
    buttonStyle: 'bg-purple-700 hover:bg-purple-800 text-white shadow-lg shadow-purple-500/20',
    disabled: false,
  },
  {
    id: 'premium_startup_builder',
    name: 'Premium Startup Business Builder',
    price: 2999,
    annualPrice: 29990,
    badge: 'Most Popular',
    icon: Crown,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    desc: 'The complete funding accelerator.',
    features: [
      'Everything in Pro Plan',
      'Investor Marketplace Access',
      'AI Investor Matching',
      'Funding Readiness Score',
      'AI Due Diligence Report',
      'Advanced Pitch Deck',
      'ZIP Document Export',
      'Mentor Session Booking',
      'Investor Meeting Requests',
      'Funding Progress Tracking',
      'Priority Support',
      'Advanced Startup Growth Dashboard',
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

// ── Feature Comparison Table Data ─────────────────────────────────────────────
const FEATURES = [
  { name: 'AI Startup Idea Generator', free: 'Basic', pro: 'Full', premium: 'Full' },
  { name: 'Business Plan', free: 'Basic', pro: 'Detailed', premium: 'Detailed' },
  { name: 'Pitch Deck', free: 'Basic', pro: 'Detailed', premium: 'Advanced' },
  { name: 'Market Research', free: 'Basic', pro: 'Full', premium: 'Full' },
  { name: 'AI Reports', free: 'Limited', pro: 'Yes', premium: 'Advanced' },
  { name: 'Document Export', free: 'Limited', pro: 'PDF & Word', premium: 'ZIP Export' },
  { name: 'Mentor Request Access', free: false, pro: true, premium: true },
  { name: 'Roadmap & Tasks', free: false, pro: true, premium: true },
  { name: 'Logo & Branding', free: false, pro: true, premium: true },
  { name: 'AI Chat Assistant', free: false, pro: true, premium: true },
  { name: 'Save Multiple Ideas', free: false, pro: true, premium: true },
  { name: 'Investor Marketplace', free: false, pro: false, premium: true },
  { name: 'AI Investor Matching', free: false, pro: false, premium: true },
  { name: 'Funding Readiness Score', free: false, pro: false, premium: true },
  { name: 'AI Due Diligence Report', free: false, pro: false, premium: true },
  { name: 'Mentor Session Booking', free: false, pro: false, premium: true },
  { name: 'Investor Meeting Requests', free: false, pro: false, premium: true },
  { name: 'Funding Progress Tracking', free: false, pro: false, premium: true },
  { name: 'Priority Support', free: false, pro: false, premium: true },
  { name: 'Advanced Startup Dashboard', free: false, pro: false, premium: true },
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
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'bank'>('upi');
  const [selectedPaymentApp, setSelectedPaymentApp] = useState<string>('UPI');
  const [senderBankName, setSenderBankName] = useState('');
  const [senderAccountName, setSenderAccountName] = useState('');
  const [copiedField, setCopiedField] = useState<string>('');
  const [transactionId, setTransactionId] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [expiredBanner, setExpiredBanner] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

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

  const [selectedPlanId, setSelectedPlanId] = useState<string>('premium_startup_builder');
  const currentPlanName: string = user?.plan || 'none';
  const currentStatus: string = user?.subscriptionStatus || 'none';

  const handleUpgradeClick = (plan: typeof PLANS[0], e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedPlanId(plan.id);
    if (plan.disabled || currentPlanName === plan.id) return;
    setTargetPlan(plan);
    setTransactionId('');
    setSenderBankName('');
    setSenderAccountName('');
    setSubmitSuccess(false);
    setSubmitError('');
    setIsModalOpen(true);
  };

  // Generate the UPI QR code locally (no external service needed)
  useEffect(() => {
    if (!isModalOpen || !targetPlan) return;
    let active = true;
    const amount = billingPeriod === 'annual' ? targetPlan.annualPrice : targetPlan.price;
    const upiUrl = `upi://pay?pa=aistartupbuilder@okaxis&pn=${encodeURIComponent('AI Startup Builders')}&am=${amount}&cu=INR&tn=${encodeURIComponent(targetPlan.name + ' Plan Upgrade')}`;
    QRCode.toDataURL(upiUrl, { width: 240, margin: 2, color: { dark: '#4C1D95', light: '#FFFFFF' } })
      .then((url) => { if (active) setQrDataUrl(url); })
      .catch(() => { if (active) setQrDataUrl(''); });
    return () => { active = false; };
  }, [isModalOpen, targetPlan, billingPeriod]);

  const handleCopyUPI = () => {
    navigator.clipboard.writeText('aistartupbuilder@okaxis');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyField = (value: string, key: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(key);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleSubmitPayment = async () => {
    const utr = transactionId.trim();
    if (!utr) {
      setSubmitError('Please enter your Transaction ID / UTR Number.');
      return;
    }
    if (utr.length < 8 || utr.length > 22) {
      setSubmitError('Please enter a valid Transaction ID / UTR Number (must be between 8 and 22 alphanumeric characters).');
      return;
    }
    if (paymentMethod === 'bank') {
      if (!senderBankName.trim() || !senderAccountName.trim()) {
        setSubmitError('Please enter your Bank Name and Account Holder Name.');
        return;
      }
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
          amount: billingPeriod === 'annual' ? targetPlan.annualPrice : targetPlan.price,
          billingPeriod,
          paymentMethod: paymentMethod === 'bank' ? 'Bank Transfer' : selectedPaymentApp,
          transactionId: paymentMethod === 'bank' 
            ? `UTR: ${transactionId.trim()} | Bank: ${senderBankName.trim()} | Holder: ${senderAccountName.trim()}`
            : transactionId.trim(),
          screenshot: 'no_screenshot',
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
    premium_startup_builder: 'Premium Startup Business Builder',
    none: 'No Active Plan',
  };
  return (
    <div className="animate-fade-in-up pb-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-['Poppins'] text-2xl font-bold text-[#1F2937]">Subscription & Billing</h1>
        <p className="text-[#6B7280] mt-1">Manage your plan, upgrade, and payment history.</p>
      </div>

      {/* Expired Banner — shows whenever trial date is past or status says expired */}
      {(expiredBanner || currentStatus === 'expired' || (user?.trialEndDate && new Date(user.trialEndDate) < new Date() && !['pro', 'premium_startup_builder'].includes(currentPlanName))) && currentStatus !== 'pending_verification' && (
        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl animate-fade-in-up">
          <AlertTriangle size={22} className="shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-base">🔒 Your free trial has expired.</p>
            <p className="text-sm mt-1">To restore full access to AI features, please choose a subscription plan below and complete payment. Your access will be re-activated once the admin verifies your payment.</p>
          </div>
        </div>
      )}


      {/* Payment Pending Verification Banner */}
      {currentStatus === 'pending_verification' && (
        <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-300 text-amber-800 px-5 py-4 rounded-2xl">
          <Clock size={20} className="shrink-0 mt-0.5 text-amber-600" />
          <div>
            <p className="font-bold">Payment submitted — Awaiting admin approval.</p>
            <p className="text-sm mt-0.5">Your payment proof has been received. Our admin team will verify and activate your plan within 24 hours. You will receive full access once approved.</p>
          </div>
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

      {/* Billing Period Toggle */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-4 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${billingPeriod === 'monthly' ? 'bg-[#5B21B6] text-white shadow-md shadow-purple-500/20' : 'text-[#6B7280] hover:text-[#1F2937]'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('annual')}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${billingPeriod === 'annual' ? 'bg-[#5B21B6] text-white shadow-md shadow-purple-500/20' : 'text-[#6B7280] hover:text-[#1F2937]'}`}
          >
            Annual
          </button>
        </div>
        <span className="ml-4 text-xs font-medium text-[#10B981] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Save up to 17% with Annual Billing (2 months free)
        </span>
      </div>

      {/* Plan Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {PLANS.map((plan) => {
          const isCurrent = currentPlanName === plan.id;
          const isSelected = selectedPlanId === plan.id;
          const Icon = plan.icon;
          return (
            <div
              key={plan.id}
              onClick={(e) => handleUpgradeClick(plan, e)}
              className={`group relative bg-white rounded-[20px] flex flex-col transition-all duration-200 cursor-pointer select-none ${
                isSelected || isCurrent
                  ? 'border-2 border-purple-600 shadow-xl shadow-purple-500/15 ring-2 ring-purple-500/20'
                  : 'border border-gray-200 shadow-sm hover:border-purple-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-full tracking-wider shadow-sm text-center whitespace-nowrap">
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
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-[#1F2937]">₹{(billingPeriod === 'annual' ? plan.annualPrice : plan.price).toLocaleString('en-IN')}</span>
                        <span className="text-sm text-[#6B7280] font-medium">{billingPeriod === 'annual' ? '/year' : '/month'}</span>
                      </div>
                      {billingPeriod === 'annual' && (
                        <div className="text-xs text-[#10B981] font-medium mt-1">
                          ₹{plan.price.toLocaleString('en-IN')}/mo billed annually • Save {Math.round((1 - plan.annualPrice / (plan.price * 12)) * 100)}%
                        </div>
                      )}
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
                  type="button"
                  onClick={(e) => handleUpgradeClick(plan, e)}
                  disabled={plan.disabled || isCurrent}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 focus:outline-none ${
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

      {/* Feature Comparison Table */}
      <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 overflow-hidden mb-10">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-bold text-[#1F2937]">Compare Plan Features</h3>
          <p className="text-sm text-[#6B7280] mt-1">Detailed comparison of what's included in each plan.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase text-xs font-bold">
              <tr>
                <th className="px-6 py-4">Feature</th>
                <th className="px-6 py-4 text-center">Free Trial</th>
                <th className="px-6 py-4 text-center text-purple-700">Pro</th>
                <th className="px-6 py-4 text-center text-amber-600">Premium Builder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {FEATURES.map((feature, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{feature.name}</td>
                  
                  {/* Free Trial Column */}
                  <td className="px-6 py-4 text-center text-gray-600">
                    {typeof feature.free === 'boolean' ? (
                      feature.free ? <Check size={18} className="mx-auto text-emerald-500" /> : <span className="text-gray-300">-</span>
                    ) : (
                      feature.free
                    )}
                  </td>
                  
                  {/* Pro Column */}
                  <td className="px-6 py-4 text-center text-purple-700 font-medium">
                    {typeof feature.pro === 'boolean' ? (
                      feature.pro ? <Check size={18} className="mx-auto text-purple-600" /> : <span className="text-gray-300">-</span>
                    ) : (
                      feature.pro
                    )}
                  </td>
                  
                  {/* Premium Column */}
                  <td className="px-6 py-4 text-center text-amber-600 font-medium">
                    {typeof feature.premium === 'boolean' ? (
                      feature.premium ? <Check size={18} className="mx-auto text-amber-500" /> : <span className="text-gray-300">-</span>
                    ) : (
                      feature.premium
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
                      <p className="text-2xl font-black text-purple-700">₹{(billingPeriod === 'annual' ? targetPlan.annualPrice : targetPlan.price).toLocaleString('en-IN')}</p>
                      <p className="text-xs text-purple-500 font-semibold">{billingPeriod === 'annual' ? 'per year' : 'per month'}</p>
                    </div>
                  </div>

                  {/* Payment Method Tab Switcher */}
                  <div className="flex gap-2 mb-5 p-1 bg-gray-100 rounded-xl">
                    <button
                      onClick={() => setPaymentMethod('upi')}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                        paymentMethod === 'upi'
                          ? 'bg-white text-purple-700 shadow-sm border border-purple-100'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      📱 UPI / QR Pay
                    </button>
                    <button
                      onClick={() => setPaymentMethod('bank')}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                        paymentMethod === 'bank'
                          ? 'bg-white text-purple-700 shadow-sm border border-purple-100'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      🏦 Bank Transfer
                    </button>
                  </div>

                  {paymentMethod === 'upi' ? (
                  <>
                  {/* UPI Details */}
                  <div className="text-center mb-5">
                    <p className="text-sm font-bold text-[#1F2937] mb-1">Scan & Pay via UPI</p>
                    <p className="text-xs text-gray-500 mb-3">Scan with GPay, PhonePe, Paytm or any UPI app</p>
                    
                    {(() => {
                      const amount = billingPeriod === 'annual' ? targetPlan.annualPrice : targetPlan.price;
                      const upiUrl = `upi://pay?pa=aistartupbuilder@okaxis&pn=AI%20Startup%20Builders&am=${amount}&cu=INR&tn=${encodeURIComponent(targetPlan.name + ' Plan Upgrade')}`;

                      return (
                        <div className="flex flex-col items-center">
                          <div className="w-44 h-44 bg-white border-2 border-purple-200 rounded-2xl mx-auto flex items-center justify-center p-2.5 shadow-sm hover:shadow-md transition-shadow relative mb-3 group">
                            {qrDataUrl ? (
                              <img
                                src={qrDataUrl}
                                alt="UPI Payment QR Code"
                                className="w-full h-full object-contain rounded-xl"
                              />
                            ) : (
                              <Loader2 size={24} className="animate-spin text-purple-600" />
                            )}
                            <a
                              href={upiUrl}
                              className="absolute inset-0 bg-purple-950/85 rounded-xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity font-bold text-xs p-2 text-center"
                            >
                              <span>📱 Tap to Pay on Mobile</span>
                              <span className="text-[10px] text-purple-200 font-normal mt-1">Amount: ₹{amount.toLocaleString('en-IN')}</span>
                            </a>
                          </div>
                          
                          <a
                            href={upiUrl}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors mb-3"
                          >
                            <span>⚡ Open UPI App Directly</span>
                          </a>
                        </div>
                      );
                    })()}

                    <div className="flex items-center justify-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-600">UPI ID:</span>
                      <code className="text-sm font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-100 select-all">aistartupbuilder@okaxis</code>
                      <button onClick={handleCopyUPI} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-500" title="Copy UPI ID">
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
                          onClick={() => {
                            setPaymentMethod('upi');
                            setSelectedPaymentApp(app.id);
                          }}
                          type="button"
                          className={`py-2 px-3 rounded-xl border text-sm font-bold flex items-center gap-2 transition-all ${
                            paymentMethod === 'upi' && selectedPaymentApp === app.id
                              ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-sm'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <span>{app.emoji}</span> {app.name}
                        </button>
                      ))}
                      
                      {/* Manually Enter Bank Details Option */}
                      <button
                        onClick={() => {
                          setPaymentMethod('bank');
                        }}
                        type="button"
                        className="col-span-2 py-2.5 px-3 rounded-xl border border-dashed border-purple-200 bg-purple-50/10 hover:bg-purple-50/40 text-purple-700 text-sm font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        🏦 Manually enter bank details
                      </button>
                    </div>
                  </div>
                  </> ) : (
                  <>
                  {/* Bank Transfer Details */}
                  <div className="mb-5">
                    <p className="text-sm font-bold text-[#1F2937] mb-3 text-center">Transfer to our Bank Account</p>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 space-y-3">
                      {[
                        { label: 'Account Name',    value: 'AI Startup Builders Pvt Ltd',  key: 'name' },
                        { label: 'Account Number',  value: '9876543210123456',              key: 'acct' },
                        { label: 'IFSC Code',       value: 'AXIS0001234',                   key: 'ifsc' },
                        { label: 'Bank Name',       value: 'Axis Bank',                     key: 'bank' },
                        { label: 'Branch',          value: 'Chennai Main Branch',           key: 'branch' },
                        { label: 'Account Type',    value: 'Current Account',              key: 'type' },
                      ].map(({ label, value, key }) => (
                        <div key={key} className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">{label}</p>
                            <p className="text-sm font-bold text-gray-800 truncate">{value}</p>
                          </div>
                          <button
                            onClick={() => handleCopyField(value, key)}
                            className="flex-shrink-0 p-1.5 bg-white hover:bg-blue-100 border border-blue-100 rounded-lg transition-colors text-blue-500"
                            title={`Copy ${label}`}
                          >
                            {copiedField === key ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Copy size={13} />}
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2.5 text-center">⚠️ Please use your registered email as payment reference/narration</p>
                    
                    {/* Sender Bank details inputs */}
                    <div className="space-y-3 mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Bank Details (For verification)</p>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Your Bank Name <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            value={senderBankName}
                            onChange={(e) => setSenderBankName(e.target.value)}
                            placeholder="e.g. HDFC Bank"
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Account Holder Name <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            value={senderAccountName}
                            onChange={(e) => setSenderAccountName(e.target.value)}
                            placeholder="e.g. Renu"
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  </> )}

                  {/* Transaction / Reference ID */}
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      {paymentMethod === 'bank' ? 'Bank Reference / UTR Number' : 'Transaction ID / UTR Number'}
                      <span className="text-red-500"> *</span>
                    </label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={e => setTransactionId(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 22))}
                      placeholder={paymentMethod === 'bank' ? 'e.g. NEFT/IMPS reference number' : 'e.g. 421987654321'}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                    />
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
