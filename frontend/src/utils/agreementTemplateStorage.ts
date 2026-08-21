export interface ITemplateClause {
  id: string;
  title: string;
  content: string;
  isEditable: boolean;
}

export interface IAgreementTemplate {
  id: string;
  name: string;
  businessCategory: string; // e.g. 'FinTech', 'SaaS', 'HealthTech', 'EdTech', 'Travel / Tourism', 'E-commerce', 'AI / Machine Learning', 'Marketplace', 'General'
  agreementType: 'Equity Investment Agreement' | 'SAFE Agreement' | 'Convertible Note' | 'Term Sheet' | 'Custom Investment Agreement';
  version: string;
  status: 'Active' | 'Inactive' | 'Archived';
  description?: string;
  clauses: ITemplateClause[];
  requiredFields: string[];
  optionalFields: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

export const ALL_BUSINESS_CATEGORIES = [
  'SaaS',
  'FinTech',
  'HealthTech',
  'EdTech',
  'E-commerce',
  'AI / Machine Learning',
  'Marketplace',
  'Consumer Products',
  'CleanTech',
  'DeepTech',
  'Media / Entertainment',
  'Logistics',
  'Travel / Tourism',
  'Other'
];

export const STANDARD_AGREEMENT_TYPES = [
  'Equity Investment Agreement',
  'SAFE Agreement',
  'Convertible Note',
  'Term Sheet',
  'Custom Investment Agreement'
] as const;

// ─── System Pre-populated Agreement Templates ──────────────────────────────────
const DEFAULT_TEMPLATES: IAgreementTemplate[] = [
  // 1. FinTech Investment Agreement
  {
    id: 'tmpl_fintech_equity_v1',
    name: 'FinTech Investment Agreement',
    businessCategory: 'FinTech',
    agreementType: 'Equity Investment Agreement',
    version: '1.2',
    status: 'Active',
    description: 'Regulated FinTech equity subscription agreement with banking compliance, RBI guidelines, and data security clauses.',
    requiredFields: ['Investment Amount', 'Equity %', 'Valuation', 'Investor Rights', 'Funding Conditions'],
    optionalFields: ['Milestones / Conditions', 'Exit / Transfer Terms'],
    createdBy: 'System Platform',
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-02-15T10:00:00.000Z',
    usageCount: 48,
    clauses: [
      { id: 'c1', title: 'Parties & Recitals', content: 'This Equity Investment Agreement is entered into by and between the Investor and the FinTech Issuer Company.', isEditable: false },
      { id: 'c2', title: 'Regulatory Compliance & Data Privacy', content: 'The Founder covenants that the FinTech product strictly complies with RBI / regulatory guidelines, PCI-DSS compliance, and user financial data protection standards.', isEditable: false },
      { id: 'c3', title: 'Equity Allocation & Share Issuance', content: 'In consideration of the Investment Amount, the Issuer shall issue fully paid equity preference shares representing the agreed Equity % within 30 days.', isEditable: false },
      { id: 'c4', title: 'Investor Protection & Information Rights', content: 'Investor shall receive monthly transaction volume updates, quarterly audited reports, and key risk compliance dashboards.', isEditable: true },
      { id: 'c5', title: 'Use of Funds', content: 'Capital allocated strictly towards payment gateway infrastructure, security audit compliance, AI fraud detection, and regulatory licensing.', isEditable: true },
      { id: 'c6', title: 'Dispute Resolution & Governing Law', content: 'Governed by the laws of India. Arbitration shall take place in Bengaluru, Karnataka.', isEditable: false }
    ]
  },
  // 2. Travel / Tourism Investment Agreement (Matches Tourists startup)
  {
    id: 'tmpl_tourism_equity_v1',
    name: 'Travel / Tourism Investment Agreement',
    businessCategory: 'Travel / Tourism',
    agreementType: 'Equity Investment Agreement',
    version: '1.0',
    status: 'Active',
    description: 'Tailored investment agreement for travel, tour guide platforms, and hospitality tech ventures.',
    requiredFields: ['Investment Amount', 'Equity %', 'Valuation', 'Share Terms', 'Investor Rights'],
    optionalFields: ['Milestones / Conditions', 'Use of Funds'],
    createdBy: 'System Platform',
    createdAt: '2026-01-20T10:00:00.000Z',
    updatedAt: '2026-02-20T10:00:00.000Z',
    usageCount: 32,
    clauses: [
      { id: 'c1', title: 'Parties & Overview', content: 'Agreement between Investor and Travel / Tourism Startup Company for primary equity subscription.', isEditable: false },
      { id: 'c2', title: 'Guide Onboarding & Operational Milestones', content: 'Founder covenants to expand verified local tour guide network, implement safety protocols, and build mobile booking infrastructure.', isEditable: true },
      { id: 'c3', title: 'Equity Stake & Valuation', content: 'Capital deployed for agreed Equity % based on post-money valuation.', isEditable: false },
      { id: 'c4', title: 'Investor Information Rights', content: 'Quarterly financial reporting, booking GMV metrics, and annual audited accounts provided to Investor.', isEditable: true }
    ]
  },
  // 3. HealthTech Investment Agreement
  {
    id: 'tmpl_healthtech_note_v1',
    name: 'HealthTech Investment Agreement',
    businessCategory: 'HealthTech',
    agreementType: 'Convertible Note',
    version: '1.1',
    status: 'Active',
    description: 'Investment agreement tailored for digital health, clinical AI, and patient privacy compliance ventures.',
    requiredFields: ['Principal Amount', 'Interest Rate', 'Maturity Date', 'Valuation Cap', 'Discount'],
    optionalFields: ['Conversion Event', 'Investor Rights'],
    createdBy: 'System Platform',
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-02-18T10:00:00.000Z',
    usageCount: 26,
    clauses: [
      { id: 'c1', title: 'Principal & Interest Terms', content: 'Investor advances the Principal Amount bearing simple annual interest. The note matures on the specified Maturity Date unless converted prior.', isEditable: false },
      { id: 'c2', title: 'Clinical Compliance & Privacy Safeguards', content: 'Company warrants full compliance with patient privacy laws, healthcare data security, and medical board accreditations.', isEditable: false },
      { id: 'c3', title: 'Note Conversion Mechanics', content: 'Converts automatically into preference shares upon qualified financing at the specified valuation cap or discount.', isEditable: false },
      { id: 'c4', title: 'Intellectual Property Ownership', content: '100% of medical software code, clinical IP, algorithms, and patents are owned exclusively by the Issuer Company.', isEditable: true }
    ]
  },
  // 4. EdTech Investment Agreement
  {
    id: 'tmpl_edtech_termsheet_v1',
    name: 'EdTech Investment Agreement',
    businessCategory: 'EdTech',
    agreementType: 'Equity Investment Agreement',
    version: '1.0',
    status: 'Active',
    description: 'Investment agreement designed for educational technology platforms, LMS software, and ed-skills ventures.',
    requiredFields: ['Investment Amount', 'Equity %', 'Valuation', 'Share Terms', 'Investor Rights'],
    optionalFields: ['Milestones / Conditions', 'Use of Funds'],
    createdBy: 'System Platform',
    createdAt: '2026-01-22T10:00:00.000Z',
    updatedAt: '2026-02-12T10:00:00.000Z',
    usageCount: 19,
    clauses: [
      { id: 'c1', title: 'Parties & Overview', content: 'Agreement between Investor and EdTech Company for primary equity investment.', isEditable: false },
      { id: 'c2', title: 'EdTech Content & LMS IP Ownership', content: 'All course content, AI tutor models, LMS code, and student analytics engines remain exclusive IP of the Issuer Company.', isEditable: true },
      { id: 'c3', title: 'User Metric Transparency', content: 'Founder covenants to share monthly active student users (MAU), course completion rates, and subscription retention metrics.', isEditable: true }
    ]
  },
  // 5. SaaS Growth SAFE Agreement
  {
    id: 'tmpl_saas_safe_v1',
    name: 'SaaS Growth SAFE Agreement',
    businessCategory: 'SaaS',
    agreementType: 'SAFE Agreement',
    version: '1.0',
    status: 'Active',
    description: 'Simple Agreement for Future Equity optimized for B2B/B2C recurring revenue SaaS startups.',
    requiredFields: ['Investment Amount', 'Valuation Cap', 'Discount', 'Conversion Event'],
    optionalFields: ['Pro-Rata Rights', 'Use of Funds'],
    createdBy: 'System Platform',
    createdAt: '2026-01-12T10:00:00.000Z',
    updatedAt: '2026-02-10T10:00:00.000Z',
    usageCount: 65,
    clauses: [
      { id: 'c1', title: 'Parties & Recitals', content: 'This Simple Agreement for Future Equity (SAFE) is executed by the Investor and the SaaS Issuer Company.', isEditable: false },
      { id: 'c2', title: 'Conversion Events', content: 'This SAFE automatically converts into Equity Preference Shares upon a Equity Financing Round, Liquidity Event, or Dissolution Event at the Valuation Cap or Discount Rate, whichever produces a lower share price.', isEditable: false },
      { id: 'c3', title: 'Pro-Rata Participation', content: 'Investor reserves pro-rata rights to participate in future qualified funding rounds up to their proportional stake.', isEditable: true },
      { id: 'c4', title: 'ARR & Metrics Transparency', content: 'Founder covenants to share quarterly ARR (Annual Recurring Revenue), CAC, LTV, and customer churn metrics with the Investor.', isEditable: true }
    ]
  },
  // 6. Standard Equity Investment Agreement
  {
    id: 'tmpl_general_equity_v1',
    name: 'Equity Investment Agreement',
    businessCategory: 'General',
    agreementType: 'Equity Investment Agreement',
    version: '1.0',
    status: 'Active',
    description: 'Standard multi-industry equity investment agreement in exchange for agreed equity percentage.',
    requiredFields: ['Investment Amount', 'Equity %', 'Valuation', 'Share Terms', 'Investor Rights'],
    optionalFields: ['Use of Funds', 'Milestones / Conditions', 'Exit / Transfer Terms'],
    createdBy: 'System Platform',
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-02-01T10:00:00.000Z',
    usageCount: 140,
    clauses: [
      { id: 'c1', title: 'Parties & Investment Terms', content: 'General equity subscription agreement for startup funding.', isEditable: false },
      { id: 'c2', title: 'Share Issuance & Governance', content: 'Issuer shall issue shares and maintain standard board governance.', isEditable: false },
      { id: 'c3', title: 'Confidentiality & Non-Disclosure', content: 'Both parties agree to strict confidentiality of business operations.', isEditable: false }
    ]
  },
  // 7. Standard SAFE Agreement
  {
    id: 'tmpl_general_safe_v1',
    name: 'SAFE Agreement',
    businessCategory: 'General',
    agreementType: 'SAFE Agreement',
    version: '1.0',
    status: 'Active',
    description: 'Simple Agreement for Future Equity made in exchange for future equity under specified conversion conditions.',
    requiredFields: ['Investment Amount', 'Valuation Cap', 'Discount', 'Conversion Event'],
    optionalFields: ['Pro-Rata Rights'],
    createdBy: 'System Platform',
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-02-01T10:00:00.000Z',
    usageCount: 180,
    clauses: [
      { id: 'c1', title: 'SAFE Overview', content: 'Simple Agreement for Future Equity for early-stage capital raising.', isEditable: false },
      { id: 'c2', title: 'Conversion Trigger', content: 'Converts into equity upon next qualified round at valuation cap or discount.', isEditable: false }
    ]
  },
  // 8. Standard Convertible Note
  {
    id: 'tmpl_general_note_v1',
    name: 'Convertible Note',
    businessCategory: 'General',
    agreementType: 'Convertible Note',
    version: '1.0',
    status: 'Active',
    description: 'Investment structured as a note bearing interest that may convert into equity preference shares.',
    requiredFields: ['Principal Amount', 'Interest Rate', 'Maturity Date', 'Valuation Cap', 'Discount', 'Conversion Event'],
    optionalFields: ['Investor Rights'],
    createdBy: 'System Platform',
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-02-01T10:00:00.000Z',
    usageCount: 55,
    clauses: [
      { id: 'c1', title: 'Note Debt Terms', content: 'Principal sum with simple interest payable or convertible at maturity.', isEditable: false }
    ]
  },
  // 9. Standard Term Sheet
  {
    id: 'tmpl_general_termsheet_v1',
    name: 'Term Sheet',
    businessCategory: 'General',
    agreementType: 'Term Sheet',
    version: '1.0',
    status: 'Active',
    description: 'Summary of proposed investment terms before executing the final legal agreement.',
    requiredFields: ['Proposed Investment', 'Valuation', 'Equity', 'Key Terms', 'Conditions', 'Proposed Closing Date'],
    optionalFields: ['Additional Conditions'],
    createdBy: 'System Platform',
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-02-01T10:00:00.000Z',
    usageCount: 82,
    clauses: [
      { id: 'c1', title: 'Proposed Parameters', content: 'Overview of commercial investment parameters.', isEditable: false }
    ]
  },
  // 10. Custom Investment Agreement
  {
    id: 'tmpl_general_custom_v1',
    name: 'Custom Investment Agreement',
    businessCategory: 'General',
    agreementType: 'Custom Investment Agreement',
    version: '1.0',
    status: 'Active',
    description: 'For approved investment structures that require customized terms and special clauses.',
    requiredFields: ['Investment Amount', 'Equity %', 'Valuation', 'Investment Terms'],
    optionalFields: ['Milestones / Conditions', 'Use of Funds', 'Investor Rights', 'Founder Obligations'],
    createdBy: 'System Platform',
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-02-01T10:00:00.000Z',
    usageCount: 90,
    clauses: [
      { id: 'c1', title: 'Custom Deal Terms', content: 'Customized investment structure terms agreed between parties.', isEditable: true }
    ]
  }
];

const STORAGE_KEY = 'ai_startup_builder_agreement_templates';

export const getAgreementTemplates = (): IAgreementTemplate[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TEMPLATES));
      return DEFAULT_TEMPLATES;
    }
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_TEMPLATES;
  }
};

export const saveAgreementTemplates = (templates: IAgreementTemplate[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch (e) {
    console.error('Failed to save agreement templates to storage', e);
  }
};

export const getTemplatesForCategoryAndType = (category: string, type?: string): IAgreementTemplate[] => {
  const templates = getAgreementTemplates().filter(t => t.status === 'Active');
  
  const catLower = (category || '').toLowerCase();

  // Find business category matched templates
  const categoryMatched = templates.filter(t => {
    const tCatLower = t.businessCategory.toLowerCase();
    if (tCatLower === catLower) return true;
    if (catLower.includes('travel') && tCatLower.includes('travel')) return true;
    if (catLower.includes('tour') && tCatLower.includes('travel')) return true;
    if (catLower.includes('fintech') && tCatLower.includes('fintech')) return true;
    if (catLower.includes('health') && tCatLower.includes('health')) return true;
    if (catLower.includes('edtech') && tCatLower.includes('edtech')) return true;
    if (catLower.includes('saas') && tCatLower.includes('saas')) return true;
    return false;
  });

  const generalMatched = templates.filter(t => t.businessCategory.toLowerCase() === 'general');

  const combinedMap = new Map<string, IAgreementTemplate>();
  [...categoryMatched, ...generalMatched].forEach(t => combinedMap.set(t.id, t));
  let combined = Array.from(combinedMap.values());

  if (type) {
    combined = combined.filter(t => t.agreementType === type);
  }

  return combined;
};
