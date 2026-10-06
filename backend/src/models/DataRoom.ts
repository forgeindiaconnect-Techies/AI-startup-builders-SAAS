import mongoose, { Schema } from 'mongoose';

const DataroomDocumentSchema = new Schema({
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['company_legal', 'business_startup', 'financial_info', 'market_customer', 'product_tech', 'team_org', 'fundraising', 'compliance_risk'],
    required: true,
  },
  description: { type: String, default: '' },
  fileUrl: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: String, default: '1.2 MB' },
  uploadedBy: { type: String, required: true },
  uploaderName: { type: String, default: 'Founder' },
  version: { type: Number, default: 1 },
  status: { type: String, enum: ['Required', 'Recommended', 'Optional', 'Not Applicable'], default: 'Recommended' },
  permission: { type: String, enum: ['No Access', 'View Only', 'View + Download'], default: 'View Only' },
  stageRequirement: { type: String, enum: ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Growth'], default: 'Seed' },
  uploadedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  previousVersions: [
    {
      version: { type: Number },
      fileUrl: { type: String },
      fileSize: { type: String },
      uploadedAt: { type: Date },
      replacedBy: { type: String },
    },
  ],
});

const DataRoomSchema = new Schema({
  startupId: { type: String, required: true, index: true },
  startupName: { type: String, required: true },
  founderId: { type: String, required: true, index: true },
  founderName: { type: String, required: true },
  startupStage: { type: String, enum: ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Growth'], default: 'Seed' },
  dealStage: {
    type: String,
    enum: ['Startup Discovery', 'Mutual Interest', 'Due Diligence', 'Deal / Negotiation', 'Investment Completed'],
    default: 'Due Diligence',
  },
  status: { type: String, enum: ['Draft', 'Active', 'Under Review', 'Archived'], default: 'Active' },
  documents: [DataroomDocumentSchema],
  investorAccess: [
    {
      investorId: { type: String, required: true },
      investorName: { type: String, required: true },
      investorEmail: { type: String },
      status: { type: String, enum: ['pending', 'granted', 'revoked'], default: 'pending' },
      grantedAt: { type: Date },
      grantedBy: { type: String },
      permissionLevel: { type: String, enum: ['View Only', 'Full Access', 'Custom'], default: 'View Only' },
      customPermissions: { type: Schema.Types.Mixed, default: {} },
    },
  ],
  questions: [
    {
      documentId: { type: String },
      documentName: { type: String },
      investorId: { type: String, required: true },
      investorName: { type: String, required: true },
      investorEmail: { type: String },
      question: { type: String, required: true },
      answer: { type: String, default: '' },
      answeredAt: { type: Date },
      status: { type: String, enum: ['pending', 'answered'], default: 'pending' },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  auditLogs: [
    {
      userId: { type: String, required: true },
      userName: { type: String, required: true },
      userRole: { type: String, enum: ['founder', 'investor', 'admin'], required: true },
      action: { type: String, required: true },
      documentId: { type: String },
      documentName: { type: String },
      details: { type: String },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  aiAnalysis: {
    overallReadiness: { type: Number, default: 78 },
    businessScore: { type: String, default: 'Strong' },
    marketScore: { type: String, default: 'High potential' },
    financialsScore: { type: String, default: 'Requires additional information' },
    techScore: { type: String, default: 'Moderate risk' },
    legalScore: { type: String, default: 'Documents pending' },
    riskIndicators: [{ type: String }],
    missingDocuments: [{ type: String }],
    inconsistencies: [{ type: String }],
    keyQuestionsForInvestor: [{ type: String }],
    keyQuestionsForFounder: [{ type: String }],
    checklist: [
      {
        title: { type: String },
        status: { type: String, enum: ['Complete', 'Pending', 'Missing'] },
      },
    ],
    redFlags: [{ type: String }],
    growthOpportunities: [{ type: String }],
    analyzedAt: { type: Date, default: Date.now },
  },
}, { timestamps: true });

export default mongoose.model('DataRoom', DataRoomSchema);
