import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  ) => void;
  approvePayment: (paymentId: string) => void;
  rejectPayment: (paymentId: string) => void;
  getUserSubscription: (userId: string) => Subscription | undefined;
  getUserTransactions: (userId: string) => Transaction[];
  getUserPaymentRequests: (userId: string) => PaymentRequest[];
  cancelSubscription: (subscriptionId: string) => void;
}

const getNextBillingDate = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getTodayDate = () => {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Initial mock data
const initialSubscriptions: Subscription[] = [
  { id: 'SB-1042', userId: '1', userName: 'Sarah Jenkins', email: 'founder@startupbuilder.ai', plan: 'Starter', amount: 'Free', started: getTodayDate(), nextBilling: getNextBillingDate(), status: 'Trial' },
  { id: 'SB-1041', userId: 'test_1', userName: 'Tom Chen', email: 'tom@startup.ai', plan: 'Scale', amount: '$149/mo', started: 'Mar 10, 2026', nextBilling: 'Aug 10, 2026', status: 'Active' },
  { id: 'SB-1039', userId: 'test_2', userName: 'Anna Kim', email: 'anna@startup.ai', plan: 'Growth', amount: '$49/mo', started: 'Apr 1, 2026', nextBilling: 'Cancelled', status: 'Cancelled' },
  { id: 'SB-1038', userId: 'test_3', userName: 'Peter Zhao', email: 'peter@startup.ai', plan: 'Scale', amount: '$149/mo', started: 'Jun 1, 2026', nextBilling: 'Aug 1, 2026', status: 'Past Due' },
];

const initialTransactions: Transaction[] = [
  { id: 'PAY-9901', userId: '1', userName: 'Sarah Jenkins', plan: 'Starter', amount: '+$0.00', date: getTodayDate(), method: 'System Activation', type: 'Trial Started', status: 'Success' },
  { id: 'PAY-9820', userId: 'test_1', userName: 'Tom Chen', plan: 'Scale', amount: '+$149.00', date: 'Jul 1, 2026', method: 'Mastercard •••• 1234', type: 'Subscription', status: 'Success' },
  { id: 'PAY-9819', userId: 'test_3', userName: 'Peter Zhao', plan: 'Scale', amount: '-$149.00', date: 'Jun 28, 2026', method: 'Visa •••• 9012', type: 'Failed Charge', status: 'Failed' },
  { id: 'PAY-9818', userId: 'test_2', userName: 'Anna Kim', plan: 'Growth', amount: '+$49.00', date: 'Jun 15, 2026', method: 'Stripe Link', type: 'Subscription', status: 'Refunded' },
];

const BillingContext = createContext<BillingContextType | undefined>(undefined);

export const BillingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    try {
      const saved = localStorage.getItem('ai_startup_builder_subs_v2');
      return saved ? JSON.parse(saved) : initialSubscriptions;
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

  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>(() => {
    try {
      const saved = localStorage.getItem('ai_startup_builder_payments');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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

  const submitManualPaymentRequest = (
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
      currency: "USD",
      paymentMethod,
      upiId: "startupbuilder@bank",
      transactionId,
      screenshot: screenshotBase64,
      status: 'pending_verification',
      createdAt: new Date().toISOString()
    };

    setPaymentRequests(prev => [newReq, ...prev]);

    // Send a mock notification to Admin (we'll just use a window alert or custom event if needed)
    // Realistically, the Notification context would be used here. For now, it's saved in state.
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
      cancelSubscription
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
