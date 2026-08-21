import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getFundingOffers, createFundingOffer, updateFundingOffer, addNotification } from '../utils/localStorageHelper';

export interface IAgreementDetails {
  startupName: string;
  founderName: string;
  investorName: string;
  dealId: string;
  agreementDate: string;
  agreementExpiryDate: string;
  offerAmount: number;
  currency: string;
  equityPercentage: number;
  preMoneyValuation?: number;
  postMoneyValuation?: number;
  valuation?: number;
  fundingType?: string;
  investmentType?: string;
  expectedFundingDate?: string;
  investmentTerms?: string;
  equityTerms?: string;
  investorRights?: string;
  founderObligations?: string;
  useOfFunds?: string;
  milestones?: string;
  exitTerms?: string;
  confidentialityTerms?: string;
  additionalConditions?: string;
  uploadedDocument?: string;
  uploadedDocumentName?: string;
  supportingDocuments?: string;
  supportingDocumentsName?: string;
  specialClauses?: string;
  
  // Template & Manual Creation fields
  creationMethod?: 'manual' | 'template';
  businessCategory?: string;
  templateId?: string;
  templateName?: string;
  templateVersion?: string;
  agreementType?: string;
  agreementContent?: string;
  
  // Template Specific Parameters
  valuationCap?: number;
  discount?: number;
  interestRate?: number;
  maturityDate?: string;
  conversionEvent?: string;
  proRataRights?: string;
  proposedClosingDate?: string;
  shareTerms?: string;

  version: string;
  createdAt: string;
  createdBy: string;
}

export interface IAgreementAuditTrail {
  action: string;
  performedBy: string;
  role: string;
  notes?: string;
  timestamp: string;
}

export interface FundingOffer {
  id: string;
  _id?: string;
  startupId: string;
  startupName: string;
  founderId: string;
  founderName: string;
  founderEmail?: string;
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
  status: 'offer_received' | 'accepted' | 'counter_offer' | 'rejected' | 'funded' | 'funding_pending' | 'payment_pending' | 'payment_submitted' | 'under_verification' | 'completed' | 'failed';
  agreementStatus?: string;
  dueDiligenceStatus?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  paymentReference?: string;
  paymentProof?: string;
  paymentDate?: string;
  verificationStatus?: string;
  stage?: string;
  commitmentId?: string;
  transactionId?: string;
  fundingRound?: string;
  expectedInvestmentDate?: string;
  commitmentNotes?: string;
  commissionRate?: number;
  commissionAmount?: number;
  commissionStatus?: 'Pending' | 'Fixed' | 'Sent to Admin' | 'Collected';
  commissionNotes?: string;
  commissionUpdatedAt?: string;
  commissionFixedBy?: string;
  commissionPaymentMode?: 'bank' | 'upi_qr' | 'both';
  commissionBankDetails?: {
    accountHolder?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
  };
  commissionUpiDetails?: {
    selectedUpiApp?: 'gpay' | 'paytm' | 'phonepe' | 'all';
    paytmUpi?: string;
    gpayUpi?: string;
    phonepeUpi?: string;
  };
  agreementId?: string;
  agreementVersion?: string;
  creationMethod?: 'manual' | 'template';
  businessCategory?: string;
  agreementType?: string;
  templateId?: string;
  templateVersion?: string;
  fundingLockStatus?: 'locked' | 'unlocked';
  investorSignedAt?: string;
  investorSignatureName?: string;
  investorSignatureFontIndex?: number;
  founderSignedAt?: string;
  founderSignatureName?: string;
  founderSignatureFontIndex?: number;
  agreementAcknowledged?: boolean;
  agreementDetails?: IAgreementDetails;
  agreementVersions?: IAgreementDetails[];
  agreementAuditTrail?: IAgreementAuditTrail[];
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

interface FundingContextType {
  offers: FundingOffer[];
  loading: boolean;
  sendOffer: (offerData: Omit<FundingOffer, 'id' | '_id' | 'status' | 'history' | 'createdAt' | 'updatedAt' | 'founderResponse' | 'counterOffer' | 'adminNote'>) => Promise<void>;
  respondToOffer: (offerId: string, responseType: 'accepted' | 'rejected' | 'counter_offer', details: { message?: string, counterAmount?: number, counterEquity?: number }) => Promise<void>;
  markAsFunded: (offerId: string, adminNote: string, adminName: string) => Promise<void>;
  getFounderOffers: (founderId: string) => FundingOffer[];
  getStartupOffers: (startupId: string, startupName?: string) => FundingOffer[];
  updateOfferAdminNote: (offerId: string, note: string) => Promise<void>;
  verifyOffer: (offerId: string, adminName: string) => Promise<void>;
  updateOfferDetails: (offerId: string, updates: Partial<FundingOffer>) => Promise<void>;
  refreshOffers: () => Promise<void>;
}

const FundingContext = createContext<FundingContextType | undefined>(undefined);

const getOfferId = (offer: FundingOffer) => offer._id || offer.id;

export const FundingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [offers, setOffers] = useState<FundingOffer[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshOffers = async () => {
    try {
      const data = await getFundingOffers();
      setOffers(data || []);
    } catch (e) {
      console.error('Failed to refresh offers', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshOffers();
  }, []);

  const sendOffer = async (offerData: Omit<FundingOffer, 'id' | '_id' | 'status' | 'history' | 'createdAt' | 'updatedAt' | 'founderResponse' | 'counterOffer' | 'adminNote'>) => {
    const created = await createFundingOffer(offerData);
    if (created) {
      setOffers(prev => [created, ...prev]);
      // Notify Founder
      await addNotification({
        userId: offerData.founderId,
        title: 'New Funding Offer Received',
        message: `${offerData.investorName} from ${offerData.investorCompany} sent a funding offer for your startup.`,
        type: 'funding',
        actionUrl: '/dashboard/founder/funding',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      // Notify Admin
      await addNotification({
        userId: 'admin',
        title: 'New Funding Offer Created',
        message: `Investor sent a funding offer to ${offerData.founderName}.`,
        type: 'funding',
        actionUrl: '/dashboard/admin/startups',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  };

  const respondToOffer = async (offerId: string, responseType: 'accepted' | 'rejected' | 'counter_offer', details: { message?: string, counterAmount?: number, counterEquity?: number }) => {
    const offer = offers.find(o => getOfferId(o) === offerId);
    if (!offer) return;

    const historyEntry = {
      action: responseType,
      performedBy: offer.founderName,
      role: 'Founder',
      message: responseType === 'accepted' ? 'Founder accepted the funding offer.' :
               responseType === 'rejected' ? 'Founder rejected the funding offer.' :
               'Founder sent a counter offer.',
      createdAt: new Date().toISOString(),
    };

    const updates: any = {
      status: responseType,
      history: [...offer.history, historyEntry],
      updatedAt: new Date().toISOString(),
    };

    if (responseType === 'accepted') {
      updates.agreementStatus = 'Pending Investor Signature';
      updates.agreementId = offer.agreementId || `AGR-2026-${offerId.slice(-4).toUpperCase()}`;
      updates.agreementVersion = 'v1.0';
      updates.investorSignedAt = '';
      updates.investorSignatureName = '';
      updates.investorSignatureFontIndex = 0;
      updates.founderSignedAt = '';
      updates.founderSignatureName = '';
      updates.founderSignatureFontIndex = 0;
    }

    if (responseType === 'rejected') updates.founderResponse = details.message || '';
    if (responseType === 'counter_offer') {
      updates.counterOffer = {
        amount: details.counterAmount || null,
        equityPercentage: details.counterEquity || null,
        message: details.message || '',
      };
    }

    const updated = await updateFundingOffer(offerId, updates);
    if (updated) {
      setOffers(prev => prev.map(o => getOfferId(o) === offerId ? { ...o, ...updates } : o));

      if (responseType === 'accepted') {
        await addNotification({ userId: offer.investorId, title: 'Funding Offer Accepted', message: 'Founder accepted your funding offer.', type: 'funding', actionUrl: '/dashboard/investor/portfolio-hub', isRead: false, createdAt: new Date().toISOString() });
        await addNotification({ userId: 'admin', title: 'Founder Accepted Funding Offer', message: `${offer.founderName} accepted the offer from ${offer.investorCompany}.`, type: 'funding', actionUrl: '/dashboard/admin/startups', isRead: false, createdAt: new Date().toISOString() });
      } else if (responseType === 'rejected') {
        await addNotification({ userId: offer.investorId, title: 'Funding Offer Rejected', message: 'Founder rejected your funding offer.', type: 'funding', actionUrl: '/dashboard/investor/portfolio-hub', isRead: false, createdAt: new Date().toISOString() });
        await addNotification({ userId: 'admin', title: 'Founder Rejected Funding Offer', message: `${offer.founderName} rejected the offer from ${offer.investorCompany}.`, type: 'funding', actionUrl: '/dashboard/admin/startups', isRead: false, createdAt: new Date().toISOString() });
      } else if (responseType === 'counter_offer') {
        await addNotification({ userId: offer.investorId, title: 'Counter Offer Received', message: 'Founder sent a counter offer.', type: 'funding', actionUrl: '/dashboard/investor/portfolio-hub', isRead: false, createdAt: new Date().toISOString() });
        await addNotification({ userId: 'admin', title: 'Counter Offer Sent', message: `${offer.founderName} sent a counter offer to ${offer.investorCompany}.`, type: 'funding', actionUrl: '/dashboard/admin/startups', isRead: false, createdAt: new Date().toISOString() });
      }
    }
  };

  const markAsFunded = async (offerId: string, note: string, adminName: string) => {
    const offer = offers.find(o => getOfferId(o) === offerId);
    if (!offer) return;

    const updates = {
      status: 'funded' as const,
      adminNote: note,
      history: [...offer.history, {
        action: 'funded',
        performedBy: adminName,
        role: 'Admin',
        message: 'Admin verified and marked the offer as funded.',
        createdAt: new Date().toISOString(),
      }],
      updatedAt: new Date().toISOString(),
    };

    const updated = await updateFundingOffer(offerId, updates);
    if (updated) {
      setOffers(prev => prev.map(o => getOfferId(o) === offerId ? { ...o, ...updates } : o));
      if (offer.founderId) await addNotification({ userId: offer.founderId, title: 'Funding Confirmed', message: `Admin verified your $${offer.offerAmount.toLocaleString()} funding offer from ${offer.investorCompany} as Funded!`, type: 'funding', actionUrl: '/dashboard/founder/funding', isRead: false, createdAt: new Date().toISOString() });
      if (offer.investorId) await addNotification({ userId: offer.investorId, title: 'Funding Confirmed', message: `Admin verified your $${offer.offerAmount.toLocaleString()} investment in ${offer.startupName} as Funded!`, type: 'funding', actionUrl: '/dashboard/investor/portfolio-hub', isRead: false, createdAt: new Date().toISOString() });
      await addNotification({ userId: 'admin', title: 'Funding Completed', message: `You verified and marked ${offer.startupName} ($${offer.offerAmount.toLocaleString()}) as Funded.`, type: 'funding', actionUrl: '/dashboard/admin/startups', isRead: false, createdAt: new Date().toISOString() });
    }
  };

  const updateOfferAdminNote = async (offerId: string, note: string) => {
    const updates = { adminNote: note, updatedAt: new Date().toISOString() };
    await updateFundingOffer(offerId, updates);
    setOffers(prev => prev.map(o => getOfferId(o) === offerId ? { ...o, ...updates } : o));
  };

  const verifyOffer = async (offerId: string, adminName: string) => {
    const offer = offers.find(o => getOfferId(o) === offerId);
    if (!offer) return;

    const updates = {
      status: 'funded' as const,
      history: [...offer.history, {
        action: 'verified',
        performedBy: adminName,
        role: 'Admin',
        message: 'Admin completed the offline document and compliance verification checks.',
        createdAt: new Date().toISOString(),
      }],
      updatedAt: new Date().toISOString(),
    };

    const updated = await updateFundingOffer(offerId, updates);
    if (updated) {
      setOffers(prev => prev.map(o => getOfferId(o) === offerId ? { ...o, ...updates } : o));
      if (offer.founderId) await addNotification({ userId: offer.founderId, title: 'Offer & Startup Verified', message: `Admin verified your funding offer from ${offer.investorCompany || offer.investorName} ($${offer.offerAmount.toLocaleString()}) for ${offer.startupName}.`, type: 'funding', actionUrl: '/dashboard/founder/funding', isRead: false, createdAt: new Date().toISOString() });
      if (offer.investorId) await addNotification({ userId: offer.investorId, title: 'Investment Verified & Active', message: `Admin verified your $${offer.offerAmount.toLocaleString()} funding offer for ${offer.startupName}.`, type: 'funding', actionUrl: '/dashboard/investor/portfolio-hub', isRead: false, createdAt: new Date().toISOString() });
      await addNotification({ userId: 'admin', title: 'Offer Verified', message: `You verified the funding offer and activated ${offer.startupName}.`, type: 'funding', actionUrl: '/dashboard/admin/startups', isRead: false, createdAt: new Date().toISOString() });
    }
  };
  
  const updateOfferDetails = async (offerId: string, updates: Partial<FundingOffer>) => {
    const offer = offers.find(o => getOfferId(o) === offerId);
    if (!offer) return;
    const finalUpdates = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    const updated = await updateFundingOffer(offerId, finalUpdates);
    if (updated) {
      setOffers(prev => prev.map(o => getOfferId(o) === offerId ? { ...o, ...finalUpdates } : o));
    }
  };

  const getFounderOffers = (founderId: string) =>
    offers.filter(o => o.founderId === founderId);

  const getStartupOffers = (startupId: string, startupName?: string) =>
    offers
      .filter(o => o.startupId === startupId || (startupName && o.startupName.toLowerCase() === startupName.toLowerCase()))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <FundingContext.Provider value={{ offers, loading, sendOffer, respondToOffer, markAsFunded, getFounderOffers, getStartupOffers, updateOfferAdminNote, verifyOffer, updateOfferDetails, refreshOffers }}>
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
