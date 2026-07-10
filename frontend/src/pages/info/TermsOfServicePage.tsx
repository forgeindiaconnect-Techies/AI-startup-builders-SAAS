import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, ArrowLeft, FileJson } from 'lucide-react';

const TermsOfServicePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[#6B7280] hover:text-[#5B21B6] font-medium text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="bg-[#5B21B6] text-[#FBBF24] p-2 rounded-lg"><Rocket size={24} /></div>
          <h1 className="text-3xl font-extrabold text-[#1F2937]">Terms of Service</h1>
        </div>
        <p className="text-[#6B7280] mb-10 ml-12">Last updated: July 10, 2026</p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6 text-sm text-[#4B5563] leading-relaxed">
          <div className="flex items-center gap-3 mb-6 p-4 bg-[#5B21B6]/5 rounded-xl border border-[#5B21B6]/10">
            <FileJson size={24} className="text-[#5B21B6] shrink-0" />
            <p className="font-medium text-[#1F2937]">By using AI Startup Builder, you agree to these terms. Please read them carefully.</p>
          </div>

          <Section title="1. Acceptance of Terms">
            <p>By accessing or using AI Startup Builder, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>
          </Section>

          <Section title="2. Account Registration">
            <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your login credentials. Accounts are subject to admin approval and may be suspended for violations of these terms.</p>
          </Section>

          <Section title="3. User Roles and Responsibilities">
            <p>Founders agree to provide honest information about their startup ideas and progress. Mentors agree to provide constructive and professional guidance. Investors agree to conduct due diligence and act in good faith. All users agree to treat each other with respect.</p>
          </Section>

          <Section title="4. AI-Generated Content">
            <p>AI-generated reports, analyses, and suggestions are provided for informational purposes only and do not constitute professional advice. We make no guarantees about the accuracy or completeness of AI-generated content. Users should independently verify any critical business decisions.</p>
          </Section>

          <Section title="5. Intellectual Property">
            <p>You retain ownership of your startup ideas, business plans, and other content you submit. AI Startup Builder owns the platform code, design, and underlying AI models. You may not copy, modify, or reverse-engineer the platform.</p>
          </Section>

          <Section title="6. Prohibited Activities">
            <p>You may not use the platform for any illegal purpose, to harass or harm other users, to submit false or misleading information, or to attempt to circumvent platform security measures. Violations will result in immediate account suspension.</p>
          </Section>

          <Section title="7. Limitation of Liability">
            <p>AI Startup Builder is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the platform, including lost profits or business opportunities. Our total liability is limited to the amount you paid for your subscription.</p>
          </Section>

          <Section title="8. Termination">
            <p>We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time from your profile settings. Upon termination, your data will be deleted within 30 days unless required for legal purposes.</p>
          </Section>

          <Section title="9. Changes to Terms">
            <p>We may update these terms from time to time. We will notify users of material changes via email or platform notification. Continued use after changes take effect constitutes acceptance of the new terms.</p>
          </Section>

          <Section title="10. Contact">
            <p>For questions about these terms, contact us at legal@aistartupbuilder.ai.</p>
          </Section>
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h2 className="text-base font-bold text-[#1F2937] mb-3">{title}</h2>
    <div className="space-y-2">{children}</div>
  </div>
);

export default TermsOfServicePage;
