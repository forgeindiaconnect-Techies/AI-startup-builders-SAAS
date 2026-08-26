import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, ArrowLeft, Cookie, Info, Eye, Compass, ShieldCheck } from 'lucide-react';

const CookiePolicyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white font-medium text-sm mb-8 transition-colors cursor-pointer bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10">
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="bg-[#5B21B6] text-[#FBBF24] p-3 rounded-xl shadow-md"><Rocket size={24} /></div>
          <h1 className="text-3xl font-extrabold text-white">Cookie Policy</h1>
        </div>
        <p className="text-gray-400 mb-10 ml-16 text-sm">Last updated: August 26, 2026</p>

        <div className="bg-[#111827] rounded-2xl border border-gray-800 shadow-xl p-8 sm:p-10 space-y-8 text-sm text-gray-300 leading-relaxed">
          <div className="flex items-start gap-4 p-5 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <Cookie size={24} className="text-amber-500 shrink-0 mt-1" />
            <div>
              <h2 className="font-bold text-white text-base mb-1">We Value Your Preference & Trust</h2>
              <p className="text-gray-400 text-xs">AI Startup Builder utilizes essential, analytics, and preference-tracking cookies to optimize dashboard performance, maintain active login sessions, and understand general user traffic flow.</p>
            </div>
          </div>

          <Section title="1. Introduction to Cookie Technologies" icon={<Info size={16} className="text-[#FBBF24]" />}>
            <p>Cookies are minute alphanumeric text files placed on your computer or mobile terminal when you visit web resources. They are standard tools across SaaS applications used to identify your browser, remember preferred settings, and securely store lightweight user states.</p>
            <p>In addition to browser-based cookies, we utilize web storage mechanisms (LocalStorage and SessionStorage) to store local interface variables, such as temporary form backups and token credentials.</p>
          </Section>

          <Section title="2. Classification of Cookies We Deploy" icon={<Eye size={16} className="text-[#FBBF24]" />}>
            <p>Our platform separates cookies and client-side storage technologies into three core categories based on their function:</p>
            
            <div className="space-y-4 mt-3 pl-4 border-l-2 border-amber-900">
              <div>
                <strong className="text-white block">A. Strictly Necessary (Essential) Cookies</strong>
                <p className="text-xs text-gray-450 mt-0.5">These are indispensable for maintaining the integrity of our security and authentication. For example, we use a JWT credential token cookie to verify your identity when you access dashboard layouts. Disabling these via your browser settings will prevent you from logging in or using the app.</p>
              </div>
              
              <div>
                <strong className="text-white block">B. Preference & Interface Cookies</strong>
                <p className="text-xs text-gray-450 mt-0.5">We use these to store dashboard UI preferences, active filters, and last-selected configurations. These ensure that your interface layout (such as selected tabs in approvals or layout sizes) remains customized on your next visit.</p>
              </div>

              <div>
                <strong className="text-white block">C. Performance & Analytics Storage</strong>
                <p className="text-xs text-gray-450 mt-0.5">These help us measure metrics such as average page load times, exit pages, and platform traffic counts. This data is collected on an anonymized basis and is strictly used to troubleshoot slow routes, improve usability, and optimize AI computation performance.</p>
              </div>
            </div>
          </Section>

          <Section title="3. Cookie Expiration & LocalStorage Inventory" icon={<Compass size={16} className="text-[#FBBF24]" />}>
            <p>Below is a breakdown of the specific tracking records we maintain inside your client browser:</p>
            
            <div className="overflow-x-auto my-3 border border-gray-800 rounded-xl">
              <table className="min-w-full divide-y divide-gray-800 text-xs text-left bg-gray-900/50">
                <thead className="bg-gray-900/80 font-bold text-gray-300 border-b border-gray-800">
                  <tr>
                    <th className="px-4 py-3">Storage Key / Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Purpose</th>
                    <th className="px-4 py-3">Duration / Lifespan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 text-gray-400">
                  <tr>
                    <td className="px-4 py-3 font-mono text-[#FBBF24]">ai_startup_builder_jwt</td>
                    <td className="px-4 py-3">Essential</td>
                    <td className="px-4 py-3">Stores your encrypted authorization login token.</td>
                    <td className="px-4 py-3">7 Days (Auto-renewed)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-[#FBBF24]">remembered_email</td>
                    <td className="px-4 py-3">Preference</td>
                    <td className="px-4 py-3">Pre-fills your login field if you click "Remember Me."</td>
                    <td className="px-4 py-3">30 Days (Persistent)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-[#FBBF24]">ai_startup_builder_users</td>
                    <td className="px-4 py-3">Operational Cache</td>
                    <td className="px-4 py-3">Caches user accounts locally for seamless dashboard rendering.</td>
                    <td className="px-4 py-3">Session-based / Manual Purge</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-[#FBBF24]">ai_startup_builder_mentor_profiles</td>
                    <td className="px-4 py-3">Operational Cache</td>
                    <td className="px-4 py-3">Caches mentor metadata and availability states.</td>
                    <td className="px-4 py-3">Session-based / Manual Purge</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="4. Third-Party Integrations" icon={<ShieldCheck size={16} className="text-[#FBBF24]" />}>
            <p>Our platform does not integrate third-party advertising trackers or ad networks. However, secure external operations (like Stripe Checkout panels) place cookies directly on your browser to facilitate transaction security and credit card authorization. These external cookies are governed directly by Stripe's Privacy and Cookie statements.</p>
          </Section>

          <Section title="5. How to Control & Clear Cookie Files" icon={<Cookie size={16} className="text-amber-500" />}>
            <p>You hold the choice to modify, reject, or completely erase cookies at your convenience. Most web browsers allow you to manage preferences via their Settings panels. Please note that blocking essential cookies may break your login status or cause dashboard features to fail.</p>
            <p className="mt-2 text-xs text-gray-500">To inspect or alter settings, refer to the guides provided by major browser manufacturers:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2 text-xs">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-[#FBBF24] hover:underline font-bold">Google Chrome Cookies Configuration</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences" target="_blank" rel="noopener noreferrer" className="text-[#FBBF24] hover:underline font-bold">Mozilla Firefox Cookies Management</a></li>
              <li><a href="https://support.apple.com/en-us/HT201265" target="_blank" rel="noopener noreferrer" className="text-[#FBBF24] hover:underline font-bold">Safari Cookies Preference Details</a></li>
              <li><a href="https://support.microsoft.com/en-us/windows/microsoft-edge-browsing-data-and-privacy-1824ec4d-5c0b-45c7-b9d7-9e5f0db211b8" target="_blank" rel="noopener noreferrer" className="text-[#FBBF24] hover:underline font-bold">Microsoft Edge Privacy & Cookies Help</a></li>
            </ul>
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

export default CookiePolicyPage;
