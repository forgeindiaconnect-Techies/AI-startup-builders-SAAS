import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, ArrowLeft, Shield, Lock, Eye, FileText, Share2, HelpCircle } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white font-medium text-sm mb-8 transition-colors cursor-pointer bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10">
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="bg-[#5B21B6] text-[#FBBF24] p-3 rounded-xl shadow-md"><Rocket size={24} /></div>
          <h1 className="text-3xl font-extrabold text-white">Privacy Policy</h1>
        </div>
        <p className="text-gray-400 mb-10 ml-16 text-sm">Last updated: August 26, 2026</p>

        <div className="bg-[#111827] rounded-2xl border border-gray-800 shadow-xl p-8 sm:p-10 space-y-8 text-sm text-gray-300 leading-relaxed">
          <div className="flex items-start gap-4 p-5 bg-[#5B21B6]/10 rounded-xl border border-[#5B21B6]/20">
            <Shield size={24} className="text-[#FBBF24] shrink-0 mt-1" />
            <div>
              <h2 className="font-bold text-white text-base mb-1">Your Privacy is Our Commitment</h2>
              <p className="text-gray-400 text-xs">At AI Startup Builder, we understand that your startup ideas, financial logs, and credentials represent sensitive intellectual property. We are dedicated to providing transparency in how we collect, store, and utilize your personal and corporate details.</p>
            </div>
          </div>

          <Section title="1. Overview & Compliance Framework" icon={<Shield size={16} className="text-[#FBBF24]" />}>
            <p>AI Startup Builder ("we," "our," "us") provides software solutions, AI analytics, and networking utilities for founders, mentors, and accredited investors. This Policy describes how we process your personal data under global data protection regulations, including the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).</p>
            <p>By accessing our web application, signing up for membership, or interacting with our services, you consent to the operations detailed in this document.</p>
          </Section>

          <Section title="2. Information We Collect (By User Role)" icon={<Eye size={16} className="text-[#FBBF24]" />}>
            <p>We process data based on the specific role you assume on the platform. The information categorized below is essential for our verification systems, database records, and transaction matching:</p>
            
            <div className="space-y-4 mt-3 pl-4 border-l-2 border-purple-900">
              <div>
                <strong className="text-white block">A. Founders & General Users</strong>
                <p className="text-xs text-gray-450 mt-0.5">We collect your contact details (full name, email address, mobile number), business parameters (startup name, industry focus, stage of development), submitted intellectual property (ideas, business plans, pitch deck summaries, files uploaded to the Data Room), and billing logs linked securely via Stripe.</p>
              </div>
              
              <div>
                <strong className="text-white block">B. Mentors</strong>
                <p className="text-xs text-gray-450 mt-0.5">In addition to basic contact info, we collect professional category filters, years of experience, LinkedIn profiles, self-written bio descriptions, bank account/UPI disbursement credentials, schedule availabilities, session fee parameters, and identity documents (Aadhaar or PAN) required for compliance verification.</p>
              </div>

              <div>
                <strong className="text-white block">C. Investors</strong>
                <p className="text-xs text-gray-450 mt-0.5">We collect accredited investor certificates, tax PAN cards, proof of organization (for VC firms/Institutional investors), corporate designations, target check sizes, sectors of interest, and communications logs detailing meeting schedules and startup investment requests.</p>
              </div>
            </div>
          </Section>

          <Section title="3. How We Process & Use Your Data" icon={<FileText size={16} className="text-[#FBBF24]" />}>
            <p>Your data is processed only under lawful bases (contractual necessity, legitimate interest, or explicit consent) for the following business purposes:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong>Verification & Safety:</strong> Authenticating documents to confirm that only accredited investors and qualified mentors are active on the platform.</li>
              <li><strong>Connection Algorithms:</strong> Matching founder startup profiles with the most relevant investors and mentor schedules.</li>
              <li><strong>AI Generation:</strong> Submitting non-identifying startup details to LLM API nodes (Gemini/OpenAI) to generate business plans, SWOT analyses, and logo elements.</li>
              <li><strong>Platform Operations:</strong> Facilitating live video bookings, chat messages, and handling payout settlements.</li>
              <li><strong>Billing Integration:</strong> Processing subscription plans and platform revenue splits securely through Stripe.</li>
            </ul>
          </Section>

          <Section title="4. Sub-Processors & Data Sharing Limits" icon={<Share2 size={16} className="text-[#FBBF24]" />}>
            <p>We do not lease, trade, or sell your personal credentials or business ideas to third-party advertisers. Data is shared only with vetted third-party service providers (sub-processors) under strict confidentiality agreements:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2 text-xs text-gray-400">
              <li><strong>Google Cloud & MongoDB Atlas:</strong> For hosting database systems and digital file storage.</li>
              <li><strong>Gemini & OpenAI API Services:</strong> For executing state-of-state AI document generations and chat feedback.</li>
              <li><strong>Stripe Inc:</strong> For handling card payments, subscription billing, and secure financial storage.</li>
              <li><strong>Brevo (Sendinblue):</strong> For transactional emails, system alerts, and notification dispatches.</li>
            </ul>
          </Section>

          <Section title="5. Data Security Standards" icon={<Lock size={16} className="text-[#FBBF24]" />}>
            <p>We apply high-grade security protocols to protect information against unauthorized disclosure, altering, or loss:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>All web transactions are encrypted in transit via SSL/TLS protocols.</li>
              <li>User passwords are hashed utilizing robust cryptographic algorithms (bcrypt) before database storage.</li>
              <li>Access control protocols limit database access only to authorized administrative roles.</li>
              <li>Data Room uploads utilize encrypted storage buckets to prevent unauthorized leakages.</li>
            </ul>
          </Section>

          <Section title="6. Retention & Account Deletion Rights" icon={<HelpCircle size={16} className="text-[#FBBF24]" />}>
            <p>We keep your data as long as your account is active. You possess complete rights to access, amend, or completely delete your personal information:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>You may request complete account deletion at any time via your Profile panel.</li>
              <li>Once requested, we purge all non-essential data and intellectual assets from our primary servers within thirty (30) days.</li>
              <li>Certain transaction logs or invoice histories must be retained longer to meet administrative tax and audit compliance duties.</li>
            </ul>
          </Section>

          <Section title="7. Contact Our Data Protection Officer" icon={<Shield size={16} className="text-[#FBBF24]" />}>
            <p>For inquiries, exercise of data rights, or queries regarding compliance regulations, you can contact our Data Protection Officer at:</p>
            <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 font-mono text-xs text-gray-400 mt-2 space-y-1">
              <p>Email: privacy@aistartupbuilder.com</p>
              <p>Subject Line: Data Privacy Inquiry</p>
              <p>Address: Tech Hub Center, Block 4B, Bangalore, India</p>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="space-y-3">
    <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-2">
      {icon} {title}
    </h2>
    <div className="space-y-2.5 text-gray-300 text-xs sm:text-sm">{children}</div>
  </div>
);

export default PrivacyPolicyPage;
