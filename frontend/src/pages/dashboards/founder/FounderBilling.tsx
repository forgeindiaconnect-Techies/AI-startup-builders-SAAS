import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Shield, Zap, Star, Crown, CreditCard, X, ArrowRight, Copy, CheckCircle2, UploadCloud, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useBilling } from '../../../context/BillingContext';

const plans = [
  {
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    badge: 'Free Forever',
    badgeColor: 'bg-gray-100 text-gray-600',
    icon: Zap,
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    desc: 'Perfect for exploring the platform.',
    buttonText: 'Get Started',
    buttonStyle: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    popular: false,
    features: [
      '1 Startup Idea',
      '5 AI Reports per Month',
      'Basic Business Plan',
      'Basic SWOT Analysis',
      'Basic Startup Roadmap',
      'Community Support'
    ]
  },
  {
    name: 'Silver',
    price: { monthly: 799, annual: 7999 },
    badge: 'Best Value',
    badgeColor: 'bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] text-white',
    icon: Shield,
    iconBg: 'bg-purple-100',
    iconColor: 'text-[#5B21B6]',
    desc: 'For serious founders scaling up.',
    buttonText: 'Upgrade',
    buttonStyle: 'bg-[#5B21B6] text-white hover:bg-[#7C3AED] shadow-lg shadow-purple-500/20',
    popular: false,
    features: [
      '5 Startup Ideas',
      'Unlimited AI Reports',
      'Business Plan Generator',
      'SWOT Analysis',
      'Market Research',
      'Competitor Analysis',
      'AI Logo Suggestions',
      'Email Support'
    ]
  },
  {
    name: 'Gold',
    price: { monthly: 1999, annual: 19999 },
    badge: 'Most Popular',
    badgeColor: 'bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-[#111827]',
    icon: Crown,
    iconBg: 'bg-amber-100',
    iconColor: 'text-[#F59E0B]',
    desc: 'The complete funding accelerator.',
    buttonText: 'Upgrade Now',
    buttonStyle: 'bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-[#111827] hover:from-[#FDE68A] hover:to-[#FBBF24] shadow-lg shadow-amber-500/30',
    popular: true,
    features: [
      'Everything in Silver',
      'Unlimited Startup Ideas',
      'AI Pitch Deck Generator',
      'Financial Forecasting',
      'Revenue Model Suggestions',
      'Marketing Strategy Generator',
      'Mentor Reviews',
      'Investor Visibility',
      'Priority Support'
    ]
  },
  {
    name: 'Platinum',
    price: { monthly: 4999, annual: 49999 },
    badge: 'Premium',
    badgeColor: 'bg-gradient-to-r from-[#111827] to-gray-800 text-white',
    icon: Star,
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-700',
    desc: 'For power teams and enterprises.',
    buttonText: 'Contact Sales',
    buttonStyle: 'bg-[#111827] text-white hover:bg-gray-800 shadow-lg shadow-gray-900/20',
    popular: false,
    features: [
      'Everything in Gold',
      'Unlimited AI Credits',
      'Unlimited Mentor Reviews',
      'Direct Investor Access',
      'Team Collaboration',
      'White-label Branding',
      'API Access',
      'Dedicated Account Manager',
      'Advanced Analytics',
      'Premium Support'
    ]
  }
];

const paymentApps = [
  { id: 'Google Pay', name: 'GPay', color: 'bg-blue-500' },
  { id: 'Paytm', name: 'Paytm', color: 'bg-[#00BAF2]' },
  { id: 'PhonePe', name: 'PhonePe', color: 'bg-[#5f259f]' },
  { id: 'UPI', name: 'UPI', color: 'bg-gray-800' },
];

const FounderBilling: React.FC = () => {
  const { user } = useAuth();
  const { getUserSubscription, getUserTransactions, getUserPaymentRequests, submitManualPaymentRequest, activatePlan } = useBilling();
  const navigate = useNavigate();

  const [isAnnual, setIsAnnual] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetPlan, setTargetPlan] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const [paymentApp, setPaymentApp] = useState('Google Pay');
  const [referenceId, setReferenceId] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [screenshot, setScreenshot] = useState('');

  const [copied, setCopied] = useState(false);

  const currentSub = user ? getUserSubscription(user.id) : undefined;
  const transactions = user ? getUserTransactions(user.id) : [];
  const paymentRequests = user ? getUserPaymentRequests(user.id) : [];

  const formatPrice = (price: number) => {
    if (price === 0) return '₹0';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const handleUpgradeClick = (plan: any) => {
    if (currentSub?.plan === plan.name) return;
    if (plan.price.monthly === 0) return;
    setTargetPlan(plan);
    setPaymentMethod('card');
    const amt = isAnnual ? plan.price.annual : plan.price.monthly;
    setPaidAmount(amt.toString());
    setIsModalOpen(true);
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText('');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualPaymentSubmit = () => {
    if (!referenceId.trim()) {
      alert("Please enter a valid Transaction ID / UTR Number.");
      return;
    }
    if (!paidAmount || isNaN(Number(paidAmount))) {
      alert("Please enter a valid paid amount.");
      return;
    }

    if (user && targetPlan) {
      submitManualPaymentRequest(
        user.id,
        user.fullName,
        targetPlan.name,
        isAnnual ? 'annual' : 'monthly',
        Number(paidAmount),
        paymentApp,
        referenceId,
        screenshot
      );

      setIsModalOpen(false);
      setTargetPlan(null);
      setReferenceId('');
      setScreenshot('');
      setPaidAmount('');
      alert("Payment submitted successfully. Admin will verify and activate your plan.");
    }
  };

  const handleCardPayment = () => {
    if (!user || !targetPlan) return;
    setIsProcessing(true);

    const amt = isAnnual ? targetPlan.price.annual : targetPlan.price.monthly;
    const amountStr = `₹${amt.toLocaleString('en-IN')}/${isAnnual ? 'yr' : 'mo'}`;

    setTimeout(() => {
      activatePlan(user.id, targetPlan.name, amountStr, isAnnual ? 'annual' : 'monthly');
      setIsProcessing(false);
      setIsModalOpen(false);
      setTargetPlan(null);
      navigate('/dashboard/founder?upgrade=success');
    }, 2000);
  };

  const allHistory = [
    ...paymentRequests.map(p => ({
      id: p.transactionId || p.id,
      type: 'Subscription Upgrade',
      plan: p.planName,
      date: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      method: p.paymentMethod,
      amount: `+₹${p.amount}.00`,
      status: p.status === 'pending_verification' ? 'Pending Verification' : p.status === 'approved' ? 'Approved' : 'Rejected'
    })),
    ...transactions.map(t => ({
      id: t.id,
      type: t.type,
      plan: t.plan,
      date: t.date,
      method: t.method,
      amount: t.amount,
      status: t.status
    }))
  ];

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="mb-8">
        <h1 className="font-['Poppins'] text-2xl font-bold text-[#1F2937]">Subscription / Billing</h1>
        <p className="text-[#6B7280] mt-1">Manage your plan, payment method, and billing history.</p>
      </div>

      {/* Current plan banner */}
      {currentSub ? (
        <div className="bg-gradient-to-r from-[#4C1D95] to-[#6D28D9] rounded-[20px] p-6 text-white mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg relative overflow-hidden">
          <div className="absolute top-[-50%] right-[-10%] w-[40%] h-[200%] bg-white/5 rotate-12 pointer-events-none" />
          <div className="relative z-10">
            <p className="text-sm font-['Poppins'] font-bold text-white/60 uppercase tracking-wider mb-1 flex items-center gap-2">
              Current Plan
              {currentSub.status === 'Trial' && <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">TRIAL ACTIVE</span>}
            </p>
            <p className="text-2xl font-['Poppins'] font-extrabold">{currentSub.plan} — {currentSub.amount}</p>
            <p className="text-sm text-white/70 mt-1">Next billing date: {currentSub.nextBilling}</p>
          </div>
          <div className="flex gap-3 relative z-10">
            <button
              onClick={() => window.confirm("Are you sure you want to cancel your plan?")}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-['Poppins'] font-semibold rounded-xl text-sm transition-colors border border-white/20 backdrop-blur-sm"
            >
              Cancel Plan
            </button>
            {currentSub.plan !== 'Platinum' && (
              <button
                onClick={() => handleUpgradeClick(plans.find(p => p.name === 'Platinum'))}
                className="px-4 py-2.5 bg-[#FBBF24] hover:bg-yellow-400 text-gray-900 font-['Poppins'] font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-yellow-500/20"
              >
                Upgrade to Platinum ↗
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[20px] p-6 border border-gray-200 shadow-sm mb-8 text-center">
          <p className="text-[#6B7280]">No active subscription found.</p>
        </div>
      )}

      {/* Billing toggle */}
      <div className="flex flex-col items-center mb-10">
        <div className="flex items-center gap-4 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm">
          <button
            onClick={() => setIsAnnual(false)}
            className={`px-6 py-2.5 rounded-xl font-['Poppins'] font-medium text-sm transition-all duration-300 ${!isAnnual ? 'bg-[#5B21B6] text-white shadow-md shadow-purple-500/20' : 'text-[#6B7280] hover:text-[#1F2937]'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`px-6 py-2.5 rounded-xl font-['Poppins'] font-medium text-sm transition-all duration-300 ${isAnnual ? 'bg-[#5B21B6] text-white shadow-md shadow-purple-500/20' : 'text-[#6B7280] hover:text-[#1F2937]'}`}
          >
            Annual
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs font-medium text-[#10B981] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Save up to 20% with Annual Billing
          </span>
        </div>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch mb-10">
        {plans.map((plan) => {
          const isCurrent = currentSub?.plan === plan.name;

          return (
            <div
              key={plan.name}
              className={`group relative bg-white rounded-[20px] flex flex-col transition-all duration-500 ${
              plan.popular
                ? 'border-2 border-[#5B21B6] shadow-2xl shadow-purple-500/15 z-10'
                : 'border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1'
            } ${isCurrent ? 'ring-2 ring-[#FBBF24]' : ''}`}
            style={plan.popular ? { boxShadow: '0 0 30px rgba(91,33,182,0.12), 0 0 60px rgba(251,191,36,0.08)' } : {}}
            >
              {plan.popular && (
                <div className="absolute inset-0 rounded-[20px] bg-gradient-to-b from-[#5B21B6]/5 via-transparent to-[#FBBF24]/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              )}

              {/* Badge */}
              <div className={`absolute top-5 left-1/2 -translate-x-1/2 ${plan.badgeColor} text-[10px] font-['Poppins'] font-bold px-4 py-1.5 rounded-full tracking-wider whitespace-nowrap shadow-sm z-10`}>
                {isCurrent ? 'Current Plan' : plan.badge}
              </div>

              <div className="p-7 pt-16 flex flex-col flex-1 relative z-10">
                <div className={`w-12 h-12 rounded-xl ${plan.iconBg} ${plan.iconColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <plan.icon size={24} />
                </div>

                <h4 className="font-['Poppins'] text-xl font-bold text-[#1F2937] mb-1">{plan.name}</h4>
                <p className="text-xs text-[#6B7280] mb-5">{plan.desc}</p>

                <div className="mb-6">
                  {plan.price.monthly === 0 ? (
                    <div className="text-4xl font-['Poppins'] font-black text-[#1F2937]">₹0</div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-['Poppins'] font-black text-[#1F2937]">
                          {formatPrice(isAnnual ? plan.price.annual : plan.price.monthly)}
                        </span>
                        <span className="text-sm text-[#6B7280] font-medium">
                          {isAnnual ? '/year' : '/month'}
                        </span>
                      </div>
                      {isAnnual && (
                        <div className="text-xs text-[#10B981] font-medium mt-1">
                          ₹{plan.price.monthly.toLocaleString('en-IN')}/mo billed annually
                        </div>
                      )}
                    </>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex text-sm text-[#4B5563]">
                      <Check size={16} className={`shrink-0 mt-1 mr-3 ${plan.popular ? 'text-[#FBBF24]' : 'text-[#10B981]'}`} />
                      <span className="leading-5">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgradeClick(plan)}
                  disabled={isCurrent || plan.price.monthly === 0}
                  className={`w-full py-3.5 rounded-xl font-['Poppins'] font-semibold text-sm transition-all duration-300 ${
                    isCurrent
                      ? 'bg-gray-100 text-gray-400 cursor-default'
                      : plan.price.monthly === 0
                        ? 'bg-gray-100 text-gray-400 cursor-default'
                        : plan.buttonStyle
                  } ${plan.popular ? 'group-hover:shadow-xl group-hover:shadow-amber-500/40' : ''}`}
                >
                  {isCurrent ? 'Current Plan' : plan.buttonText}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-[20px] border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="font-['Poppins'] font-bold text-[#1F2937] flex items-center gap-2">
            <CreditCard size={18} className="text-[#5B21B6]" /> Billing History
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          {allHistory.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-[#6B7280]">No payment history available.</div>
          ) : (
            allHistory.map((inv, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-bold text-[#1F2937]">{inv.type} — {inv.plan}</p>
                  <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide mt-0.5">{inv.date} • {inv.method}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-[#1F2937]">{inv.amount}</span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    inv.status === 'Success' || inv.status === 'Approved' ? 'text-emerald-600 bg-emerald-50' :
                    inv.status === 'Failed' || inv.status === 'Rejected' ? 'text-red-600 bg-red-50' :
                    inv.status === 'Pending Verification' ? 'text-blue-600 bg-blue-50' :
                    'text-amber-600 bg-amber-50'
                  }`}>
                    {inv.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {isModalOpen && targetPlan && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-[20px] shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10">
              <h3 className="font-['Poppins'] font-bold text-[#1F2937] text-lg">Complete Payment</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 flex justify-between items-center bg-purple-50 p-4 rounded-xl border border-purple-100">
                <div>
                  <p className="text-xs font-['Poppins'] font-bold text-purple-600 uppercase tracking-wider mb-1">Upgrading to</p>
                  <p className="text-lg font-['Poppins'] font-black text-[#1F2937]">{targetPlan.name} Plan</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-['Poppins'] font-black text-[#5B21B6]">
                    ₹{paidAmount}
                  </p>
                  <p className="text-xs font-semibold text-purple-600">{isAnnual ? 'total (annual)' : 'total (monthly)'}</p>
                </div>
              </div>

              {/* Payment Method Toggle */}
              <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-['Poppins'] font-semibold transition-all duration-300 ${paymentMethod === 'card' ? 'bg-white text-[#1F2937] shadow-sm' : 'text-[#6B7280] hover:text-[#1F2937]'}`}
                >
                  Pay with Card
                </button>
                <button
                  onClick={() => setPaymentMethod('upi')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-['Poppins'] font-semibold transition-all duration-300 ${paymentMethod === 'upi' ? 'bg-white text-[#1F2937] shadow-sm' : 'text-[#6B7280] hover:text-[#1F2937]'}`}
                >
                  UPI / Manual
                </button>
              </div>

              {paymentMethod === 'card' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-1.5">Card Number</label>
                    <input type="text" placeholder="4242 4242 4242 4242" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#5B21B6] focus:bg-white transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-1.5">Expiry</label>
                      <input type="text" placeholder="MM/YY" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#5B21B6] focus:bg-white transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-1.5">CVC</label>
                      <input type="text" placeholder="123" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#5B21B6] focus:bg-white transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-1.5">Cardholder Name</label>
                    <input type="text" placeholder="John Doe" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#5B21B6] focus:bg-white transition-all" />
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-medium">
                    <strong className="block mb-1">Test Mode</strong>
                    No real charge will be made. Click "Pay Now" to simulate a successful payment.
                  </div>
                  <button
                    onClick={handleCardPayment}
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-xl font-['Poppins'] font-semibold text-sm bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] text-white shadow-lg shadow-purple-500/20 hover:from-[#7C3AED] hover:to-[#5B21B6] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isProcessing ? (
                      <><Loader2 size={18} className="animate-spin" /> Processing Payment...</>
                    ) : (
                      <><CreditCard size={18} /> Pay Now</>
                    )}
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <p className="text-sm font-['Poppins'] font-bold text-[#1F2937] mb-4">Scan & Pay with UPI</p>
                    <div className="w-48 h-48 bg-white border border-gray-200 rounded-2xl mx-auto flex items-center justify-center p-2 mb-4 shadow-sm relative overflow-hidden">
                      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#5B21B6]"></div>
                      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#5B21B6]"></div>
                      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#5B21B6]"></div>
                      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#5B21B6]"></div>
                      <div className="w-full h-full bg-gray-50 rounded-xl flex items-center justify-center relative">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#5B21B6 2px, transparent 2px)', backgroundSize: '10px 10px' }}></div>
                        <div className="relative z-10 text-center">
                          <div className="w-24 h-24 mx-auto bg-white border-2 border-[#5B21B6] rounded-lg flex items-center justify-center mb-2">
                            <span className="text-[#5B21B6] font-black text-2xl">UPI</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-sm font-bold text-[#4B5563]">UPI ID: </span>
                      <button onClick={handleCopyUPI} className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors flex items-center gap-1">
                        {copied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <p className="text-sm font-['Poppins'] font-bold text-[#1F2937] mb-4">Submit Payment Details</p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-1.5">Payment App</label>
                        <div className="grid grid-cols-2 gap-2">
                          {paymentApps.map(app => (
                            <button key={app.id} onClick={() => setPaymentApp(app.id)} className={`py-2 px-3 rounded-lg border text-sm font-bold flex items-center gap-2 transition-all ${paymentApp === app.id ? 'border-[#5B21B6] bg-purple-50 text-[#5B21B6]' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                              <div className={`w-2 h-2 rounded-full ${app.color}`}></div>
                              {app.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-1.5">Amount Paid</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                            <input type="number" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} className="w-full pl-7 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#5B21B6] focus:bg-white transition-all" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-1.5">Transaction ID <span className="text-red-500">*</span></label>
                          <input type="text" value={referenceId} onChange={(e) => setReferenceId(e.target.value)} placeholder="e.g. UTR1234567" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#5B21B6] focus:bg-white transition-all" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-1.5">Screenshot (Optional)</label>
                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              {screenshot ? (
                                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm"><CheckCircle2 size={20} /> Screenshot Attached</div>
                              ) : (
                                <><UploadCloud className="w-6 h-6 mb-2 text-gray-400" /><p className="text-xs text-gray-500 font-medium">Click to upload image</p></>
                              )}
                            </div>
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl font-['Poppins'] font-semibold text-sm text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200">
                      Cancel
                    </button>
                    <button onClick={handleManualPaymentSubmit} className="flex-1 py-3 rounded-xl font-['Poppins'] font-semibold text-sm bg-[#5B21B6] hover:bg-[#7C3AED] text-white shadow-md flex items-center justify-center gap-2 transition-all">
                      Submit Proof <ArrowRight size={16} />
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
