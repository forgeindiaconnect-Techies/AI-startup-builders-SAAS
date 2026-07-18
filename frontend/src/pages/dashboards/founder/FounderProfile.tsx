import React, { useState } from 'react';
import { Camera, Save } from 'lucide-react';

const FounderProfile: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
  });

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="pb-6 border-b border-gray-100 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-500 mt-1">Manage your public profile and account information.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Avatar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white text-4xl font-black shadow-xl">
              S
            </div>
            <button className="absolute bottom-0 right-0 w-9 h-9 bg-[#5B21B6] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#7C3AED] transition-colors">
              <Camera size={16} />
            </button>
          </div>
          <p className="font-bold text-gray-900 text-lg">{form.name}</p>
          <p className="text-sm text-[#5B21B6] font-bold uppercase tracking-widest mt-1">Founder</p>
          <p className="text-sm text-gray-500 mt-3 leading-relaxed">{form.location}</p>
        </div>

        {/* Form */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-5 pb-4 border-b border-gray-100">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Full Name', key: 'name', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Phone', key: 'phone', type: 'tel' },
                { label: 'Location', key: 'location', type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">{f.label}</label>
                  <input type={f.type} value={form[f.key as keyof typeof form]} onChange={e => update(f.key, e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]" />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Bio</label>
                <textarea value={form.bio} onChange={e => update('bio', e.target.value)} rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] resize-none" />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 mt-6">
              <button 
                onClick={() => window.alert("Profile settings saved successfully!")}
                className="flex items-center justify-center px-8 py-3.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl shadow-lg hover:shadow-xl text-sm transition-all transform hover:-translate-y-0.5"
              >
                <Save size={18} className="mr-2" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FounderProfile;
