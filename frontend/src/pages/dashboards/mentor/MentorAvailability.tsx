import React, { useState } from 'react';
import { Calendar, Clock, Plus, Trash2, Save } from 'lucide-react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const initialSlots: Record<string, { start: string; end: string }[]> = {
  Monday: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }],
  Tuesday: [{ start: '10:00', end: '15:00' }],
  Wednesday: [],
  Thursday: [{ start: '13:00', end: '18:00' }],
  Friday: [{ start: '09:00', end: '13:00' }],
  Saturday: [],
  Sunday: [],
};

const MentorAvailability: React.FC = () => {
  const [slots, setSlots] = useState(initialSlots);

  const addSlot = (day: string) => {
    setSlots(s => ({ ...s, [day]: [...s[day], { start: '09:00', end: '17:00' }] }));
  };

  const removeSlot = (day: string, idx: number) => {
    setSlots(s => ({ ...s, [day]: s[day].filter((_, i) => i !== idx) }));
  };

  const updateSlot = (day: string, idx: number, key: 'start' | 'end', val: string) => {
    setSlots(s => ({
      ...s,
      [day]: s[day].map((slot, i) => i === idx ? { ...slot, [key]: val } : slot),
    }));
  };

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Availability / Calendar</h1>
          <p className="text-gray-500 mt-1">Set your available time slots for founders to book mentoring sessions.</p>
        </div>
        <button className="flex items-center px-4 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl shadow text-sm transition-colors">
          <Save size={16} className="mr-2" /> Save Schedule
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-3xl">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
          <Clock size={18} className="text-[#5B21B6]" />
          <h2 className="font-bold text-gray-900">Weekly Hours</h2>
        </div>

        <div className="space-y-6">
          {days.map(day => (
            <div key={day} className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="w-32 flex items-center gap-3 pt-2">
                <input type="checkbox" checked={slots[day].length > 0} onChange={() => slots[day].length > 0 ? setSlots(s => ({ ...s, [day]: [] })) : addSlot(day)} className="w-4 h-4 text-[#5B21B6] rounded focus:ring-[#5B21B6]" />
                <span className={`text-sm font-semibold ${slots[day].length > 0 ? 'text-gray-900' : 'text-gray-400'}`}>{day}</span>
              </div>
              
              <div className="flex-1 space-y-3">
                {slots[day].length === 0 ? (
                  <p className="text-sm text-gray-400 italic pt-2">Unavailable</p>
                ) : (
                  slots[day].map((slot, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <input type="time" value={slot.start} onChange={e => updateSlot(day, i, 'start', e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5B21B6] outline-none" />
                      <span className="text-gray-400">-</span>
                      <input type="time" value={slot.end} onChange={e => updateSlot(day, i, 'end', e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5B21B6] outline-none" />
                      <button onClick={() => removeSlot(day, i)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  ))
                )}
                {slots[day].length > 0 && (
                  <button onClick={() => addSlot(day)} className="flex items-center text-sm font-semibold text-[#5B21B6] hover:text-[#7C3AED] transition-colors mt-2">
                    <Plus size={16} className="mr-1" /> Add hours
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MentorAvailability;
