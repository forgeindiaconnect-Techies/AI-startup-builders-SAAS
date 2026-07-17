import React, { useState, useEffect, useRef } from 'react';
import { Camera, Save, CheckCircle2, Clock, ShieldAlert, Lock, Globe, Briefcase, MapPin, Star } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export interface MentorProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  expertise: string;
  linkedin: string;
  bio: string;
  photoUrl: string;
  experienceYears: string;
  category: 'SaaS' | 'Marketing' | 'AI/ML' | 'Fintech' | 'Product' | 'Sales' | 'Strategy' | 'Legal';
  availability: 'Available' | 'Busy' | 'Not Available';
  reviewPrice?: string;
  callPrice?: string;
  languages: string;
  verificationStatus: 'Pending' | 'Verified';
  rating?: number;
  reviewsCount?: number;
}
export const MentorProfileData = {};

const defaultMentorProfile: MentorProfileData = {
  id: '',
  name: '',
  email: '',
  phone: '',
  location: '',
  expertise: '',
  linkedin: '',
  bio: '',
  photoUrl: '',
  experienceYears: '',
  category: 'SaaS',
  availability: 'Available',
  languages: '',
  verificationStatus: 'Pending',
  rating: 0,
  reviewsCount: 0,
};

const categories: MentorProfileData['category'][] = [
  'SaaS',
  'Marketing',
  'AI/ML',
  'Fintech',
  'Product',
  'Sales',
  'Strategy',
  'Legal'
];

const availabilityOptions: MentorProfileData['availability'][] = [
  'Available',
  'Busy',
  'Not Available'
];

const MentorProfile: React.FC = () => {
  const { user } = useAuth();
  const [form, setForm] = useState<MentorProfileData>(defaultMentorProfile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ai_startup_builder_mentor_profiles');
      let profiles: MentorProfileData[] = [];
      if (stored) {
        profiles = JSON.parse(stored);
      }
      const myId = user?.id || '';
      const found = profiles.find(p => p.id === myId || p.name === user?.fullName);
      if (found) {
        setForm(found);
      } else {
        const initial = { ...defaultMentorProfile, id: myId };
        if (user?.fullName) initial.name = user.fullName;
        if (user?.email) initial.email = user.email;
        profiles.push(initial);
        localStorage.setItem('ai_startup_builder_mentor_profiles', JSON.stringify(profiles));
        setForm(initial);
      }
    } catch (e) {
      setForm(defaultMentorProfile);
    }
  }, [user]);

  const update = (key: keyof MentorProfileData, val: any) => {
    setForm(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = () => {
    try {
      const stored = localStorage.getItem('ai_startup_builder_mentor_profiles');
      let profiles: any[] = [];
      if (stored) {
        profiles = JSON.parse(stored);
      }
      const myId = user?.id || form.id || '';
      const updatedEntry = { 
        ...form, 
        id: myId, 
        updatedAt: 'Just now',
        lastUpdated: new Date().toISOString()
      };

      const existingIndex = profiles.findIndex(p => p.id === myId || p.name === form.name || p.id === form.id);
      if (existingIndex >= 0) {
        profiles[existingIndex] = { ...profiles[existingIndex], ...updatedEntry };
      } else {
        profiles.push(updatedEntry);
      }

      localStorage.setItem('ai_startup_builder_mentor_profiles', JSON.stringify(profiles));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('mentor_profile_updated'));
      window.alert("✅ Profile settings saved successfully! Your profile details are now visible to the Admin Dashboard in Mentor Approval.");
    } catch (e) {
      window.alert("Error saving profile settings.");
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        update('photoUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getVerificationBadge = () => {
    if (form.verificationStatus === 'Verified') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200 shadow-sm">
          <CheckCircle2 size={14} className="text-emerald-600" /> Verified Mentor
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold border border-amber-200 shadow-sm">
          <Clock size={14} className="text-amber-600" /> Pending Verification
        </span>
      );
    }
  };

  return (
    <div className="animate-fade-in-up pb-12 space-y-8">
      {/* Top Header */}
      <div className="pb-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          {getVerificationBadge()}
        </div>
        <p className="text-gray-500 mt-1">Manage your public mentor profile, availability, and private contact credentials.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Overview Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center h-fit">
          <div className="relative mb-4">
            {form.photoUrl ? (
              <img src={form.photoUrl} alt={form.name} className="w-28 h-28 rounded-full object-cover border-2 border-purple-100 shadow-lg" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-xl">
                {form.name ? form.name.charAt(0).toUpperCase() : 'M'}
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*"
              onChange={handlePhotoUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-9 h-9 bg-[#5B21B6] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#7C3AED] transition-colors"
              title="Change profile photo"
            >
              <Camera size={16} />
            </button>
          </div>

          <h3 className="font-bold text-gray-900 text-lg mt-1">{form.name}</h3>
          <span className="text-xs font-bold text-[#5B21B6] bg-purple-50 px-3 py-1 rounded-full border border-purple-100 mt-1.5">
            {form.category} Specialist
          </span>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mt-3">
            <MapPin size={14} className="text-gray-400" /> {form.location || "Location not set"}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-yellow-500 font-bold mt-2 bg-yellow-50/80 px-3 py-1 rounded-lg">
            <Star size={13} className="fill-yellow-500" /> {form.rating || 4.9} ({form.reviewsCount || 48} reviews)
          </div>

          <div className="w-full border-t border-gray-100 mt-6 pt-5 space-y-3.5 text-left text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Status:</span>
              <span className={`font-bold px-2.5 py-0.5 rounded-full ${
                form.availability === 'Available' ? 'bg-emerald-100 text-emerald-800' :
                form.availability === 'Busy' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
              }`}>
                {form.availability}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Experience:</span>
              <span className="font-bold text-gray-900">{form.experienceYears || "10+ Years"}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Profile & Private Credentials */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Public Mentorship Profile */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-gray-100">
                <Briefcase size={18} className="text-[#5B21B6]" /> Public Mentor Profile
              </h2>
              <p className="text-xs text-gray-500 mt-1">This information is publicly visible to founders exploring the mentor network.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={e => update('name', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Mentor Category</label>
                <select 
                  value={form.category} 
                  onChange={e => update('category', e.target.value as any)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] bg-white font-medium"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Years of Experience</label>
                <input 
                  type="text" 
                  value={form.experienceYears} 
                  placeholder="e.g. 12+ Years"
                  onChange={e => update('experienceYears', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Availability Status</label>
                <select 
                  value={form.availability} 
                  onChange={e => update('availability', e.target.value as any)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] bg-white font-medium"
                >
                  {availabilityOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Languages</label>
                <input 
                  type="text" 
                  value={form.languages} 
                  placeholder="e.g. English, Spanish"
                  onChange={e => update('languages', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Location</label>
                <input 
                  type="text" 
                  value={form.location} 
                  placeholder="e.g. New York, NY"
                  onChange={e => update('location', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]" 
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Expertise (comma separated)</label>
                <input 
                  type="text" 
                  value={form.expertise} 
                  placeholder="e.g. SaaS, Go-to-Market, Fundraising, Product Strategy"
                  onChange={e => update('expertise', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]" 
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">LinkedIn Profile URL</label>
                <div className="relative flex items-center">
                  <Globe size={16} className="absolute left-3.5 text-blue-600 pointer-events-none" />
                  <input 
                    type="text" 
                    value={form.linkedin} 
                    placeholder="e.g. linkedin.com/in/alexrivera"
                    onChange={e => update('linkedin', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]" 
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Bio & Investment Thesis</label>
                <textarea 
                  value={form.bio} 
                  onChange={e => update('bio', e.target.value)} 
                  rows={3}
                  placeholder="Share your background, key achievements, and the types of founders you love helping..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] resize-none leading-relaxed" 
                />
              </div>
            </div>
          </div>

          {/* Card 2: Private Contact Information (Visible only to Admin) */}
          <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-6 sm:p-8 space-y-6 bg-gradient-to-br from-white via-purple-50/10 to-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Lock size={18} className="text-[#5B21B6]" /> Private Contact Details
                </h2>
                <p className="text-xs text-gray-500 mt-1">Confidential information for platform verification and payouts.</p>
              </div>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-[#5B21B6] rounded-full text-xs font-bold shrink-0">
                <Lock size={12} /> Visible Only to Admin
              </span>
            </div>

            <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-4 flex items-start gap-3 text-xs text-purple-900 font-medium">
              <ShieldAlert size={18} className="text-[#5B21B6] shrink-0 mt-0.5" />
              <p>
                <strong>Privacy Guarantee:</strong> Your email and phone number are strictly confidential and visible only to system administrators. Founders browsing the mentor directory or booking sessions will only see your public profile details above.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                  <span>Email Address</span>
                  <span className="text-[10px] text-[#5B21B6] font-extrabold">🔒 ADMIN ONLY</span>
                </label>
                <input 
                  type="email" 
                  value={form.email} 
                  onChange={e => update('email', e.target.value)}
                  className="w-full px-4 py-2.5 border border-purple-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] bg-white font-medium" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                  <span>Phone Number</span>
                  <span className="text-[10px] text-[#5B21B6] font-extrabold">🔒 ADMIN ONLY</span>
                </label>
                <input 
                  type="tel" 
                  value={form.phone} 
                  onChange={e => update('phone', e.target.value)}
                  className="w-full px-4 py-2.5 border border-purple-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] bg-white font-medium" 
                />
              </div>
            </div>
          </div>

          {/* Save Changes Button inside bottom/last */}
          <div className="flex justify-end pt-2">
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

export default MentorProfile;
