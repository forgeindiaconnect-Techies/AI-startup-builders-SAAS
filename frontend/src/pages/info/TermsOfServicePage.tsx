import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, ArrowLeft, FileJson, Scale, ShieldAlert, Award, CreditCard, Ban, Trash2 } from 'lucide-react';

const TermsOfServicePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white font-medium text-sm mb-8 transition-colors cursor-pointer bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10">
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="bg-[#5B21B6] text-[#FBBF24] p-3 rounded-xl shadow-md"><Rocket size={24} /></div>
          <h1 className="text-3xl font-extrabold text-white">Terms of Service</h1>
        </div>
        <p className="text-gray-400 mb-10 ml-16 text-sm">Last updated: August 26, 2026</p>

        <div className="bg-[#111827] rounded-2xl border border-gray-800 shadow-xl p-8 sm:p-10 space-y-8 text-sm text-gray-300 leading-relaxed">
          <div className="flex items-start gap-4 p-5 bg-[#5B21B6]/10 rounded-xl border border-[#5B21B6]/20">
            <FileJson size={24} className="text-[#FBBF24] shrink-0 mt-1" />
            <div>
              <h2 className="font-bold text-white text-base mb-1">Contractual Binding Agreement</h2>
              <p className="text-gray-400 text-xs">By initializing membership, creating an account, or interacting with the AI Startup Builder platform, you enter into a legally binding agreement. Please read these terms carefully before accessing any dashboards or uploading proprietary startup information.</p>
            </div>
          </div>

          <Section title="1. Acceptance & Scope of Agreement" icon={<Scale size={16} className="text-[#FBBF24]" />}>
            <p>These Terms of Service ("Terms") govern your access to and use of the website, mobile applications, API layers, and dashboards operated by AI Startup Builder. By accessing the platform, you certify that you are at least 18 years of age and possess the legal power to form a binding contract under applicable regional laws.</p>
            <p>If you are registering on behalf of a corporate entity, you represent and warrant that you hold the legal authority to bind that entity to these conditions.</p>
          </Section>

          <Section title="2. Account Verification & Admin Approval Controls" icon={<ShieldAlert size={16} className="text-[#FBBF24]" />}>
            <p>To access special features (such as the Investor Marketplace, Mentor Consultations, or AI Analysis tools), you must sign up and provide authentic profile details. You agree to:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Submit genuine and complete credentials, including valid identity or accreditation documents where requested.</li>
              <li>Accept that Mentor and Investor profiles require explicit administrative approval. The admin team reserves the right to reject, suspend, or request additional documentation for any applicant at their sole discretion.</li>
              <li>Keep login passwords confidential. You are solely responsible for all activities occurring under your authenticated session.</li>
            </ul>
          </Section>

          <Section title="3. Subscription Billings, Cancellations & Refund Rules" icon={<CreditCard size={16} className="text-[#FBBF24]" />}>
            <p>The platform offers subscription packages for premium startup building assets and AI generation runs. All billing flows are processed via Stripe:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong>Billing Cycle:</strong> Subscriptions are billed on a recurring monthly or annual basis depending on your selection. Recurring fees will be charged automatically to your linked payment card.</li>
              <li><strong>Trial Limitations:</strong> Once your free trial or current subscription period finishes, access to premium tools will be gated. You will be redirected to the billing page to update your payment settings.</li>
              <li><strong>Refund Policy:</strong> Due to server operational costs incurred during AI model computations (OpenAI/Gemini integrations), all purchases and renewals are non-refundable unless required by mandatory regional consumer laws.</li>
              <li><strong>Cancellations:</strong> You can cancel your subscription at any time. Upon cancellation, you will retain access until the end of your prepaid billing term.</li>
            </ul>
          </Section>

          <Section title="4. Disclaimer on AI-Generated Assets" icon={<Award size={16} className="text-[#FBBF24]" />}>
            <p>The business plans, competitor comparisons, plagiarisms tests, SWOT analysis parameters, and logo configurations are generated dynamically by Large Language Models (LLM APIs). You acknowledge and agree that:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>AI-generated assets are provided purely for informational, draft-building, and ideation purposes.</li>
              <li>They do not represent certified professional legal, financial, tax, or investment advice.</li>
              <li>We make no representations or warranties regarding the absolute accuracy, uniqueness, or compliance of AI outputs. You are responsible for consulting certified professionals before making key business or investment decisions.</li>
            </ul>
          </Section>

          <Section title="5. Intellectual Property Rights & Ownership" icon={<FileJson size={16} className="text-[#FBBF24]" />}>
            <p><strong>Your Content:</strong> You retain full copyright and ownership over your raw startup ideas, business drafts, files uploaded to your Data Room, and private communications. We do not claim ownership of your intellectual assets.</p>
            <p><strong>Platform IP:</strong> AI Startup Builder retains exclusive ownership of the platform structure, backend codes, proprietary AI orchestration frameworks, visual styling designs, and graphics. You may not copy, reverse-engineer, or commercially exploit our codebase or platform layouts.</p>
          </Section>

          <Section title="6. Prohibited Account Conduct" icon={<Ban size={16} className="text-[#FBBF24]" />}>
            <p>Users are expected to operate with professional integrity. You agree NOT to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2 text-xs text-gray-400">
              <li>Submit plagiarized, misleading, or fraudulent business plans.</li>
              <li>Deploy automated scripts, bots, or scrapers to extract platform data or exhaust AI API quotas.</li>
              <li>Impersonate accredited investors, administrative staff, or certified mentors.</li>
              <li>Circumvent platform payment structures (e.g. attempting off-platform fee avoidance for mentor calls booked through our ledgers).</li>
            </ul>
          </Section>

          <Section title="7. Indemnification & Limitation of Liability" icon={<Scale size={16} className="text-[#FBBF24]" />}>
            <p>You agree to indemnify, defend, and hold harmless AI Startup Builder and its officers against any legal claims, liabilities, or losses arising from your breach of these terms, your platform submissions, or your interactions with other platform users.</p>
            <p>Under no circumstances shall we be liable for indirect, accidental, or consequential damages (including lost investment funds, business opportunities, or startup failures). Our maximum liability for any claim is capped at the total subscription fees paid by you to us in the six (6) months prior to the dispute.</p>
          </Section>

          <Section title="8. Account Termination & Suspensions" icon={<Trash2 size={16} className="text-[#FBBF24]" />}>
            <p>We reserve the right to temporarily suspend or permanently delete accounts that violate these Terms or present security risks to our infrastructure, without prior notification. You can delete your account at any time via your Profile panel, which will purge your records according to our Privacy Policy.</p>
          </Section>

          <Section title="9. Governing Law & Dispute Resolution" icon={<Scale size={16} className="text-[#FBBF24]" />}>
            <p>These terms are governed by the laws of India, without regard to conflict of law principles. Any legal disputes or claims arising out of these terms shall be subject to the exclusive jurisdiction of the competent courts located in Bangalore, India.</p>
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

export default TermsOfServicePage;
