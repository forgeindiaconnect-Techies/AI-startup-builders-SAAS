import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getPaymentRequests, submitPaymentRequest } from '../utils/localStorageHelper';

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  plan: string;
  amount: string;
  date: string;
  method: string;
  type: string;
  status: 'Success' | 'Pending' | 'Failed' | 'Refunded';
}

export interface Subscription {
  id: string;
  userId: string;
  userName: string;
  email: string;
  plan: string;
  amount: string;
  started: string;
  nextBilling: string;
  status: 'Active' | 'Cancelled' | 'Past Due' | 'Trial';
  paymentMethod?: string;
  transactionId?: string;
  mobile?: string;
  company?: string;
}

export interface PaymentRequest {
  id: string;
  founderId: string;
  founderName: string;
  planName: string;
  billingCycle: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  upiId: string;
  transactionId: string;
  screenshot: string; // base64 string
  status: 'pending_verification' | 'approved' | 'rejected';
  createdAt: string;
}

interface BillingContextType {
  subscriptions: Subscription[];
  transactions: Transaction[];
  paymentRequests: PaymentRequest[];
  submitManualPaymentRequest: (
    userId: string, 
    userName: string, 
    plan: string, 
    billingCycle: string,
    amount: number, 
    paymentMethod: string, 
    transactionId: string,
    screenshotBase64: string
  ) => Promise<void>;
  approvePayment: (paymentId: string) => void;
  rejectPayment: (paymentId: string) => void;
  getUserSubscription: (userId: string) => Subscription | undefined;
  getUserTransactions: (userId: string) => Transaction[];
  getUserPaymentRequests: (userId: string) => PaymentRequest[];
  cancelSubscription: (subscriptionId: string) => void;
  updateSubscriptionStatus: (subscriptionId: string, status: 'Active' | 'Cancelled' | 'Past Due' | 'Trial') => void;
  updateSubscriptionPlan: (subscriptionId: string, planName: string, amount: string) => void;
  assignFreePlan: (userId: string, userName: string, email: string) => Subscription;
  activatePlan: (userId: string, planName: string, amount: string, billingCycle: string) => void;
}

const getNextBillingDate = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getTodayDate = () => {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Initial mock data with full subscriber details
const initialSubscriptions: Subscription[] = [
  {
    id: 'SB-2458',
    userId: 'user-rahul-1',
    userName: 'Rahul Sharma',
    email: 'founder@test.com',
    plan: 'Pro',
    amount: '₹2,499/mo',
    started: 'Jul 14, 2026',
    nextBilling: 'Aug 14, 2026',
    status: 'Active',
    paymentMethod: 'UPI (GPay)',
    transactionId: 'UPI421987654321',
    mobile: '+91 98765 43210',
    company: 'TechFlow AI Labs'
  },
  {
    id: 'SB-7568',
    userId: 'user-sarah-1',
    userName: 'Sarah Jenkins',
    email: 'founder@startupbuilder.ai',
    plan: 'Enterprise',
    amount: '₹9,999/yr',
    started: 'Jul 14, 2026',
    nextBilling: 'Aug 14, 2027',
    status: 'Active',
    paymentMethod: 'Card (Visa ending in 4242)',
    transactionId: 'TXN-9821435210',
    mobile: '+1 555 019 2834',
    company: 'NextGen Solutions'
  },
  {
    id: 'SB-1042',
    userId: 'user-sarah-2',
    userName: 'Sarah Jenkins',
    email: 'founder@startupbuilder.ai',
    plan: 'Starter',
    amount: 'Free',
    started: 'Jul 14, 2026',
    nextBilling: 'Aug 14, 2026',
    status: 'Trial',
    paymentMethod: 'System Trial',
    transactionId: 'TRIAL-FREE-01',
    mobile: '+1 555 019 2834',
    company: 'NextGen Solutions'
  },
  {
    id: 'SB-1041',
    userId: 'user-tom-1',
    userName: 'Tom Chen',
    email: 'tom@startup.ai',
    plan: 'Scale',
    amount: '₹4,999/mo',
    started: 'Mar 10, 2026',
    nextBilling: 'Aug 10, 2026',
    status: 'Active',
    paymentMethod: 'UPI (PhonePe)',
    transactionId: 'UPI908172635441',
    mobile: '+1 415 892 1042',
    company: 'ScaleX Digital'
  },
  {
    id: 'SB-1039',
    userId: 'user-anna-1',
    userName: 'Anna Kim',
    email: 'anna@startup.ai',
    plan: 'Growth',
    amount: '₹3,499/mo',
    started: 'Apr 1, 2026',
    nextBilling: 'Cancelled',
    status: 'Cancelled',
    paymentMethod: 'UPI (Paytm)',
    transactionId: 'UPI112233445566',
    mobile: '+1 212 901 3321',
    company: 'BioHealth Tech'
  },
  {
    id: 'SB-1038',
    userId: 'user-peter-1',
    userName: 'Peter Zhao',
    email: 'peter@startup.ai',
    plan: 'Scale',
    amount: '₹4,999/mo',
    started: 'Jun 1, 2026',
    nextBilling: 'Aug 1, 2026',
    status: 'Past Due',
    paymentMethod: 'Net Banking (Axis)',
    transactionId: 'NB-7788990011',
    mobile: '+1 650 332 9901',
    company: 'HyperGrowth Ventures'
  }
];

const initialTransactions: Transaction[] = [];

const BillingContext = createContext<BillingContextType | undefined>(undefined);

export const BillingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    try {
      const saved = localStorage.getItem('ai_startup_builder_subs_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed && parsed.length > 0 ? parsed : initialSubscriptions;
      }
      return initialSubscriptions;
    } catch {
      return initialSubscriptions;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('ai_startup_builder_trans_v2');
      return saved ? JSON.parse(saved) : initialTransactions;
    } catch {
      return initialTransactions;
    }
  });

  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);

  useEffect(() => {
    // Load payment requests from backend
    getPaymentRequests().then(data => {
      if (data && data.length > 0) setPaymentRequests(data);
      else {
        // Fallback to localStorage
        try {
          const saved = localStorage.getItem('ai_startup_builder_payments');
          if (saved) setPaymentRequests(JSON.parse(saved));
        } catch {}
      }
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('ai_startup_builder_subs_v2', JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem('ai_startup_builder_trans_v2', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('ai_startup_builder_payments', JSON.stringify(paymentRequests));
  }, [paymentRequests]);

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'ai_startup_builder_subs_v2' && e.newValue) {
        try { setSubscriptions(JSON.parse(e.newValue)); } catch (err) { console.error(err); }
      }
      if (e.key === 'ai_startup_builder_trans_v2' && e.newValue) {
        try { setTransactions(JSON.parse(e.newValue)); } catch (err) { console.error(err); }
      }
      if (e.key === 'ai_startup_builder_payments' && e.newValue) {
        try { setPaymentRequests(JSON.parse(e.newValue)); } catch (err) { console.error(err); }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const submitManualPaymentRequest = async (
    userId: string,
    userName: string,
    plan: string,
    billingCycle: string,
    amount: number,
    paymentMethod: string,
    transactionId: string,
    screenshotBase64: string
  ) => {
    const newReq: PaymentRequest = {
      id: `payment_${Date.now()}`,
      founderId: userId,
      founderName: userName,
      planName: plan,
      billingCycle,
      amount,
      currency: 'USD',
      paymentMethod,
      upiId: 'startupbuilder@bank',
      transactionId,
      screenshot: screenshotBase64,
      status: 'pending_verification',
      createdAt: new Date().toISOString()
    };

    // Try to save via API
    const saved = await submitPaymentRequest(newReq);
    setPaymentRequests(prev => [saved || newReq, ...prev]);
  };

  const approvePayment = (paymentId: string) => {
    setPaymentRequests(prev => prev.map(p => 
      p.id === paymentId ? { ...p, status: 'approved' } : p
    ));

    // After state updates, we also need to update transactions and subscriptions
    // Using a timeout allows the React batch update to process gracefully, but we can just use the previous states here safely.
    setTimeout(() => {
      setPaymentRequests(currentRequests => {
        const approvedReq = currentRequests.find(p => p.id === paymentId);
        if (approvedReq) {
          // Add transaction
          const newTransaction: Transaction = {
            id: approvedReq.transactionId || `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
            userId: approvedReq.founderId,
            userName: approvedReq.founderName,
            plan: approvedReq.planName,
            amount: `+$${approvedReq.amount}.00`,
            date: getTodayDate(),
            method: approvedReq.paymentMethod,
            type: 'Manual Upgrade',
            status: 'Success'
          };
          setTransactions(tPrev => [newTransaction, ...tPrev]);

          // Upgrade subscription
          setSubscriptions(sPrev => {
            const existingIdx = sPrev.findIndex(s => s.userId === approvedReq.founderId);
            const newSub: Subscription = {
              id: `SB-${Math.floor(1000 + Math.random() * 9000)}`,
              userId: approvedReq.founderId,
              userName: approvedReq.founderName,
              email: existingIdx >= 0 ? sPrev[existingIdx].email : '',
              plan: approvedReq.planName,
              amount: `$${approvedReq.amount}/${approvedReq.billingCycle === 'annual' ? 'yr' : 'mo'}`,
              started: getTodayDate(),
              nextBilling: getNextBillingDate(),
              status: 'Active'
            };

            if (existingIdx >= 0) {
              const newArr = [...sPrev];
              newSub.id = newArr[existingIdx].id; 
              newArr[existingIdx] = newSub;
              return newArr;
            } else {
              return [newSub, ...sPrev];
            }
          });
          
          alert(`Notification to Founder: Your payment is approved. Your plan is activated.`);
        }
        return currentRequests;
      });
    }, 0);
  };

  const rejectPayment = (paymentId: string) => {
    setPaymentRequests(prev => prev.map(p => 
      p.id === paymentId ? { ...p, status: 'rejected' } : p
    ));

    setTimeout(() => {
      setPaymentRequests(currentRequests => {
        const rejectedReq = currentRequests.find(p => p.id === paymentId);
        if (rejectedReq) {
          const newTransaction: Transaction = {
            id: rejectedReq.transactionId || `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
            userId: rejectedReq.founderId,
            userName: rejectedReq.founderName,
            plan: rejectedReq.planName,
            amount: `$${rejectedReq.amount}.00`,
            date: getTodayDate(),
            method: rejectedReq.paymentMethod,
            type: 'Manual Upgrade',
            status: 'Failed'
          };
          setTransactions(tPrev => [newTransaction, ...tPrev]);
          alert(`Notification to Founder: Your payment was rejected. Please check transaction details and submit again.`);
        }
        return currentRequests;
      });
    }, 0);
  };

  const getUserSubscription = (userId: string) => {
    return subscriptions.find(s => s.userId === userId);
  };

  const getUserTransactions = (userId: string) => {
    return transactions.filter(t => t.userId === userId);
  };

  const getUserPaymentRequests = (userId: string) => {
    return paymentRequests.filter(p => p.founderId === userId);
  };

  const cancelSubscription = (subscriptionId: string) => {
    setSubscriptions(prev => prev.filter(s => s.id !== subscriptionId));
  };

  const updateSubscriptionStatus = (subscriptionId: string, status: 'Active' | 'Cancelled' | 'Past Due' | 'Trial') => {
    setSubscriptions(prev => prev.map(s => s.id === subscriptionId ? { ...s, status } : s));
  };

  const updateSubscriptionPlan = (subscriptionId: string, planName: string, amount: string) => {
    setSubscriptions(prev => prev.map(s => s.id === subscriptionId ? { ...s, plan: planName, amount } : s));
  };

  const assignFreePlan = (userId: string, userName: string, email: string) => {
    const existing = subscriptions.find(s => s.userId === userId);
    if (existing) return existing;

    const newSub: Subscription = {
      id: `SB-${Math.floor(1000 + Math.random() * 9000)}`,
      userId,
      userName,
      email,
      plan: 'Free',
      amount: '₹0',
      started: getTodayDate(),
      nextBilling: getNextBillingDate(),
      status: 'Active'
    };
    setSubscriptions(prev => [newSub, ...prev]);

    const txn: Transaction = {
      id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      userId,
      userName,
      plan: 'Free',
      amount: '+₹0.00',
      date: getTodayDate(),
      method: 'System Activation',
      type: 'Free Plan Assigned',
      status: 'Success'
    };
    setTransactions(prev => [txn, ...prev]);
    return newSub;
  };

  const activatePlan = (userId: string, planName: string, amount: string, _billingCycle: string) => {
    setSubscriptions(prev => {
      const existingIdx = prev.findIndex(s => s.userId === userId);
      const newSub: Subscription = {
        id: existingIdx >= 0 ? prev[existingIdx].id : `SB-${Math.floor(1000 + Math.random() * 9000)}`,
        userId,
        userName: existingIdx >= 0 ? prev[existingIdx].userName : '',
        email: existingIdx >= 0 ? prev[existingIdx].email : '',
        plan: planName,
        amount: amount,
        started: getTodayDate(),
        nextBilling: getNextBillingDate(),
        status: 'Active'
      };
      if (existingIdx >= 0) {
        const arr = [...prev];
        arr[existingIdx] = newSub;
        return arr;
      }
      return [newSub, ...prev];
    });

    const txn: Transaction = {
      id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      userId,
      userName: subscriptions.find(s => s.userId === userId)?.userName || '',
      plan: planName,
      amount: `+${amount}`,
      date: getTodayDate(),
      method: 'Card Payment',
      type: 'Subscription Upgrade',
      status: 'Success'
    };
    setTransactions(prev => [txn, ...prev]);
  };

  return (
    <BillingContext.Provider value={{ 
      subscriptions, 
      transactions, 
      paymentRequests,
      submitManualPaymentRequest, 
      approvePayment,
      rejectPayment,
      getUserSubscription, 
      getUserTransactions,
      getUserPaymentRequests,
      cancelSubscription,
      updateSubscriptionStatus,
      updateSubscriptionPlan,
      assignFreePlan,
      activatePlan
    }}>
      {children}
    </BillingContext.Provider>
  );
};

export const useBilling = () => {
  const context = useContext(BillingContext);
  if (context === undefined) {
    throw new Error('useBilling must be used within a BillingProvider');
  }
  return context;
};
