import React, { useState } from 'react';
import { Check, Zap, Shield, Building2, CreditCard, Download, X, QrCode, ArrowRight, Building, Copy, CheckCircle2, Clock, UploadCloud, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useBilling } from '../../../context/BillingContext';

const plans = [
  {
    name: 'Starter', price: '$0', period: '1 Month Free Trial', icon: Zap, color: 'from-gray-600 to-gray-700',
    features: ['1 Startup', '5 AI Reports/month', 'Basic roadmap', 'Community support'],
  },
  {
    name: 'Growth', price: '$49', period: '/month', icon: Shield, color: 'from-[#5B21B6] to-[#7C3AED]',
    features: ['5 Startups', 'Unlimited AI Reports', 'Pitch Deck Builder', 'Mentor matching', 'Priority support'],
  },
  {
    name: 'Scale', price: '$149', period: '/month', icon: Building2, color: 'from-amber-500 to-orange-500',
    features: ['Unlimited Startups', 'AI Chat Assistant', 'Investor introductions', 'Custom domain', 'Dedicated success manager'],
  },
];

const paymentApps = [
  { id: 'Google Pay', name: 'GPay', color: 'bg-blue-500' },
  { id: 'Paytm', name: 'Paytm', color: 'bg-[#00BAF2]' },
  { id: 'PhonePe', name: 'PhonePe', color: 'bg-[#5f259f]' },
  { id: 'UPI', name: 'UPI', color: 'bg-gray-800' },
];

const FounderBilling: React.FC = () => {
  const { user } = useAuth();
  const { getUserSubscription, getUserTransactions, getUserPaymentRequests, submitManualPaymentRequest } = useBilling();
  
  const [annual, setAnnual] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetPlan, setTargetPlan] = useState<any>(null);
  
  const [paymentApp, setPaymentApp] = useState('Google Pay');
  const [referenceId, setReferenceId] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [screenshot, setScreenshot] = useState(''); // base64 string
  
  const [copied, setCopied] = useState(false);
  
  const currentSub = user ? getUserSubscription(user.id) : undefined;
  const transactions = user ? getUserTransactions(user.id) : [];
  const paymentRequests = user ? getUserPaymentRequests(user.id) : [];

  const handleUpgradeClick = (plan: any) => {
    if (currentSub?.plan === plan.name) return;
    setTargetPlan(plan);
    let amt = plan.price.replace('$', '');
    if (annual && amt !== '0') {
      amt = Math.floor(parseInt(amt) * 0.8 * 12).toString();
    }
    setPaidAmount(amt);
    setIsModalOpen(true);
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText("startupbuilder@bank");
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
        user.name,
        targetPlan.name,
        annual ? 'annual' : 'monthly',
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

  // Combine standard transactions and pending requests for the Billing History table
  const allHistory = [
    ...paymentRequests.map(p => ({
      id: p.transactionId || p.id,
      type: 'Subscription Upgrade',
      plan: p.planName,
      date: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      method: p.paymentMethod,
      amount: `+$${p.amount}.00`,
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
        <h1 className="text-2xl font-bold text-gray-900">Subscription / Billing</h1>
        <p className="text-gray-500 mt-1">Manage your plan, payment method, and billing history.</p>
      </div>

      {/* Current plan banner */}
      {currentSub ? (
        <div className="bg-gradient-to-r from-[#4C1D95] to-[#6D28D9] rounded-2xl p-6 text-white mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg relative overflow-hidden">
          <div className="absolute top-[-50%] right-[-10%] w-[40%] h-[200%] bg-white/5 rotate-12 pointer-events-none" />
          <div className="relative z-10">
            <p className="text-sm font-bold text-white/60 uppercase tracking-wider mb-1 flex items-center gap-2">
              Current Plan 
              {currentSub.status === 'Trial' && <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">TRIAL ACTIVE</span>}
            </p>
            <p className="text-2xl font-extrabold">{currentSub.plan} — {currentSub.amount}</p>
            <p className="text-sm text-white/70 mt-1">Next billing date: {currentSub.nextBilling}</p>
          </div>
          <div className="flex gap-3 relative z-10">
            <button 
              onClick={() => window.confirm("Are you sure you want to cancel your plan?")}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition-colors border border-white/20 backdrop-blur-sm"
            >
              Cancel Plan
            </button>
            {currentSub.plan !== 'Scale' && (
              <button 
                onClick={() => handleUpgradeClick(plans.find(p => p.name === 'Scale'))}
                className="px-4 py-2.5 bg-[#FBBF24] hover:bg-yellow-400 text-gray-900 font-bold rounded-xl text-sm transition-colors shadow-lg shadow-yellow-500/20"
              >
                Upgrade to Scale ↗
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8 text-center">
          <p className="text-gray-500">No active subscription found.</p>
        </div>
      )}

      {/* Plan toggle */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <span className={`text-sm font-bold ${!annual ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
        <button onClick={() => setAnnual(a => !a)} className={`relative w-12 h-6 rounded-full transition-colors ${annual ? 'bg-[#5B21B6]' : 'bg-gray-200'}`}>
          <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${annual ? 'translate-x-6' : ''}`} />
        </button>
        <span className={`text-sm font-bold ${annual ? 'text-gray-900' : 'text-gray-400'}`}>Annual <span className="text-emerald-600">(Save 20%)</span></span>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {plans.map(p => {
          const isCurrent = currentSub?.plan === p.name;
          const priceDisplay = annual ? (p.price === '$0' ? '$0' : `$${Math.floor(parseInt(p.price.slice(1)) * 0.8 * 12)}`) : p.price;
          const periodDisplay = annual && p.price !== '$0' ? '/year' : p.period;

          return (
            <div key={p.name} className={`bg-white rounded-2xl border shadow-sm p-6 relative flex flex-col ${isCurrent ? 'border-[#5B21B6] shadow-lg shadow-purple-100' : 'border-gray-100 hover:border-gray-200'}`}>
              {isCurrent && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#5B21B6] text-white text-[10px] font-extrabold tracking-wider rounded-full shadow-md uppercase">Current Plan</div>}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white mb-4 shadow-md`}>
                <p.icon size={24} />
              </div>
              <h3 className="text-lg font-extrabold text-gray-900 mb-1">{p.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-black text-gray-900">{priceDisplay}</span>
                <span className="text-sm text-gray-500 font-medium ml-1">{periodDisplay}</span>
              </div>
              <ul className="space-y-3 flex-1 mb-6">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" /> 
                    <span className="leading-snug">{f}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => handleUpgradeClick(p)}
                disabled={isCurrent || p.price === '$0'}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                  isCurrent 
                    ? 'bg-gray-100 text-gray-400 cursor-default' 
                    : p.price === '$0' 
                      ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200'
                      : 'bg-[#5B21B6] hover:bg-[#7C3AED] text-white shadow-md shadow-purple-900/10'
                }`}
              >
                {isCurrent ? 'Current Plan' : (p.price === '$0' ? 'Free Tier' : `Upgrade to ${p.name}`)}
              </button>
            </div>
          );
        })}
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="font-bold text-gray-900 flex items-center gap-2"><CreditCard size={18} className="text-[#5B21B6]" /> Billing History</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {allHistory.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-gray-500">No payment history available.</div>
          ) : (
            allHistory.map((inv, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-bold text-gray-900">{inv.type} — {inv.plan}</p>
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mt-0.5">{inv.date} • {inv.method}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-gray-900">{inv.amount}</span>
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

      {/* Manual Payment Modal */}
      {isModalOpen && targetPlan && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10">
              <h3 className="font-bold text-gray-900 text-lg">Complete Payment</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 flex justify-between items-center bg-purple-50 p-4 rounded-xl border border-purple-100">
                <div>
                  <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Upgrading to</p>
                  <p className="text-lg font-black text-gray-900">{targetPlan.name} Plan</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-[#5B21B6]">
                    ${paidAmount}
                  </p>
                  <p className="text-xs font-semibold text-purple-600">{annual ? 'total (annual)' : 'total (monthly)'}</p>
                </div>
              </div>

              <div className="text-center mb-6">
                <p className="text-sm font-bold text-gray-900 mb-4">Step 1: Scan & Pay</p>
                
                <div className="w-48 h-48 bg-white border border-gray-200 rounded-2xl mx-auto flex items-center justify-center p-2 mb-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#5B21B6]"></div>
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#5B21B6]"></div>
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#5B21B6]"></div>
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#5B21B6]"></div>
                  
                  <div className="w-full h-full bg-gray-50 rounded-xl flex items-center justify-center relative p-2">
                     <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#5B21B6 2px, transparent 2px)', backgroundSize: '10px 10px' }}></div>
                     <img 
                       src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 29 29' shape-rendering='crispEdges'><path fill='%235B21B6' d='M0 0h7v7H0zM1 1v5h5V1zM2 2h3v3H2zM8 0h1v1H8zM10 0h2v1h-2zM13 0h1v1h-1zM15 0h1v1h-1zM17 0h2v1h-2zM20 0h1v1h-1zM22 0h7v7h-7zM23 1v5h5V1zM24 2h3v3h-3zM8 1h1v1H8zM11 1h1v1h-1zM14 1h1v1h-1zM16 1h1v1h-1zM18 1h2v1h-2zM9 2h2v1H9zM12 2h1v1h-1zM15 2h3v1h-3zM21 2h1v1h-1zM8 3h1v1H8zM11 3h1v1h-1zM13 3h1v1h-1zM15 3h1v1h-1zM17 3h3v1h-3zM21 3h1v1h-1zM8 4h3v1H8zM12 4h1v1h-1zM14 4h1v1h-1zM16 4h1v1h-1zM19 4h1v1h-1zM21 4h1v1h-1zM9 5h1v1H9zM11 5h2v1h-2zM15 5h1v1h-1zM18 5h2v1h-2zM21 5h1v1h-1zM8 6h2v1H8zM11 6h2v1h-2zM14 6h1v1h-1zM17 6h2v1h-2zM20 6h2v1h-2zM0 7h1v1H0zM2 7h2v1H2zM5 7h1v1H5zM7 7h1v1H7zM9 7h1v1H9zM12 7h1v1h-1zM14 7h1v1h-1zM16 7h1v1h-1zM18 7h1v1h-1zM21 7h1v1h-1zM23 7h1v1h-1zM25 7h2v1h-2zM28 7h1v1h-1zM0 8h2v1H0zM3 8h1v1H3zM5 8h4v1H5zM10 8h2v1h-2zM13 8h1v1h-1zM15 8h2v1h-2zM18 8h1v1h-1zM20 8h1v1h-1zM22 8h2v1h-2zM25 8h1v1h-1zM27 8h1v1h-1zM0 9h2v1H0zM3 9h3v1H3zM7 9h1v1H7zM9 9h2v1H9zM12 9h2v1h-2zM16 9h1v1h-1zM18 9h1v1h-1zM21 9h1v1h-1zM24 9h1v1h-1zM27 9h1v1h-1zM1 10h1v1H1zM4 10h1v1H4zM7 10h1v1H7zM10 10h1v1h-1zM12 10h1v1h-1zM15 10h1v1h-1zM17 10h2v1h-2zM20 10h2v1h-2zM23 10h2v1h-2zM26 10h3v1h-3zM0 11h1v1H0zM2 11h2v1H2zM5 11h1v1H5zM7 11h2v1H7zM10 11h2v1h-2zM13 11h1v1h-1zM17 11h1v1h-1zM19 11h1v1h-1zM21 11h1v1h-1zM23 11h1v1h-1zM25 11h2v1h-2zM28 11h1v1h-1zM0 12h1v1H0zM3 12h1v1H3zM5 12h2v1H5zM8 12h1v1H8zM11 12h3v1h-3zM15 12h2v1h-2zM18 12h2v1h-2zM21 12h1v1h-1zM23 12h1v1h-1zM27 12h2v1h-2zM0 13h2v1H0zM3 13h1v1H3zM5 13h2v1H5zM8 13h4v1H8zM13 13h1v1h-1zM16 13h1v1h-1zM18 13h1v1h-1zM20 13h2v1h-2zM23 13h2v1h-2zM26 13h1v1h-1zM28 13h1v1h-1zM1 14h2v1H1zM4 14h2v1H4zM7 14h2v1H7zM10 14h1v1h-1zM12 14h1v1h-1zM14 14h1v1h-1zM16 14h1v1h-1zM18 14h1v1h-1zM20 14h1v1h-1zM22 14h1v1h-1zM24 14h1v1h-1zM26 14h1v1h-1zM28 14h1v1h-1zM0 15h1v1H0zM2 15h1v1H2zM4 15h2v1H4zM7 15h2v1H7zM10 15h2v1h-2zM13 15h1v1h-1zM15 15h1v1h-1zM17 15h3v1h-3zM21 15h3v1h-3zM25 15h1v1h-1zM27 15h2v1h-2zM0 16h2v1H0zM4 16h1v1H4zM6 16h2v1H6zM9 16h2v1H9zM12 16h1v1h-1zM14 16h4v1h-4zM20 16h1v1h-1zM22 16h1v1h-2zM25 16h3v1h-3zM2 17h1v1H2zM4 17h1v1H4zM6 17h1v1H6zM8 17h1v1H8zM11 17h1v1h-1zM13 17h1v1h-1zM15 17h1v1h-1zM17 17h2v1h-2zM20 17h1v1h-1zM22 17h2v1h-2zM25 17h1v1h-1zM27 17h2v1h-2zM1 18h1v1H1zM4 18h1v1H4zM6 18h1v1H6zM8 18h2v1H8zM11 18h1v1h-1zM13 18h2v1h-2zM16 18h1v1h-1zM18 18h1v1h-1zM21 18h1v1h-1zM23 18h1v1h-1zM26 18h1v1h-1zM28 18h1v1h-1zM0 19h1v1H0zM2 19h1v1H2zM4 19h1v1H4zM7 19h2v1H7zM10 19h1v1h-1zM12 19h1v1h-1zM14 19h1v1h-1zM16 19h1v1h-1zM18 19h1v1h-1zM20 19h2v1h-2zM23 19h1v1h-1zM25 19h1v1h-1zM27 19h2v1h-2zM0 20h2v1H0zM3 20h1v1H3zM5 20h1v1H5zM7 20h1v1H7zM9 20h1v1H9zM11 20h2v1h-2zM14 20h1v1h-1zM16 20h1v1h-1zM20 20h1v1h-1zM22 20h1v1h-1zM25 20h1v1h-1zM27 20h1v1h-1zM0 21h1v1H0zM2 21h2v1H2zM5 21h1v1H5zM8 21h3v1H8zM12 21h2v1h-2zM15 21h2v1h-2zM18 21h1v1h-1zM21 21h1v1h-1zM23 21h1v1h-1zM26 21h3v1h-3zM0 22h7v7H0zM1 23h5v5H1zM2 24h3v3H2zM8 22h1v1H8zM10 22h3v1h-3zM15 22h2v1h-2zM18 22h2v1h-2zM22 22h1v1h-1zM24 22h2v1h-2zM27 22h1v1h-1zM8 23h1v1H8zM11 23h1v1h-1zM14 23h1v1h-1zM16 23h2v1h-2zM19 23h2v1h-2zM22 23h2v1h-2zM26 23h1v1h-1zM28 23h1v1h-1zM8 24h2v1H8zM12 24h1v1h-1zM14 24h2v1h-2zM17 24h1v1h-1zM20 24h2v1h-2zM23 24h1v1h-1zM25 24h1v1h-1zM27 24h2v1h-2zM8 25h1v1H8zM11 25h1v1h-1zM13 25h1v1h-1zM16 25h3v1h-3zM22 25h1v1h-1zM24 25h1v1h-1zM27 25h1v1h-1zM8 26h2v1H8zM11 26h2v1h-2zM14 26h1v1h-1zM16 26h1v1h-1zM18 26h2v1h-2zM21 26h1v1h-1zM24 26h2v1h-2zM27 26h1v1h-1zM8 27h1v1H8zM10 27h1v1h-1zM12 27h2v1h-2zM15 27h1v1h-1zM18 27h2v1h-2zM21 27h2v1h-2zM24 27h1v1h-1zM27 27h2v1h-2zM8 28h1v1H8zM10 28h2v1h-2zM13 28h1v1h-1zM15 28h1v1h-1zM17 28h1v1h-1zM20 28h3v1h-3zM25 28h1v1h-1zM27 28h1v1h-1z'/></svg>"
                       alt="Payment QR Code" 
                       className="w-full h-full relative z-10 opacity-90 drop-shadow-sm"
                     />
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-sm font-bold text-gray-700">UPI ID: startupbuilder@bank</span>
                  <button 
                    onClick={handleCopyUPI}
                    className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors flex items-center gap-1"
                  >
                    {copied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <p className="text-sm font-bold text-gray-900 mb-4">Step 2: Submit Payment Details</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Payment App Used
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {paymentApps.map(app => (
                        <button
                          key={app.id}
                          onClick={() => setPaymentApp(app.id)}
                          className={`py-2 px-3 rounded-lg border text-sm font-bold flex items-center gap-2 transition-all ${
                            paymentApp === app.id 
                              ? 'border-[#5B21B6] bg-purple-50 text-[#5B21B6]' 
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${app.color}`}></div>
                          {app.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Amount Paid
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                        <input 
                          type="number" 
                          value={paidAmount}
                          onChange={(e) => setPaidAmount(e.target.value)}
                          className="w-full pl-7 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#5B21B6] focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Transaction ID <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={referenceId}
                        onChange={(e) => setReferenceId(e.target.value)}
                        placeholder="e.g. UTR1234567" 
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#5B21B6] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Screenshot (Optional)
                    </label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {screenshot ? (
                            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                              <CheckCircle2 size={20} /> Screenshot Attached
                            </div>
                          ) : (
                            <>
                              <UploadCloud className="w-6 h-6 mb-2 text-gray-400" />
                              <p className="text-xs text-gray-500 font-medium">Click to upload image</p>
                            </>
                          )}
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex justify-end gap-3 sticky bottom-0 z-10">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleManualPaymentSubmit}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-[#5B21B6] hover:bg-[#7C3AED] text-white shadow-md flex items-center gap-2 transition-all"
              >
                Submit Payment Proof <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FounderBilling;
