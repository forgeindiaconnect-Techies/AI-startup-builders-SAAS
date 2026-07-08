import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface FundingOffer {
  id: string;
  startupId: string;
  startupName: string;
  founderId: string;
  founderName: string;
  investorId: string;
  investorName: string;
  investorCompany: string;
  investorEmail?: string;
  investorAddress?: string;
  offerAmount: number;
  currency: string;
  equityPercentage: number;
  valuationCap: number;
  instrument: string;
  discount: number;
  expiresInDays: number;
  investorMessage: string;
  founderResponse: string;
  counterOffer: {
    amount: number | null;
    equityPercentage: number | null;
    message: string;
  };
  adminNote: string;
  status: 'offer_received' | 'accepted' | 'counter_offer' | 'rejected' | 'funded';
  history: Array<{
    action: string;
    performedBy: string;
    role: string;
    message: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  actionUrl: string;
  isRead: boolean;
  createdAt: string;
}

interface FundingContextType {
  offers: FundingOffer[];
  sendOffer: (offerData: Omit<FundingOffer, 'id' | 'status' | 'history' | 'createdAt' | 'updatedAt' | 'founderResponse' | 'counterOffer' | 'adminNote'>) => void;
  respondToOffer: (offerId: string, responseType: 'accepted' | 'rejected' | 'counter_offer', details: { message?: string, counterAmount?: number, counterEquity?: number }) => void;
  markAsFunded: (offerId: string, adminNote: string, adminName: string) => void;
  getFounderOffers: (founderId: string) => FundingOffer[];
  getStartupOffers: (startupId: string) => FundingOffer[];
}

const FundingContext = createContext<FundingContextType | undefined>(undefined);

export const FundingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [offers, setOffers] = useState<FundingOffer[]>(() => {
    try {
      const saved = localStorage.getItem('ai_startup_builder_funding_offers');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const saved = localStorage.getItem('ai_startup_builder_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('ai_startup_builder_funding_offers', JSON.stringify(offers));
  }, [offers]);

  useEffect(() => {
    localStorage.setItem('ai_startup_builder_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'ai_startup_builder_funding_offers' && e.newValue) {
        try { setOffers(JSON.parse(e.newValue)); } catch (err) { console.error(err); }
      }
      if (e.key === 'ai_startup_builder_notifications' && e.newValue) {
        try { setNotifications(JSON.parse(e.newValue)); } catch (err) { console.error(err); }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const addNotification = (userId: string, title: string, message: string, actionUrl: string) => {
    const newNotif: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId,
      title,
      message,
      actionUrl,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const sendOffer = (offerData: Omit<FundingOffer, 'id' | 'status' | 'history' | 'createdAt' | 'updatedAt' | 'founderResponse' | 'counterOffer' | 'adminNote'>) => {
    const newOffer: FundingOffer = {
      ...offerData,
      id: `offer_${Date.now()}`,
      status: 'offer_received',
      founderResponse: '',
      counterOffer: { amount: null, equityPercentage: null, message: '' },
      adminNote: '',
      history: [
        {
          action: 'offer_received',
          performedBy: offerData.investorName,
          role: 'Investor',
          message: 'Investor sent funding offer.',
          createdAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setOffers(prev => [newOffer, ...prev]);

    // Notify Founder
    addNotification(
      offerData.founderId,
      "New Funding Offer Received",
      `${offerData.investorName} from ${offerData.investorCompany} sent a funding offer for your startup.`,
      "/dashboard/founder/funding"
    );

    // Notify Admin (we'll just use 'admin' as a generic user ID for now)
    addNotification(
      "admin",
      "New Funding Offer Created",
      `Investor sent a funding offer to ${offerData.founderName}.`,
      "/dashboard/admin/startups"
    );
  };

  const respondToOffer = (offerId: string, responseType: 'accepted' | 'rejected' | 'counter_offer', details: { message?: string, counterAmount?: number, counterEquity?: number }) => {
    setOffers(prev => prev.map(offer => {
      if (offer.id === offerId) {
        const updatedOffer = { ...offer, status: responseType, updatedAt: new Date().toISOString(), history: [...offer.history] };
        
        const historyEntry = {
          action: responseType,
          performedBy: offer.founderName,
          role: 'Founder',
          message: '',
          createdAt: new Date().toISOString()
        };

        if (responseType === 'accepted') {
          historyEntry.message = "Founder accepted the funding offer.";
          // Notifications
          addNotification(offer.investorId, "Funding Offer Accepted", "Founder accepted your funding offer.", "/dashboard/investor/portfolio-hub");
          addNotification("admin", "Founder Accepted Funding Offer", `${offer.founderName} accepted the offer from ${offer.investorCompany}.`, "/dashboard/admin/startups");
        } else if (responseType === 'rejected') {
          updatedOffer.founderResponse = details.message || '';
          historyEntry.message = "Founder rejected the funding offer.";
          // Notifications
          addNotification(offer.investorId, "Funding Offer Rejected", "Founder rejected your funding offer.", "/dashboard/investor/portfolio-hub");
          addNotification("admin", "Founder Rejected Funding Offer", `${offer.founderName} rejected the offer from ${offer.investorCompany}.`, "/dashboard/admin/startups");
        } else if (responseType === 'counter_offer') {
          updatedOffer.counterOffer = {
            amount: details.counterAmount || null,
            equityPercentage: details.counterEquity || null,
            message: details.message || ''
          };
          historyEntry.message = "Founder sent a counter offer.";
          // Notifications
          addNotification(offer.investorId, "Counter Offer Received", "Founder sent a counter offer.", "/dashboard/investor/portfolio-hub");
          addNotification("admin", "Counter Offer Sent", `${offer.founderName} sent a counter offer to ${offer.investorCompany}.`, "/dashboard/admin/startups");
        }

        updatedOffer.history.push(historyEntry);
        return updatedOffer;
      }
      return offer;
    }));
  };

  const markAsFunded = (offerId: string, adminNote: string, adminName: string) => {
    setOffers(prev => prev.map(offer => {
      if (offer.id === offerId) {
        const updatedOffer = { 
          ...offer, 
          status: 'funded' as const, 
          adminNote: adminNote,
          updatedAt: new Date().toISOString(),
          history: [...offer.history]
        };
        
        updatedOffer.history.push({
          action: 'funded',
          performedBy: adminName,
          role: 'Admin',
          message: 'Admin verified and marked the offer as funded.',
          createdAt: new Date().toISOString()
        });

        // Notify Founder and Investor
        addNotification(offer.founderId, "Funding Confirmed", "Admin verified and marked the funding offer as funded.", "/dashboard/founder/funding");
        addNotification(offer.investorId, "Funding Confirmed", "Admin verified and marked your investment offer as funded.", "/dashboard/investor/portfolio-hub");

        return updatedOffer;
      }
      return offer;
    }));
  };

  const getFounderOffers = (founderId: string) => offers.filter(o => o.founderId === founderId);
  const getStartupOffers = (startupId: string, startupName?: string) => 
    offers.filter(o => o.startupId === startupId || (startupName && o.startupName.toLowerCase() === startupName.toLowerCase())).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <FundingContext.Provider value={{ offers, sendOffer, respondToOffer, markAsFunded, getFounderOffers, getStartupOffers }}>
      {children}
    </FundingContext.Provider>
  );
};

export const useFunding = () => {
  const context = useContext(FundingContext);
  if (context === undefined) {
    throw new Error('useFunding must be used within a FundingProvider');
  }
  return context;
};
