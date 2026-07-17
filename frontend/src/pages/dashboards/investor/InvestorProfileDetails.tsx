import React, { useState, useEffect } from 'react';
import { Save, UserRound, ShieldCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export interface InvestorProfileData {
  id: string;
  investorName: string;
  email: string;
  phone: string;
  address: string;
  investorType: 'Angel Investor' | 'VC Firm' | 'Institutional Investor';
  typicalCheckSize: string;
  sectorsOfInterest: string;
  investmentThesis: string;
  verificationStatus: 'pending' | 'Verified' | 'Rejected';
}
export const InvestorProfileData = {};

const defaultProfile: InvestorProfileData = {
  id: '',
  investorName: '',
  email: '',
  phone: '',
  address: '',
  investorType: 'Angel Investor' as const,
  typicalCheckSize: '',
  sectorsOfInterest: '',
  investmentThesis: '',
  verificationStatus: 'pending'
};

const InvestorProfileDetails: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<InvestorProfileData>(defaultProfile);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ai_startup_builder_investor_profiles');
      let profiles: InvestorProfileData[] = [];
      if (stored) {
        profiles = JSON.parse(stored);
      }
      const myId = user?.id || '';
      const found = profiles.find(p => p.id === myId || p.id === user?.id || p.investorName === user?.fullName);
      if (found) {
        setProfile(found);
      } else {
        // Initialize if not found
        const initial = { ...defaultProfile, id: myId };
        if (user?.fullName) initial.investorName = user.fullName;
        if (user?.email) initial.email = user.email;
        profiles.push(initial);
        localStorage.setItem('ai_startup_builder_investor_profiles', JSON.stringify(profiles));
        setProfile(initial);
      }
    } catch (e) {
      setProfile(defaultProfile);
    }
  }, [user]);

  useEffect(() => {
    const handleRemoteSave = () => {
      handleSave();
    };
    window.addEventListener('save_investor_profile', handleRemoteSave);
    return () => window.removeEventListener('save_investor_profile', handleRemoteSave);
  }, [profile]);

  const handleSave = () => {
    try {
      const stored = localStorage.getItem('ai_startup_builder_investor_profiles');
      let profiles: InvestorProfileData[] = [];
      if (stored) {
        profiles = JSON.parse(stored);
      }
      const myId = user?.id || '';
      const existingIndex = profiles.findIndex(p => p.id === profile.id || p.id === user?.id || p.id === myId);
      if (existingIndex >= 0) {
        profiles[existingIndex] = { ...profiles[existingIndex], ...profile, id: myId };
      } else {
        profiles.push({ ...profile, id: myId });
      }
      localStorage.setItem('ai_startup_builder_investor_profiles', JSON.stringify(profiles));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('investor_kyc_updated'));
      window.alert("✅ Investor Profile & KYC details saved successfully! All details and documents are synced with Admin Investor Approvals.");
    } catch (e) {
      window.alert("Error saving profile.");
    }
  };

  const getBadge = () => {
    const status = profile.verificationStatus || 'pending';
    if (status === 'Verified' || status === 'Approved' as any) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200 shadow-sm">
          <CheckCircle2 size={14} className="text-emerald-600" /> Verified
        </span>
      );
    } else if (status === 'Rejected') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-xs font-bold border border-red-200 shadow-sm">
          <ShieldAlert size={14} className="text-red-600" /> Rejected
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs font-bold border border-amber-200 shadow-sm">
          <ShieldCheck size={14} className="text-amber-600" /> Pending Verification
        </span>
      );
    }
  };

  return (
    <div className="animate-fade-in-up pb-4">
      <div className="pb-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Profile & KYC</h1>
          {getBadge()}
        </div>
        <p className="text-gray-500 mt-1">Manage your investor profile, contact information, and verified KYC accreditation documents all in one place.</p>
      </div>

      <div className="max-w-3xl">
        {/* Basic Information Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
          <h2 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100 flex items-center gap-2">
            <UserRound size={18} className="text-[#5B21B6]" /> Basic & Contact Details
          </h2>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Investor Name / Company Name</label>
            <input 
              type="text" 
              value={profile.investorName} 
              onChange={e => setProfile({ ...profile, investorName: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] text-gray-900 font-medium"
              placeholder="Enter company name"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Email Address</label>
              <input 
                type="email" 
                value={profile.email} 
                onChange={e => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] text-gray-900"
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Phone Number</label>
              <input 
                type="text" 
                value={profile.phone} 
                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] text-gray-900"
                placeholder="Enter phone"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Address</label>
            <input 
              type="text" 
              value={profile.address} 
              onChange={e => setProfile({ ...profile, address: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] text-gray-900"
              placeholder="Enter address"
            />
          </div>

          <div className="pt-2">
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-start gap-3">
              <ShieldCheck className="text-[#5B21B6] shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-xs font-bold text-purple-900">Accreditation Requirements</p>
                <p className="text-xs text-purple-700 mt-0.5">To verify your investor profile and unlock direct term-sheet capabilities, please upload your KYC documents in the next tab.</p>
              </div>
            </div>
          </div>

          {/* Save Changes Button at the bottom (in last) */}
          <div className="flex justify-end pt-4 border-t border-gray-100 mt-6">
            <button 
              onClick={handleSave}
              className="flex items-center justify-center px-8 py-3.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl shadow-lg hover:shadow-xl text-sm transition-all transform hover:-translate-y-0.5"
            >
              <Save size={18} className="mr-2" /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestorProfileDetails;
