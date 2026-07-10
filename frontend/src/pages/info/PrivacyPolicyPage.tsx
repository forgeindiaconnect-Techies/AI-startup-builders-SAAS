import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, ArrowLeft, Shield } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[#6B7280] hover:text-[#5B21B6] font-medium text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="bg-[#5B21B6] text-[#FBBF24] p-2 rounded-lg"><Rocket size={24} /></div>
          <h1 className="text-3xl font-extrabold text-[#1F2937]">Privacy Policy</h1>
        </div>
        <p className="text-[#6B7280] mb-10 ml-12">Last updated: July 10, 2026</p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6 text-sm text-[#4B5563] leading-relaxed">
          <div className="flex items-center gap-3 mb-6 p-4 bg-[#5B21B6]/5 rounded-xl border border-[#5B21B6]/10">
            <Shield size={24} className="text-[#5B21B6] shrink-0" />
            <p className="font-medium text-[#1F2937]">Your privacy matters. We are committed to protecting your personal data.</p>
          </div>

          <Section title="1. Information We Collect">
            <p>We collect information you provide directly when creating an account, including your name, email address, role (founder, mentor, investor), and any profile details you choose to add such as expertise, bio, and startup ideas.</p>
            <p>We also automatically collect certain technical information when you use our platform, including IP address, browser type, device information, and usage data such as pages visited and features used.</p>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>Your information is used to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Create and manage your account</li>
              <li>Connect founders with mentors and investors</li>
              <li>Generate AI-powered startup analyses and reports</li>
              <li>Send platform notifications and updates</li>
              <li>Improve our AI models and platform features</li>
              <li>Ensure platform security and prevent fraud</li>
            </ul>
          </Section>

          <Section title="3. Data Sharing">
            <p>We share your information only with your consent or as necessary to provide our services. Founders can choose to share startup profiles with mentors and investors on the platform. We do not sell your personal data to third parties.</p>
          </Section>

          <Section title="4. Data Security">
            <p>We implement industry-standard encryption and security measures to protect your data. All passwords are hashed and never stored in plain text. We regularly review our security practices to maintain a high level of protection.</p>
          </Section>

          <Section title="5. Your Rights">
            <p>You have the right to access, update, or delete your personal data at any time. You can manage your profile settings from your dashboard or contact us for assistance. We will respond to your request within 30 days.</p>
          </Section>

          <Section title="6. Cookies">
            <p>We use essential cookies to operate the platform and optional analytics cookies to improve our service. You can manage your cookie preferences in your browser settings. See our Cookie Policy for more details.</p>
          </Section>

          <Section title="7. Contact Us">
            <p>If you have questions about this Privacy Policy, please contact our support team at privacy@aistartupbuilder.ai or through the Help Center on our platform.</p>
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

export default PrivacyPolicyPage;
