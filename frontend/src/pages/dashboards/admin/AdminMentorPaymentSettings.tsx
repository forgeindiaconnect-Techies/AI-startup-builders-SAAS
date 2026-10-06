import React, { useState, useEffect } from 'react';
import { IndianRupee, Save, Percent, Briefcase, Calendar } from 'lucide-react';
import { getMentorPaymentSettings, saveMentorPaymentSettings } from '../../../utils/localStorageHelper';

const AdminMentorPaymentSettings: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setSettings(getMentorPaymentSettings());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSettings((prev: any) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      saveMentorPaymentSettings(settings);
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 600);
  };

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Briefcase size={20} className="text-[#5B21B6]" /> Payment Models
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">External Mentors Default Model</label>
            <select
              name="externalPaymentType"
              value={settings.externalPaymentType}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/20 transition-all outline-none font-medium text-gray-700 text-sm"
            >
              <option>Per Task</option>
              <option>Per Day</option>
              <option>Weekly Salary</option>
              <option>Monthly Salary</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Internal Mentors Default Model</label>
            <select
              name="internalPaymentType"
              value={settings.internalPaymentType}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/20 transition-all outline-none font-medium text-gray-700 text-sm"
            >
              <option>Per Task</option>
              <option>Per Day</option>
              <option>Weekly Salary</option>
              <option>Monthly Salary</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Percent size={20} className="text-[#5B21B6]" /> Revenue Split (Per Task Model)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Mentor Share (%)</label>
            <input
              type="number"
              name="mentorShare"
              value={settings.mentorShare}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/20 transition-all outline-none font-medium text-gray-700 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Platform Commission (%)</label>
            <input
              type="number"
              name="platformCommission"
              value={settings.platformCommission}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/20 transition-all outline-none font-medium text-gray-700 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <IndianRupee size={20} className="text-[#5B21B6]" /> Per Task Base Rates (₹)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Basic Review</label>
            <input
              type="number"
              name="basicReviewAmount"
              value={settings.basicReviewAmount}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/20 transition-all outline-none font-medium text-gray-700 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Detailed Review</label>
            <input
              type="number"
              name="detailedReviewAmount"
              value={settings.detailedReviewAmount}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/20 transition-all outline-none font-medium text-gray-700 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">1:1 Call (30 mins)</label>
            <input
              type="number"
              name="call30MinAmount"
              value={settings.call30MinAmount}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/20 transition-all outline-none font-medium text-gray-700 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">1:1 Call (45 mins)</label>
            <input
              type="number"
              name="call45MinAmount"
              value={settings.call45MinAmount}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/20 transition-all outline-none font-medium text-gray-700 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">1:1 Call (60 mins)</label>
            <input
              type="number"
              name="call60MinAmount"
              value={settings.call60MinAmount}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/20 transition-all outline-none font-medium text-gray-700 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Calendar size={20} className="text-[#5B21B6]" /> Salary & Payout Configurations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Weekly Salary (₹)</label>
            <input
              type="number"
              name="weeklySalaryAmount"
              value={settings.weeklySalaryAmount}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/20 transition-all outline-none font-medium text-gray-700 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Monthly Salary (₹)</label>
            <input
              type="number"
              name="monthlySalaryAmount"
              value={settings.monthlySalaryAmount}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/20 transition-all outline-none font-medium text-gray-700 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Payout Cycle</label>
            <select
              name="payoutCycle"
              value={settings.payoutCycle}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/20 transition-all outline-none font-medium text-gray-700 text-sm"
            >
              <option>Weekly</option>
              <option>Bi-weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Min Weekly Target (Tasks)</label>
            <input
              type="number"
              name="minWeeklyTarget"
              value={settings.minWeeklyTarget}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/20 transition-all outline-none font-medium text-gray-700 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Min Monthly Target (Tasks)</label>
            <input
              type="number"
              name="minMonthlyTarget"
              value={settings.minMonthlyTarget}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/20 transition-all outline-none font-medium text-gray-700 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center px-6 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
          ) : (
            <Save size={18} className="mr-2" />
          )}
          {saveSuccess ? 'Settings Saved!' : 'Save Payment Settings'}
        </button>
      </div>
    </div>
  );
};

export default AdminMentorPaymentSettings;
