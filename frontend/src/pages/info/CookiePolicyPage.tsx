import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, ArrowLeft, Cookie } from 'lucide-react';

const CookiePolicyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[#6B7280] hover:text-[#5B21B6] font-medium text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="bg-[#5B21B6] text-[#FBBF24] p-2 rounded-lg"><Rocket size={24} /></div>
          <h1 className="text-3xl font-extrabold text-[#1F2937]">Cookie Policy</h1>
        </div>
        <p className="text-[#6B7280] mb-10 ml-12">Last updated: July 10, 2026</p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6 text-sm text-[#4B5563] leading-relaxed">
          <div className="flex items-center gap-3 mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <Cookie size={24} className="text-amber-600 shrink-0" />
            <p className="font-medium text-[#1F2937]">We use cookies to make our platform work and improve your experience.</p>
          </div>

          <Section title="1. What Are Cookies">
            <p>Cookies are small text files stored on your device by your web browser. They help websites remember your preferences, login status, and other information to provide a seamless experience.</p>
          </Section>

          <Section title="2. Types of Cookies We Use">
            <h3 className="font-bold text-[#1F2937] mt-4 mb-2">Essential Cookies</h3>
            <p>These cookies are necessary for the platform to function properly. They enable core features like authentication, session management, and security. You cannot opt out of essential cookies while using the platform.</p>

            <h3 className="font-bold text-[#1F2937] mt-4 mb-2">Analytics Cookies</h3>
            <p>We use analytics cookies to understand how users interact with our platform, which features are most popular, and where improvements can be made. This data is anonymous and helps us build a better product.</p>

            <h3 className="font-bold text-[#1F2937] mt-4 mb-2">Preference Cookies</h3>
            <p>These cookies remember your settings and preferences, such as theme selection and notification settings, so you don't have to reconfigure them each time you visit.</p>
          </Section>

          <Section title="3. Third-Party Cookies">
            <p>We may use third-party services (such as analytics providers) that set their own cookies. These services are carefully vetted and contractually bound to protect your data. We do not allow third-party advertising cookies on our platform.</p>
          </Section>

          <Section title="4. Managing Cookies">
            <p>You can control and manage cookies through your browser settings. Most browsers allow you to block or delete cookies. However, disabling essential cookies may prevent the platform from functioning correctly. Below are links to manage cookies in common browsers:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-[#5B21B6] hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences" target="_blank" rel="noopener noreferrer" className="text-[#5B21B6] hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/en-us/HT201265" target="_blank" rel="noopener noreferrer" className="text-[#5B21B6] hover:underline">Safari</a></li>
              <li><a href="https://support.microsoft.com/en-us/windows/microsoft-edge-browsing-data-and-privacy-1824ec4d-5c0b-45c7-b9d7-9e5f0db211b8" target="_blank" rel="noopener noreferrer" className="text-[#5B21B6] hover:underline">Microsoft Edge</a></li>
            </ul>
          </Section>

          <Section title="5. Updates to This Policy">
            <p>We may update this Cookie Policy from time to time. Changes will be posted here with an updated date. Significant changes will be communicated via platform notification.</p>
          </Section>

          <Section title="6. Contact">
            <p>If you have questions about our use of cookies, please contact us at privacy@yourdomain.com.</p>
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

export default CookiePolicyPage;
