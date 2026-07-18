export const getStartups = () => {
  const keys = Object.keys(localStorage);
  const locals: any[] = [];
  keys.forEach(key => {
    if (key.startsWith('startup_')) {
      try {
        locals.push(JSON.parse(localStorage.getItem(key) || ''));
      } catch (e) {}
    }
  });
  return locals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const saveStartups = (startups: any[]) => {
  startups.forEach(s => {
    localStorage.setItem(s.startupId || s.id, JSON.stringify(s));
  });
};

export const getStartupById = (startupId: string) => {
  try {
    const data = localStorage.getItem(startupId);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

export const createStartupDraft = (startupName: string, startupIdea: string) => {
  const startupId = `startup_${Date.now()}`;
  const newStartupData = {
    id: startupId,
    startupId,
    founderId: "current_user",
    startupName,
    startupIdea,
    status: 'pending_analysis',
    approvalStatus: 'pending',
    aiGenerated: null,
    roadmap: [],
    tasks: [],
    isSavedToMyStartups: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(startupId, JSON.stringify(newStartupData));
  return newStartupData;
};

export const updateStartup = (startupId: string, updatedData: any) => {
  const existing = getStartupById(startupId);
  if (existing) {
    const updated = { ...existing, ...updatedData, updatedAt: new Date().toISOString() };
    localStorage.setItem(startupId, JSON.stringify(updated));
    return updated;
  }
  return null;
};

export const getNotifications = () => {
  try {
    const data = localStorage.getItem('ai_startup_builder_notifications');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const addNotification = (notification: any) => {
  const current = getNotifications();
  const updated = [notification, ...current];
  localStorage.setItem('ai_startup_builder_notifications', JSON.stringify(updated));
  return updated;
};

export const detectStartupCategory = (startup: any): string => {
  const text = (startup.startupIdea || startup.startupName || '').toLowerCase();

  if (/restaurant|cafe|coffee|tea|snack|bakery|food|cook|kitchen|dining|bar |pub |pizza|burger|bistro|delivery food|food deliver|catering|mess |tiffin|juice|smoothie|ice cream|sweet|confection|dessert|brew|roast|grill|BBQ|tandoor|shawarma|momos|noodle|rice|curry|spice|masala|organic food|health food|pet food|packaged food|food truck|food stall|food cart|cloud kitchen|dark kitchen|home kitchen|tiffin service|canteen|cafeteria/.test(text)) {
    return 'Food / Restaurant / Cafe';
  }
  if (/saas|software|ai |artificial intelligence|machine learning|deep learning|app |application|platform|cloud|api |data |analytics|automation|blockchain|web3|iot|cyber|mobile app|web app|web development|mobile development|devops|fintech platform|edtech platform|healthtech|martech|hrtech|cleantech|gam|vr |ar |virtual reality|augmented reality|chatbot|chat bot|saas platform|erp|crm|cms|lms platform|project management|team collaboration|productivity tool|no code|low code|no-code|low-code|open source|developer tool|api platform/.test(text)) {
    return 'SaaS / Software / AI';
  }
  if (/hospital|clinic|health|medical|doctor|nurse|dental|therapy|wellness|telemedicine|diagnostic|pharma|drug|medicine|ayurved|yoga|fitness|gym|mental health|counsel|psych|nutrition|diet|supplement|ambulance|health care|healthcare|biotech|medtech|surgical|patholog|radiolog|blood bank|organ|transplant|nursing|elder care|senior care|child care|pediatr/.test(text)) {
    return 'Healthcare / Clinic / Hospital';
  }
  if (/ecommerce|e-commerce|online store|marketplace|shopping|retail online|dropship|online shop|online sell|online buy|product listing|multi vendor|vendor platform|buy and sell|auction|b2c marketplace|b2b marketplace|grocery delivery|fashion store|electronics store/.test(text)) {
    return 'E-commerce';
  }
  if (/education|training|learning|school|college|course|tutor|academy|edtech|lms|coaching|institute|university|exam|test prep|competitive exam|skill development|vocational|certification|bootcamp|workshop|seminar|webinar|e-learning|online class|online teach|student|classroom/.test(text)) {
    return 'Education / Training';
  }
  if (/manufactur|factory|production|supply chain|warehouse|industrial|assembly|fabricat|textile|garment|plastic|metal|steel|cement|chemical|pharmaceutical|auto part|component|raw material|plant |mill |packaging|label|batch/.test(text)) {
    return 'Manufacturing';
  }
  if (/retail |shop |store |boutique|supermarket|grocery|convenience store|showroom|outlet|franchise|department store|general store|kirana|mom and pop|local shop|brick and mortar|physical store|retail business|retail shop|retail store/.test(text)) {
    return 'Retail / Local Shop';
  }
  if (/transport|delivery|ride|cab |bike |logistics|fleet|shipping|courier|trucking|freight|moving|relocation|pool|carpool|taxi|auto rickshaw|two wheeler|three wheeler|last mile|first mile|warehousing|cold chain|supply|dispatch/.test(text)) {
    return 'Transport / Delivery';
  }
  if (/finance|fintech|banking|payment|invest|insur|loan|credit|wealth|crypto|lending|neobank|digital bank|upi|wallet|fund|mutual fund|stock|share|trading|forex|remittance|collection|recovery|audit|accounting|tax |gst |ca service|bookkeep|payroll/.test(text)) {
    return 'Finance / FinTech';
  }
  if (/service|consulting|agency|freelanc|cleaning|maintenance|repair|plumb|electric|architect|interior|landscap|Event|wedding|photography|videography|beauty|salon|spa |parlor|tailor|laundry|dry clean|pest control|security|guard|packers|movers|travel|tour|hotel|resort|lodg|guest house|homestay|hostel|real estate|property|broker|co working|cowork|storage/.test(text)) {
    return 'Service Business';
  }
  return 'Other';
};

export const CATEGORY_DOCUMENT_MAP: Record<string, { essential: Array<{ name: string; reason: string; applyLink?: string }>; optional: Array<{ name: string; reason: string; applyLink?: string }> }> = {
  'Food / Restaurant / Cafe': {
    essential: [
      { name: 'PAN Card', reason: 'Mandatory for all businesses in India for tax filing and financial transactions.', applyLink: 'https://www.onlineservices.nsdl.com/paam-endUser-printContact.html' },
      { name: 'Aadhaar Card', reason: 'Identity proof required for PAN application, bank accounts, and government registrations.', applyLink: 'https://uidai.gov.in/' },
      { name: 'FSSAI Registration / License', reason: 'Mandatory food safety license for any business involved in food preparation, processing, or distribution.', applyLink: 'https://foscos.fssai.gov.in/' },
      { name: 'Shop & Establishment Registration', reason: 'Required under state law to legally operate a commercial establishment.', applyLink: '' },
      { name: 'Trade License', reason: 'Local municipal authority permission to carry on a specific trade or business.', applyLink: '' },
      { name: 'GST Registration', reason: 'Required if turnover exceeds the threshold or for inter-state sales and input tax credit.', applyLink: 'https://www.gst.gov.in/' },
      { name: 'Rent Agreement / NOC from Owner', reason: 'Proof of premises for FSSAI, GST, and Shop & Establishment registration.', applyLink: '' },
      { name: 'Business Bank Account Proof', reason: 'Current account in the business name for transactions, GST, and compliance.', applyLink: '' },
    ],
    optional: [
      { name: 'Udyam / MSME Registration', reason: 'Benefits under MSME schemes including subsidized loans and tax relief.', applyLink: 'https://udyamregistration.gov.in/' },
      { name: 'Trademark Certificate', reason: 'Protect your brand name, logo, and tagline from competitors.', applyLink: 'https://ipindiaonline.gov.in/' },
      { name: 'Fire Safety Certificate', reason: 'Required by municipal authority for restaurants and dining establishments.', applyLink: '' },
      { name: 'Pollution Certificate', reason: 'Required if your business generates waste or emissions.', applyLink: '' },
      { name: 'Health / Trade Insurance', reason: 'Protects against liability, property damage, and employee injuries.', applyLink: '' },
    ],
  },
  'SaaS / Software / AI': {
    essential: [
      { name: 'PAN Card', reason: 'Mandatory for all businesses in India for tax filing and financial transactions.', applyLink: 'https://www.onlineservices.nsdl.com/paam-endUser-printContact.html' },
      { name: 'Aadhaar Card', reason: 'Identity proof required for PAN application, bank accounts, and government registrations.', applyLink: 'https://uidai.gov.in/' },
      { name: 'Company Incorporation ( Pvt Ltd / LLP )', reason: 'Legal entity registration for raised funding, signing contracts, and limiting liability.', applyLink: 'https://www.mca.gov.in/' },
      { name: 'GST Registration', reason: 'Required for SaaS billing, interstate transactions, and input tax credit.', applyLink: 'https://www.gst.gov.in/' },
      { name: 'Trademark Registration', reason: 'Protect your product name, logo, and brand from competitors in the tech space.', applyLink: 'https://ipindiaonline.gov.in/' },
      { name: 'Business Bank Account', reason: 'Current account in the company name for investor funds, subscriptions, and vendor payments.', applyLink: '' },
      { name: 'Terms of Service & Privacy Policy', reason: 'Legally required for any SaaS product handling user data. Needed for app stores and payment gateways.', applyLink: '' },
      { name: 'SOC2 / Data Protection Compliance', reason: 'Required for enterprise sales and handling sensitive customer data.', applyLink: '' },
    ],
    optional: [
      { name: 'Udyam / MSME Registration', reason: 'Benefits under MSME schemes including subsidized loans and tax relief.', applyLink: 'https://udyamregistration.gov.in/' },
      { name: 'Startup India Registration', reason: 'Tax holidays, self-certification for labor laws, and easier IP protection.', applyLink: 'https://www.startupindia.gov.in/' },
      { name: 'ISO Certification', reason: 'Quality management certification that builds trust with enterprise clients.', applyLink: '' },
      { name: 'Copyright Registration', reason: 'Protect your source code and software from unauthorized copying.', applyLink: 'https://copyright.gov.in/' },
    ],
  },
  'Healthcare / Clinic / Hospital': {
    essential: [
      { name: 'PAN Card', reason: 'Mandatory for all businesses in India for tax filing and financial transactions.', applyLink: 'https://www.onlineservices.nsdl.com/paam-endUser-printContact.html' },
      { name: 'Aadhaar Card', reason: 'Identity proof required for PAN application, bank accounts, and government registrations.', applyLink: 'https://uidai.gov.in/' },
      { name: 'Clinical Establishment Registration', reason: 'Mandatory registration under the Clinical Establishments Act for healthcare facilities.', applyLink: '' },
      { name: 'Medical Council Registration', reason: 'Practitioners must be registered with the State or National Medical Council.', applyLink: '' },
      { name: 'Drug License', reason: 'Required if pharmacy or dispensing medicines is part of the healthcare service.', applyLink: '' },
      { name: 'GST Registration', reason: 'Required if turnover exceeds the threshold or for inter-state services.', applyLink: 'https://www.gst.gov.in/' },
      { name: 'Biomedical Waste Management Authorization', reason: 'Mandatory for healthcare facilities generating biomedical waste.', applyLink: '' },
      { name: 'Fire Safety Certificate', reason: 'Required by municipal authority for healthcare establishments.', applyLink: '' },
    ],
    optional: [
      { name: 'NABH Accreditation', reason: 'National Accreditation Board for Hospitals - builds trust and quality assurance.', applyLink: '' },
      { name: 'Health Insurance Empanelment', reason: 'Empanelment with TPA and insurance companies for patient billing.', applyLink: '' },
      { name: 'Trademark Certificate', reason: 'Protect your healthcare brand name and logo.', applyLink: 'https://ipindiaonline.gov.in/' },
      { name: 'Udyam / MSME Registration', reason: 'Benefits under MSME schemes.', applyLink: 'https://udyamregistration.gov.in/' },
    ],
  },
  'E-commerce': {
    essential: [
      { name: 'PAN Card', reason: 'Mandatory for all businesses in India for tax filing and financial transactions.', applyLink: 'https://www.onlineservices.nsdl.com/paam-endUser-printContact.html' },
      { name: 'Aadhaar Card', reason: 'Identity proof required for PAN application, bank accounts, and government registrations.', applyLink: 'https://uidai.gov.in/' },
      { name: 'Company / LLP Incorporation', reason: 'Legal entity for raised funding, vendor agreements, and payment gateway integration.', applyLink: 'https://www.mca.gov.in/' },
      { name: 'GST Registration', reason: 'Mandatory for e-commerce operators and sellers on e-commerce platforms.', applyLink: 'https://www.gst.gov.in/' },
      { name: 'Shop & Establishment Registration', reason: 'Required under state law for commercial operations.', applyLink: '' },
      { name: 'Trademark Registration', reason: 'Protect your marketplace brand name and logo.', applyLink: 'https://ipindiaonline.gov.in/' },
      { name: 'Business Bank Account', reason: 'Current account for vendor settlements, refunds, and operations.', applyLink: '' },
      { name: 'Terms of Service & Privacy Policy', reason: 'Legally required for any platform collecting user data and processing payments.', applyLink: '' },
    ],
    optional: [
      { name: 'Udyam / MSME Registration', reason: 'Benefits under MSME schemes.', applyLink: 'https://udyamregistration.gov.in/' },
      { name: 'FSSAI License (if selling food)', reason: 'Required if your marketplace sells food products.', applyLink: 'https://foscos.fssai.gov.in/' },
      { name: 'Consumer Protection Compliance', reason: 'E-commerce rules require grievance officer and consumer complaint mechanisms.', applyLink: '' },
      { name: 'ISO Certification', reason: 'Builds trust with vendors and customers.', applyLink: '' },
    ],
  },
  'Education / Training': {
    essential: [
      { name: 'PAN Card', reason: 'Mandatory for all businesses in India for tax filing and financial transactions.', applyLink: 'https://www.onlineservices.nsdl.com/paam-endUser-printContact.html' },
      { name: 'Aadhaar Card', reason: 'Identity proof required for PAN application, bank accounts, and government registrations.', applyLink: 'https://uidai.gov.in/' },
      { name: 'Society / Trust / Company Incorporation', reason: 'Legal entity registration for educational institutions and EdTech platforms.', applyLink: 'https://www.mca.gov.in/' },
      { name: 'GST Registration', reason: 'Required for course fees billing and interstate transactions.', applyLink: 'https://www.gst.gov.in/' },
      { name: 'Udyam / MSME Registration', reason: 'Benefits under MSME schemes for educational ventures.', applyLink: 'https://udyamregistration.gov.in/' },
      { name: 'Trademark Registration', reason: 'Protect your institution name, brand, and course names.', applyLink: 'https://ipindiaonline.gov.in/' },
      { name: 'Business Bank Account', reason: 'Current account for fee collection, payroll, and operations.', applyLink: '' },
      { name: 'Terms of Service & Privacy Policy', reason: 'Required for student data protection and platform terms.', applyLink: '' },
    ],
    optional: [
      { name: 'Accreditation / Affiliation', reason: 'UGC, AICTE, or board affiliation for recognized certifications.', applyLink: '' },
      { name: 'ISO Certification', reason: 'Quality management certification for educational services.', applyLink: '' },
      { name: 'Fire Safety Certificate', reason: 'Required for physical training centers and classrooms.', applyLink: '' },
    ],
  },
  'Manufacturing': {
    essential: [
      { name: 'PAN Card', reason: 'Mandatory for all businesses in India for tax filing and financial transactions.', applyLink: 'https://www.onlineservices.nsdl.com/paam-endUser-printContact.html' },
      { name: 'Aadhaar Card', reason: 'Identity proof required for PAN application, bank accounts, and government registrations.', applyLink: 'https://uidai.gov.in/' },
      { name: 'Company / LLP Incorporation', reason: 'Legal entity for industrial operations, vendor contracts, and raised funding.', applyLink: 'https://www.mca.gov.in/' },
      { name: 'GST Registration', reason: 'Mandatory for manufacturers for input tax credit and inter-state sales.', applyLink: 'https://www.gst.gov.in/' },
      { name: 'Factory License', reason: 'Required from the State Factory Inspectorate for operating a manufacturing unit.', applyLink: '' },
      { name: 'Pollution Control Board Consent', reason: 'CTO (Consent to Operate) and CTE (Consent to Establish) from State PCB.', applyLink: '' },
      { name: 'Trade License', reason: 'Local municipal authority permission for commercial operations.', applyLink: '' },
      { name: 'Business Bank Account', reason: 'Current account for raw material purchases, payroll, and operations.', applyLink: '' },
    ],
    optional: [
      { name: 'Udyam / MSME Registration', reason: 'Benefits under MSME schemes for manufacturing.', applyLink: 'https://udyamregistration.gov.in/' },
      { name: 'ISO / BIS Certification', reason: 'Quality standards certification required for many product categories.', applyLink: '' },
      { name: 'Trademark Registration', reason: 'Protect your product brand and company name.', applyLink: 'https://ipindiaonline.gov.in/' },
      { name: 'ESI / PF Registration', reason: 'Employee state insurance and provident fund for workers.', applyLink: '' },
      { name: 'Fire Safety Certificate', reason: 'Required for manufacturing facilities.', applyLink: '' },
    ],
  },
  'Retail / Local Shop': {
    essential: [
      { name: 'PAN Card', reason: 'Mandatory for all businesses in India for tax filing and financial transactions.', applyLink: 'https://www.onlineservices.nsdl.com/paam-endUser-printContact.html' },
      { name: 'Aadhaar Card', reason: 'Identity proof required for PAN application, bank accounts, and government registrations.', applyLink: 'https://uidai.gov.in/' },
      { name: 'Shop & Establishment Registration', reason: 'Required under state law to legally operate a retail establishment.', applyLink: '' },
      { name: 'Trade License', reason: 'Local municipal authority permission to carry on retail trade.', applyLink: '' },
      { name: 'GST Registration', reason: 'Required if turnover exceeds the threshold or for purchasing from GST-registered suppliers.', applyLink: 'https://www.gst.gov.in/' },
      { name: 'Rent Agreement / NOC from Owner', reason: 'Proof of premises for Shop & Establishment, GST, and bank account.', applyLink: '' },
      { name: 'Business Bank Account', reason: 'Current account for daily operations, supplier payments, and POS settlements.', applyLink: '' },
      { name: 'FSSAI License (if selling food items)', reason: 'Required if your retail shop sells packaged or unpacked food items.', applyLink: 'https://foscos.fssai.gov.in/' },
    ],
    optional: [
      { name: 'Udyam / MSME Registration', reason: 'Benefits under MSME schemes for retail businesses.', applyLink: 'https://udyamregistration.gov.in/' },
      { name: 'Trademark Registration', reason: 'Protect your shop brand name and logo.', applyLink: 'https://ipindiaonline.gov.in/' },
      { name: 'Fire Safety Certificate', reason: 'Required for larger retail establishments.', applyLink: '' },
      { name: 'Insurance', reason: 'Property and liability insurance for your retail space.', applyLink: '' },
    ],
  },
  'Transport / Delivery': {
    essential: [
      { name: 'PAN Card', reason: 'Mandatory for all businesses in India for tax filing and financial transactions.', applyLink: 'https://www.onlineservices.nsdl.com/paam-endUser-printContact.html' },
      { name: 'Aadhaar Card', reason: 'Identity proof required for PAN application, bank accounts, and government registrations.', applyLink: 'https://uidai.gov.in/' },
      { name: 'Company / LLP Incorporation', reason: 'Legal entity for transport operations, fleet management, and raised funding.', applyLink: 'https://www.mca.gov.in/' },
      { name: 'GST Registration', reason: 'Required for transport services billing and interstate operations.', applyLink: 'https://www.gst.gov.in/' },
      { name: 'Motor Vehicle Act Permits', reason: 'Commercial vehicle permits required for transport and delivery operations.', applyLink: '' },
      { name: 'Shop & Establishment Registration', reason: 'Required for office and warehouse operations.', applyLink: '' },
      { name: 'Trade License', reason: 'Local municipal authority permission for transport operations.', applyLink: '' },
      { name: 'Business Bank Account', reason: 'Current account for fleet expenses, fuel, and operations.', applyLink: '' },
    ],
    optional: [
      { name: 'Udyam / MSME Registration', reason: 'Benefits under MSME schemes.', applyLink: 'https://udyamregistration.gov.in/' },
      { name: 'Insurance (Vehicle & Cargo)', reason: 'Mandatory and recommended for fleet vehicles and cargo.', applyLink: '' },
      { name: 'Trademark Registration', reason: 'Protect your delivery brand name and logo.', applyLink: 'https://ipindiaonline.gov.in/' },
      { name: 'Warehouse License', reason: 'Required if operating storage or fulfillment centers.', applyLink: '' },
    ],
  },
  'Finance / FinTech': {
    essential: [
      { name: 'PAN Card', reason: 'Mandatory for all businesses in India for tax filing and financial transactions.', applyLink: 'https://www.onlineservices.nsdl.com/paam-endUser-printContact.html' },
      { name: 'Aadhaar Card', reason: 'Identity proof required for PAN application, bank accounts, and government registrations.', applyLink: 'https://uidai.gov.in/' },
      { name: 'Company Incorporation ( Pvt Ltd )', reason: 'Mandatory for fintech companies. Required for RBI/SEBI compliance.', applyLink: 'https://www.mca.gov.in/' },
      { name: 'GST Registration', reason: 'Required for financial services billing.', applyLink: 'https://www.gst.gov.in/' },
      { name: 'RBI / SEBI / IRDAI Approval', reason: 'Regulatory approval required based on financial service type (lending, insurance, securities).', applyLink: '' },
      { name: 'Payment Aggregator / Gateway License', reason: 'Required for collecting payments from users on behalf of merchants.', applyLink: '' },
      { name: 'Trademark Registration', reason: 'Protect your fintech brand name and product names.', applyLink: 'https://ipindiaonline.gov.in/' },
      { name: 'Terms of Service & Privacy Policy', reason: 'Legally required for financial services handling sensitive user data.', applyLink: '' },
    ],
    optional: [
      { name: 'Udyam / MSME Registration', reason: 'Benefits under MSME schemes.', applyLink: 'https://udyamregistration.gov.in/' },
      { name: 'ISO 27001 Certification', reason: 'Information security management certification - builds trust with financial regulators.', applyLink: '' },
      { name: 'Data Protection Compliance', reason: 'DPDP Act compliance for handling financial data.', applyLink: '' },
      { name: 'NPCI Certification (if UPI)', reason: 'Required for UPI-based payment services.', applyLink: '' },
    ],
  },
  'Service Business': {
    essential: [
      { name: 'PAN Card', reason: 'Mandatory for all businesses in India for tax filing and financial transactions.', applyLink: 'https://www.onlineservices.nsdl.com/paam-endUser-printContact.html' },
      { name: 'Aadhaar Card', reason: 'Identity proof required for PAN application, bank accounts, and government registrations.', applyLink: 'https://uidai.gov.in/' },
      { name: 'Shop & Establishment Registration', reason: 'Required under state law for service business operations.', applyLink: '' },
      { name: 'Trade License', reason: 'Local municipal authority permission for service trade.', applyLink: '' },
      { name: 'GST Registration', reason: 'Required if turnover exceeds the threshold or for interstate services.', applyLink: 'https://www.gst.gov.in/' },
      { name: 'Rent Agreement / NOC from Owner', reason: 'Proof of premises for registration and bank account.', applyLink: '' },
      { name: 'Business Bank Account', reason: 'Current account for client payments, vendor payments, and operations.', applyLink: '' },
      { name: 'Professional Tax Registration', reason: 'Required in some states for service businesses with employees.', applyLink: '' },
    ],
    optional: [
      { name: 'Udyam / MSME Registration', reason: 'Benefits under MSME schemes.', applyLink: 'https://udyamregistration.gov.in/' },
      { name: 'Trademark Registration', reason: 'Protect your service brand name and logo.', applyLink: 'https://ipindiaonline.gov.in/' },
      { name: 'Service Tax Registration', reason: 'Specific service tax compliance if applicable.', applyLink: '' },
      { name: 'Insurance', reason: 'Professional liability and property insurance.', applyLink: '' },
    ],
  },
  'Other': {
    essential: [
      { name: 'PAN Card', reason: 'Mandatory for all businesses in India for tax filing and financial transactions.', applyLink: 'https://www.onlineservices.nsdl.com/paam-endUser-printContact.html' },
      { name: 'Aadhaar Card', reason: 'Identity proof required for PAN application, bank accounts, and government registrations.', applyLink: 'https://uidai.gov.in/' },
      { name: 'Shop & Establishment Registration', reason: 'Required under state law for business operations.', applyLink: '' },
      { name: 'Trade License', reason: 'Local municipal authority permission for business operations.', applyLink: '' },
      { name: 'GST Registration', reason: 'Required if turnover exceeds the threshold.', applyLink: 'https://www.gst.gov.in/' },
      { name: 'Business Bank Account', reason: 'Current account for business transactions.', applyLink: '' },
    ],
    optional: [
      { name: 'Udyam / MSME Registration', reason: 'Benefits under MSME schemes.', applyLink: 'https://udyamregistration.gov.in/' },
      { name: 'Trademark Registration', reason: 'Protect your business brand name.', applyLink: 'https://ipindiaonline.gov.in/' },
    ],
  },
};

export const generateCategoryDocuments = (startupId: string, founderId: string, startupName: string, category: string) => {
  const catDocs = CATEGORY_DOCUMENT_MAP[category] || CATEGORY_DOCUMENT_MAP['Other'];
  const now = new Date().toISOString();

  const essentialDocs = catDocs.essential.map((doc, i) => ({
    id: `doc_cat_${startupId}_${i}_${Date.now()}`,
    startupId,
    founderId,
    fileName: `${startupName.replace(/\s+/g, '_')}_${doc.name.replace(/\s+/g, '_')}`,
    fileType: 'PENDING',
    fileSize: '\u2014',
    fileData: '',
    category: 'Founder Documents',
    documentType: doc.name,
    documentLabel: doc.name,
    documentDescription: doc.reason,
    documentSection: 'Essential',
    required: true,
    uploadRequired: true,
    applyLink: doc.applyLink || '',
    status: 'Pending',
    verificationStatus: 'pending',
    verificationNote: '',
    sharedWith: [],
    createdAt: now,
    updatedAt: now,
  }));

  const optionalDocs = catDocs.optional.map((doc, i) => ({
    id: `doc_cat_opt_${startupId}_${i}_${Date.now()}`,
    startupId,
    founderId,
    fileName: `${startupName.replace(/\s+/g, '_')}_${doc.name.replace(/\s+/g, '_')}`,
    fileType: 'PENDING',
    fileSize: '\u2014',
    fileData: '',
    category: 'Optional Documents',
    documentType: doc.name,
    documentLabel: doc.name,
    documentDescription: doc.reason,
    documentSection: 'Optional',
    required: false,
    uploadRequired: false,
    applyLink: doc.applyLink || '',
    status: 'Pending',
    verificationStatus: 'pending',
    verificationNote: '',
    sharedWith: [],
    createdAt: now,
    updatedAt: now,
  }));

  return [...essentialDocs, ...optionalDocs];
};

export const generateStartupOutput = (startup: any) => {
  const isPhysical = /tea|coffee|snacks|restaurant|salon|hotel|shop|cafe|retail|bakery/i.test(startup.startupIdea || startup.startupName);
  
  let ideaAnalysis, branding, businessPlan, pitchDeck, marketResearch, aiReport;

  if (isPhysical) {
    ideaAnalysis = {
      refinedIdea: `${startup.startupName || 'Your Business'} is a premium, beautifully designed local establishment focusing on high-quality offerings and exceptional, memorable customer experiences.`,
      problemStatement: "Customers in the area lack premium, aesthetically pleasing, and consistently high-quality options for daily consumption and socializing.",
      solution: "A highly aesthetic, premium local venue offering carefully curated products, excellent service, and a welcoming ambiance.",
      targetCustomers: ["Local Professionals", "Students & Remote Workers", "Premium Shoppers", "Families"],
      uniqueValueProposition: "Combining high-end, instagrammable aesthetics with premium quality products in an accessible, community-centric location.",
      businessModel: "Direct-to-Consumer Retail / Walk-in Sales & Delivery",
      revenueModel: ["Walk-in Sales", "Takeaway & Delivery", "Combo Offers & Memberships", "Office Bulk Orders/Catering"],
      coreFeatures: ["Premium Ambiance & Seating", "Curated Menu/Products", "Loyalty Program", "Fast, Friendly Service", "Branded Packaging"],
      marketOpportunity: "High local footfall and rapidly growing demand for premium, experiential retail and dining.",
      nextSteps: ["Secure Prime Location", "Finalize Interior Design & Branding", "Vendor Agreements & Sourcing", "Hire Initial Team"]
    };

    branding = {
      brandNameSuggestions: [startup.startupName || "Brew & Bloom", "The Local Leaf", "Aura", "Prime Reserve"],
      taglineSuggestions: ["Your Daily Escape.", "Premium Quality, Local Charm.", "Taste the Difference.", "Crafted for You."],
      logoConceptIdeas: "Minimalist wordmark with a subtle, elegant icon (like a leaf or abstract cup). Use clean, ample whitespace.",
      logoPrompt: `Create a professional, premium modern logo for a startup named "${startup.startupName || 'Breaktime'}".

${startup.startupName || 'This business'} is a local premium tea, coffee, and snacks brand with a sophisticated, welcoming aesthetic.

Logo Requirements:
- Clean vector-style logo
- Modern startup branding
- Simple memorable icon
- Strong readable typography
- White or transparent background
- No mockup, no 3D wall sign, no watermark
- Suitable for packaging, pitch deck, website, and mobile app

Generate:
1. Icon + text logo (coffee cup, tea leaf, or break/pause icon)
2. Text-only logo (elegant serif + sans-serif)
3. App icon style (bold initial or abstract symbol)

Style: Minimal, elegant, premium, vector-based. Colors: Coffee brown (#4B2E1E), Cream (#F5E6C8), Gold (#D4AF37), Black.`,
      logoStyle: "Minimal Elegant Premium",
      brandColorPalette: ["#4B2E1E (Coffee Brown)", "#F5E6C8 (Warm Cream)", "#D4AF37 (Gold)", "#111111 (Jet Black)"],
      fontStyleSuggestions: "Primary: 'Playfair Display' (Elegant Serif) | Secondary: 'Inter' (Clean Sans-Serif)",
      brandPersonality: "Welcoming, Premium, Aesthetic, Community-Focused, Sophisticated.",
      packagingStyleSuggestions: "Eco-friendly, matte-finish cups/bags with minimalist logo placement and a bold pop of the brand's accent color.",
      socialMediaIdeas: "High-quality, warm-toned photography of products; behind-the-scenes preparation videos; user-generated aesthetic interior shots.",
      websiteHero: `"Experience ${startup.startupName || 'Us'}. Your new favorite local spot for premium quality and comfort."`,
      marketingCaptions: ["Sip, relax, repeat. ☕", "Your new daily ritual is here.", "Elevating your local experience."]
    };
    
    businessPlan = {
      executiveSummary: `${startup.startupName || 'The business'} will redefine the local retail experience by offering premium products in a highly aesthetic, welcoming environment.`,
      problemAndSolution: "Problem: Uninspiring local options. Solution: A premium, design-forward establishment.",
      productDetails: "High-quality, locally sourced products, instagrammable interiors, and exceptional service.",
      targetCustomers: "Urban professionals, students, and local residents seeking quality.",
      businessModel: "Retail sales, takeaway, and potential B2B bulk catering orders.",
      revenueModel: "Walk-in revenue, loyalty subscriptions, and delivery app sales.",
      pricingStrategy: "Premium pricing (+15-20% above local average) justified by quality, branding, and experience.",
      goToMarketStrategy: "Local influencer marketing, grand opening event, targeted local social media ads, and flyers.",
      operationsPlan: "Open 7 days a week, 7 AM - 9 PM. Two shifts. Daily local sourcing for perishables.",
      teamRequirement: ["Store Manager", "Head Barista/Chef", "Marketing Lead (Part-time)", "Operations Staff (3-4x)"],
      financialProjection: "Year 1 Revenue: $250k, Break-even by Month 8, 25% Net Margin by Year 2.",
      fundingAsk: "$150,000 for lease deposit, interior setup, equipment, and initial inventory."
    };

    pitchDeck = [
      { slide: 1, title: "Cover Slide", content: `${startup.startupName || 'Business'} - Premium Local Experience` },
      { slide: 2, title: "Problem", content: "Lack of premium aesthetic venues in the local area." },
      { slide: 3, title: "Solution", content: "A high-end, beautifully designed space offering top-tier products." },
      { slide: 4, title: "Market Size", content: "Local addressable market of 50,000+ daily commuters/residents." },
      { slide: 5, title: "Product/Service Demo", content: "[Interior Mockups, Menu Highlights, & Branding]" },
      { slide: 6, title: "Business Model", content: "Walk-in, Takeaway, Delivery, & Bulk Orders." },
      { slide: 7, title: "Traction/Validation", content: "Pre-launch hype, 500+ waitlist/social followers." },
      { slide: 8, title: "Go-To-Market", content: "Local SEO, Influencer Partnerships, Grand Opening Event." },
      { slide: 9, title: "Team", content: "Experienced retail and hospitality operators." },
      { slide: 10, title: "Funding Ask", content: "$150k for Buildout, Licensing, and Launch." }
    ];

    marketResearch = {
      tam: "$50M (Regional Market)",
      sam: "$5M (City/District Market)",
      som: "$500k (Local Neighborhood Target)",
      customerSegments: ["Daily Commuters", "Weekend Socializers", "Remote Workers", "Health-conscious locals"],
      competitorAnalysis: "Local Mom-and-Pop Shops (outdated), Generic Chains (impersonal). We win on quality and aesthetics.",
      marketTrends: ["Experiential Retail", "Premiumization", "Aesthetic Environments", "Local Sourcing"],
      opportunities: ["B2B Catering", "Branded Merchandise Sales", "Future Franchising"],
      risks: ["High Initial Rent/CapEx", "Staff Turnover", "Local Supply Chain Issues"],
      pricingSuggestions: "Premium pricing (+20% above market average) justified by quality and experience.",
      locationSuggestions: "High-footfall urban corners, near transit hubs or university campuses, large storefront windows."
    };

    aiReport = {
      investmentReadinessScore: 82,
      businessStrengths: ["Clear tangible product", "Strong local demand", "Aesthetic focus aligns with current trends"],
      weaknesses: ["High upfront capital required for buildout", "Geographically constrained initially"],
      riskFactors: ["High initial CapEx for interior", "Location dependency", "Staffing & training challenges"],
      improvementSuggestions: ["Secure a letter of intent for a prime location", "Develop a strong local marketing pre-launch campaign"],
      scalabilityScore: 65,
      fundingReadiness: "Good for local angel investors or small business loans.",
      mentorReviewSummary: "Solid physical business concept. Focus heavily on location scouting, lease negotiations, and creating a strong brand identity."
    };
  } else {
    ideaAnalysis = {
      refinedIdea: `${startup.startupName || 'Your SaaS'} is an innovative tech solution designed to streamline workflows, automate tasks, and drive 10x efficiency in its target sector.`,
      problemStatement: "Current software solutions are outdated, fragmented, manual, and fail to leverage modern AI capabilities.",
      solution: "A unified, intuitive AI-powered platform that automates tedious tasks and provides actionable, data-driven insights.",
      targetCustomers: ["SMBs", "Enterprise Teams", "Freelancers", "Agencies"],
      uniqueValueProposition: "10x faster execution and 50% cost reduction through seamless AI integration and intuitive UI/UX.",
      businessModel: "B2B SaaS (Software as a Service)",
      revenueModel: ["Freemium Tier (PLG)", "Pro Subscription ($49/mo)", "Enterprise Custom Plans ($999+/mo)"],
      coreFeatures: ["AI Automation Engine", "Real-time Analytics Dashboard", "Team Collaboration Tools", "API Integrations (Zapier, Slack)"],
      marketOpportunity: "Rapidly digitizing sector with high willingness to pay for efficiency and automation tools.",
      nextSteps: ["Design UI/UX Mockups", "Build MVP Engine", "Launch Beta", "Acquire First 100 Paid Users"]
    };

    branding = {
      brandNameSuggestions: [startup.startupName || "SyncAI", "FlowState", "Nexus", "AutomateHQ"],
      taglineSuggestions: ["Work Smarter, Not Harder.", "The AI operating system for your team.", "Automate your growth.", "Efficiency, redefined."],
      logoConceptIdeas: "Modern, geometric tech icon (like a connected node or forward arrow). Bold, lowercase tech font.",
      logoPrompt: `Create a professional, modern logo for a tech startup named "${startup.startupName || 'SyncAI'}".

${startup.startupName || 'This startup'} is an AI/SaaS platform that automates workflows and provides data-driven insights.

Logo Requirements:
- Clean vector-style logo
- Modern startup branding
- Simple memorable icon
- Strong readable typography
- White or transparent background
- No mockup, no watermark
- Suitable for website, mobile app, and pitch deck

Generate:
1. Abstract geometric tech icon + text logo
2. Text-only logo (bold, modern sans-serif)
3. App icon style (letter mark or abstract symbol)

Style: Minimal, futuristic, clean. Colors: Indigo (#4F46E5), Dark Slate (#111827), Light Gray (#F3F4F6), Success Green (#10B981).`,
      logoStyle: "Modern Minimal Tech",
      brandColorPalette: ["#4F46E5 (Vibrant Indigo)", "#111827 (Dark Slate)", "#F3F4F6 (Light Gray)", "#10B981 (Success Green)"],
      fontStyleSuggestions: "Primary: 'Inter' (Clean Sans-Serif) | Secondary: 'Roboto Mono' (Tech/Code Vibe)",
      brandPersonality: "Innovative, Trustworthy, Fast, Modern, Cutting-edge.",
      packagingStyleSuggestions: "Clean, dark-mode SaaS UI, heavy use of glassmorphism, subtle purple/blue gradients.",
      socialMediaIdeas: "Feature highlight videos, customer success stories, thought leadership threads on X/LinkedIn.",
      websiteHero: `"Automate your workflow in seconds. Join 10,000+ teams doing their best work with ${startup.startupName || '[Name]'}."`,
      marketingCaptions: ["Stop doing manual work. Let AI handle it. 🚀", "Scale your team without hiring.", "The future of work is here."]
    };
    
    businessPlan = {
      executiveSummary: `${startup.startupName || 'This SaaS'} aims to dominate the software niche by introducing advanced AI workflows to traditional, manual processes.`,
      problemAndSolution: "Problem: Inefficient workflows and scattered data. Solution: Automated, centralized SaaS platform.",
      productDetails: "Cloud-based dashboard, AI co-pilot assistants, robust API, and role-based access control.",
      targetCustomers: "Tech-forward SMBs and mid-market enterprises looking to cut operational costs.",
      businessModel: "Tiered SaaS recurring subscriptions with usage-based overages.",
      revenueModel: "Monthly/Annual recurring revenue (MRR/ARR).",
      pricingStrategy: "Value-based pricing. Free tier for individuals, $49/mo for teams, $499/mo for enterprise.",
      goToMarketStrategy: "Product-Led Growth (PLG), Content marketing/SEO, Product Hunt launch, and direct outbound sales.",
      operationsPlan: "Agile software development, 24/7 cloud hosting, automated customer support.",
      teamRequirement: ["Technical Co-founder (CTO)", "Growth Marketer", "Product Designer", "Full-Stack Engineer"],
      financialProjection: "Year 1 ARR: $100k. Year 2 ARR: $1M. Gross margin: 85%.",
      fundingAsk: "$500,000 for engineering hires, server costs, and go-to-market execution."
    };

    pitchDeck = [
      { slide: 1, title: "Cover Slide", content: `${startup.startupName || 'SaaS'} - The Future of Automated Workflows` },
      { slide: 2, title: "Problem", content: "Teams waste 40% of their week on manual, fragmented tasks." },
      { slide: 3, title: "Solution", content: "An all-in-one AI platform that connects tools and automates work." },
      { slide: 4, title: "Market Size", content: "$10B+ TAM in enterprise workflow automation." },
      { slide: 5, title: "Product Demo", content: "[Dashboard Screenshot & AI Flow Demo]" },
      { slide: 6, title: "Business Model", content: "SaaS: $49/mo Pro, $499/mo Enterprise." },
      { slide: 7, title: "Traction/Validation", content: "1,000+ waitlist, 5 beta enterprise pilots secured." },
      { slide: 8, title: "Go-To-Market", content: "PLG, SEO, and Outbound Sales Motion." },
      { slide: 9, title: "Team", content: "Ex-FAANG engineers and SaaS operators." },
      { slide: 10, title: "Funding Ask", content: "$500k Pre-Seed round for 18mo runway." }
    ];

    marketResearch = {
      tam: "$10B (Global SaaS Market for Niche)",
      sam: "$1B (Target Geography & Segment)",
      som: "$10M (Attainable Year 1-3)",
      customerSegments: ["Operations Teams", "Marketing Agencies", "IT Departments", "Founders"],
      competitorAnalysis: "Legacy Incumbents (too complex/expensive), Horizontal Tools like Notion (too generic).",
      marketTrends: ["AI Integration", "No-code/Low-code tools", "Remote Work Enablement"],
      opportunities: ["Vertical-specific workflows", "Data monetization", "Marketplace app ecosystem"],
      risks: ["High customer acquisition costs (CAC)", "Data privacy regulations (GDPR/SOC2)", "Rapid AI obsolescence"],
      pricingSuggestions: "Value-based pricing. Start with a $49/mo base tier to reduce friction.",
      locationSuggestions: "N/A - Global remote-first digital product."
    };

    aiReport = {
      investmentReadinessScore: 88,
      businessStrengths: ["Highly scalable model", "Strong AI tailwinds", "High gross margins (80%+)"],
      weaknesses: ["High dependency on third-party AI APIs", "No initial brand recognition"],
      riskFactors: ["Fierce competition from well-funded incumbents", "Tech execution risk", "GTM dependency"],
      improvementSuggestions: ["Solidify the exact ICP (Ideal Customer Profile)", "Build a clickable prototype immediately for user testing"],
      scalabilityScore: 95,
      fundingReadiness: "Ready for Pre-Seed VC pitching.",
      mentorReviewSummary: "Excellent SaaS concept. Focus on building a rapid MVP, getting early user feedback, and securing design partners."
    };
  }

  return { ideaAnalysis, branding, businessPlan, pitchDeck, marketResearch, aiReport };
};

export const generateRoadmapAndTasks = (startup: any) => {
  const isPhysical = /tea|coffee|snacks|restaurant|salon|hotel|shop|cafe|retail|bakery/i.test(startup.startupIdea || startup.startupName);
  
  const roadmap = [
    { 
      id: 1, phase: 'Phase 1', title: "Idea & Validation", status: 'completed',
      description: "Define the core concept, validate the market, and finalize the foundational plan.",
      milestones: [
        { name: 'Define core concept & branding', done: true },
        { name: 'Complete market research', done: true },
        { name: 'Financial model creation', done: true }
      ]
    },
    { 
      id: 2, phase: 'Phase 2', title: "MVP / Setup", status: 'in-progress',
      description: isPhysical ? "Secure location, build out interior, and source initial inventory." : "Develop the core product MVP and set up necessary infrastructure.",
      milestones: [
        { name: isPhysical ? 'Secure lease agreement' : 'Complete core MVP features', done: true },
        { name: isPhysical ? 'Interior design & buildout' : 'Beta testing with initial users', done: false },
        { name: 'Legal & compliance setup', done: false }
      ]
    },
    { 
      id: 3, phase: 'Phase 3', title: "Launch", status: 'upcoming',
      description: "Execute go-to-market strategy and open doors to the public (or launch product).",
      milestones: [
        { name: 'Marketing campaign execution', done: false },
        { name: 'Soft launch / invite-only', done: false },
        { name: 'Public grand opening', done: false }
      ]
    },
    { 
      id: 4, phase: 'Phase 4', title: "Growth", status: 'upcoming',
      description: "Scale operations, acquire customers, and optimize unit economics.",
      milestones: [
        { name: 'Reach target MRR / Revenue goals', done: false },
        { name: 'Scale marketing spend', done: false },
        { name: 'Team expansion', done: false }
      ]
    }
  ];

  let tasks = [];

  if (isPhysical) {
    tasks = [
      { id: 1, title: 'Finalize interior design mockups', phaseTitle: 'MVP / Setup', priority: 'High', status: 'in-progress', dueDate: 'Next Week', progress: 60 },
      { id: 2, title: 'Scout 3 potential physical locations', phaseTitle: 'Idea & Validation', priority: 'High', status: 'done', dueDate: 'Past', progress: 100 },
      { id: 3, title: 'Negotiate supplier contracts for inventory', phaseTitle: 'MVP / Setup', priority: 'High', status: 'todo', dueDate: 'In 2 Weeks', progress: 0 },
      { id: 4, title: 'Apply for business licenses and health permits', phaseTitle: 'MVP / Setup', priority: 'High', status: 'todo', dueDate: 'In 2 Weeks', progress: 0 },
      { id: 5, title: 'Plan grand opening local marketing campaign', phaseTitle: 'Launch', priority: 'Medium', status: 'todo', dueDate: 'Next Month', progress: 0 },
      { id: 6, title: 'Hire initial staff (manager, barista/cashier)', phaseTitle: 'Launch', priority: 'High', status: 'todo', dueDate: 'Next Month', progress: 0 },
    ];
  } else {
    tasks = [
      { id: 1, title: 'Design Figma UI/UX mockups', phaseTitle: 'MVP / Setup', priority: 'High', status: 'in-progress', dueDate: 'Next Week', progress: 80 },
      { id: 2, title: 'Define database schema and architecture', phaseTitle: 'Idea & Validation', priority: 'High', status: 'done', dueDate: 'Past', progress: 100 },
      { id: 3, title: 'Integrate OpenAI API for core workflow', phaseTitle: 'MVP / Setup', priority: 'High', status: 'todo', dueDate: 'In 2 Weeks', progress: 0 },
      { id: 4, title: 'Set up Stripe billing and subscriptions', phaseTitle: 'MVP / Setup', priority: 'Medium', status: 'todo', dueDate: 'In 2 Weeks', progress: 0 },
      { id: 5, title: 'Launch on Product Hunt', phaseTitle: 'Launch', priority: 'High', status: 'todo', dueDate: 'Next Month', progress: 0 },
      { id: 6, title: 'Deploy to Vercel/AWS', phaseTitle: 'Launch', priority: 'High', status: 'todo', dueDate: 'Next Month', progress: 0 },
    ];
  }

  return { roadmap, tasks };
};

export const getDocuments = () => {
  try {
    const data = localStorage.getItem('ai_startup_builder_documents');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveDocument = (document: any) => {
  const current = getDocuments();
  const updated = [document, ...current];
  localStorage.setItem('ai_startup_builder_documents', JSON.stringify(updated));
  return updated;
};

export const getDocumentById = (id: string) => {
  const docs = getDocuments();
  return docs.find((d: any) => d.id === id) || null;
};

export const updateDocument = (id: string, updatedData: any) => {
  let docs = getDocuments();
  let updatedDoc = null;
  docs = docs.map((d: any) => {
    if (d.id === id) {
      updatedDoc = { ...d, ...updatedData };
      return updatedDoc;
    }
    return d;
  });
  if (updatedDoc) {
    localStorage.setItem('ai_startup_builder_documents', JSON.stringify(docs));
  }
  return updatedDoc;
};

export const deleteDocument = (id: string) => {
  const docs = getDocuments();
  const filtered = docs.filter((d: any) => d.id !== id);
  localStorage.setItem('ai_startup_builder_documents', JSON.stringify(filtered));
  return filtered;
};

// Mentor Payment Settings
const defaultMentorPaymentSettings = {
  externalPaymentType: 'Per Task',
  internalPaymentType: 'Monthly Salary',
  basicReviewAmount: 50,
  detailedReviewAmount: 150,
  call30MinAmount: 100,
  call45MinAmount: 150,
  call60MinAmount: 200,
  platformCommission: 20,
  mentorShare: 80,
  weeklySalaryAmount: 1000,
  monthlySalaryAmount: 4000,
  minWeeklyTarget: 10,
  minMonthlyTarget: 40,
  payoutCycle: 'Monthly'
};

export const getMentorPaymentSettings = () => {
  try {
    const data = localStorage.getItem('ai_startup_builder_mentor_payment_settings');
    return data ? { ...defaultMentorPaymentSettings, ...JSON.parse(data) } : defaultMentorPaymentSettings;
  } catch (e) {
    return defaultMentorPaymentSettings;
  }
};

export const saveMentorPaymentSettings = (settings: any) => {
  localStorage.setItem('ai_startup_builder_mentor_payment_settings', JSON.stringify(settings));
  return settings;
};

// ────────────────────────────────────────────────────────────
// Logo Helpers
// ────────────────────────────────────────────────────────────

export const getLogosByStartupId = (startupId: string) => {
  try {
    const data = localStorage.getItem('ai_startup_builder_logos');
    const all: any[] = data ? JSON.parse(data) : [];
    return all.filter((l) => l.startupId === startupId);
  } catch (e) {
    return [];
  }
};

export const getAllLogos = () => {
  try {
    const data = localStorage.getItem('ai_startup_builder_logos');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveLogo = (logo: any) => {
  const current = getAllLogos();
  // Replace existing logo for this startup if exists
  const filtered = current.filter((l: any) => l.startupId !== logo.startupId);
  const updated = [logo, ...filtered];
  localStorage.setItem('ai_startup_builder_logos', JSON.stringify(updated));
  return logo;
};

export const deleteLogoByStartupId = (startupId: string) => {
  const current = getAllLogos();
  const filtered = current.filter((l: any) => l.startupId !== startupId);
  localStorage.setItem('ai_startup_builder_logos', JSON.stringify(filtered));
  return filtered;
};
