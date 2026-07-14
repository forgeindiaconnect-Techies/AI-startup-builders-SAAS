import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

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
  getStartupOffers: (startupId: string, startupName?: string) => FundingOffer[];
  updateOfferAdminNote: (offerId: string, note: string) => void;
  verifyOffer: (offerId: string, adminName: string) => void;
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

  const markAsFunded = (offerId: string, note: string, adminName: string) => {
    let updatedOffer: any = null;
    setOffers(prev => prev.map(offer => {
      if (offer.id === offerId) {
        updatedOffer = {
          ...offer,
          status: 'funded',
          adminNote: note,
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
        return updatedOffer;
      }
      return offer;
    }));

    if (updatedOffer) {
      try {
        const rawStartups = localStorage.getItem('ai_startup_builder_startups');
        if (rawStartups) {
          let parsedStartups = JSON.parse(rawStartups);
          parsedStartups = parsedStartups.map((s: any) => {
            if (s.startupId === updatedOffer.startupId || s.startupName === updatedOffer.startupName) {
              return { ...s, status: 'generated' };
            }
            return s;
          });
          localStorage.setItem('ai_startup_builder_startups', JSON.stringify(parsedStartups));
        }
        if (updatedOffer.startupId && localStorage.getItem(updatedOffer.startupId)) {
          const single = JSON.parse(localStorage.getItem(updatedOffer.startupId) || '{}');
          single.status = 'generated';
          localStorage.setItem(updatedOffer.startupId, JSON.stringify(single));
        }
      } catch (e) {}

      try {
        const storedPortfolio = localStorage.getItem('ai_startup_builder_portfolio');
        if (storedPortfolio) {
          let parsed = JSON.parse(storedPortfolio);
          parsed = parsed.map((item: any) => {
            if (`portfolio_${offerId}` === item.id || item.startupName === updatedOffer.startupName) {
              return { ...item, status: 'funded', updatedAt: new Date().toISOString() };
            }
            return item;
          });
          localStorage.setItem('ai_startup_builder_portfolio', JSON.stringify(parsed));
        }
      } catch (e) {}

      // Notify Founder and Investor
      if (updatedOffer.founderId) {
        addNotification(updatedOffer.founderId, "Funding Confirmed", `Admin verified and marked your $${updatedOffer.offerAmount.toLocaleString()} funding offer from ${updatedOffer.investorCompany} as Funded!`, "/dashboard/founder/funding");
      }

      if (updatedOffer.investorId) {
        addNotification(updatedOffer.investorId, "Funding Confirmed", `Admin verified and marked your $${updatedOffer.offerAmount.toLocaleString()} investment in ${updatedOffer.startupName} as Funded!`, "/dashboard/investor/portfolio-hub");
      }

      addNotification("admin", "Funding Completed", `You verified and marked ${updatedOffer.startupName} ($${updatedOffer.offerAmount.toLocaleString()}) as Funded.`, "/dashboard/admin/startups");
    }
  };

  const updateOfferAdminNote = (offerId: string, note: string) => {
    setOffers(prev => prev.map(offer => {
      if (offer.id === offerId) {
        return {
          ...offer,
          adminNote: note,
          updatedAt: new Date().toISOString()
        };
      }
      return offer;
    }));
  };

  const verifyOffer = (offerId: string, adminName: string) => {
    let verifiedOffer: any = null;
    setOffers(prev => prev.map(offer => {
      if (offer.id === offerId) {
        const updatedOffer = {
          ...offer,
          status: 'funded' as FundingOffer['status'],
          updatedAt: new Date().toISOString(),
          history: [...offer.history]
        };
        updatedOffer.history.push({
          action: 'verified',
          performedBy: adminName,
          role: 'Admin',
          message: 'Admin completed the offline document and compliance verification checks.',
          createdAt: new Date().toISOString()
        });
        verifiedOffer = updatedOffer;
        return updatedOffer;
      }
      return offer;
    }));

    if (verifiedOffer) {
      try {
        const rawStartups = localStorage.getItem('ai_startup_builder_startups');
        if (rawStartups) {
          let parsedStartups = JSON.parse(rawStartups);
          parsedStartups = parsedStartups.map((s: any) => {
            if (s.startupId === verifiedOffer.startupId || s.startupName === verifiedOffer.startupName) {
              return { ...s, status: 'generated' };
            }
            return s;
          });
          localStorage.setItem('ai_startup_builder_startups', JSON.stringify(parsedStartups));
        }
        if (verifiedOffer.startupId && localStorage.getItem(verifiedOffer.startupId)) {
          const single = JSON.parse(localStorage.getItem(verifiedOffer.startupId) || '{}');
          single.status = 'generated';
          localStorage.setItem(verifiedOffer.startupId, JSON.stringify(single));
        }
      } catch (e) {}

      try {
        const storedPortfolio = localStorage.getItem('ai_startup_builder_portfolio');
        if (storedPortfolio) {
          let parsed = JSON.parse(storedPortfolio);
          parsed = parsed.map((item: any) => {
            if (`portfolio_${offerId}` === item.id || item.startupName === verifiedOffer.startupName) {
              return { ...item, status: 'verified', updatedAt: new Date().toISOString() };
            }
            return item;
          });
          localStorage.setItem('ai_startup_builder_portfolio', JSON.stringify(parsed));
        }
      } catch (e) {}

      if (verifiedOffer.founderId) {
        addNotification(
          verifiedOffer.founderId,
          "Offer & Startup Verified",
          `Admin verified your funding offer from ${verifiedOffer.investorCompany || verifiedOffer.investorName} ($${verifiedOffer.offerAmount.toLocaleString()}) for ${verifiedOffer.startupName}. Your startup status is now Active!`,
          "/dashboard/founder/funding"
        );
      }

      if (verifiedOffer.investorId) {
        addNotification(
          verifiedOffer.investorId,
          "Investment Verified & Active",
          `Admin verified your $${verifiedOffer.offerAmount.toLocaleString()} funding offer for ${verifiedOffer.startupName}. The investment is verified and active!`,
          "/dashboard/investor/portfolio-hub"
        );
      }

      addNotification(
        "admin",
        "Offer Verified",
        `You verified the funding offer and activated ${verifiedOffer.startupName}.`,
        "/dashboard/admin/startups"
      );
    }
  };

  const getFounderOffers = (founderId: string) => 
    offers.filter(o => o.founderId === founderId);
  const getStartupOffers = (startupId: string, startupName?: string) => 
    offers.filter(o => o.startupId === startupId || (startupName && o.startupName.toLowerCase() === startupName.toLowerCase())).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <FundingContext.Provider value={{ offers, sendOffer, respondToOffer, markAsFunded, getFounderOffers, getStartupOffers, updateOfferAdminNote, verifyOffer }}>
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
