import React, { useState } from 'react';
import { Presentation, ChevronLeft, ChevronRight, Download, Sparkles, Image } from 'lucide-react';

const slides = [
  { id: 1, title: 'Cover Slide', content: 'Company name, tagline & logo', icon: '🚀', done: true },
  { id: 2, title: 'Problem', content: 'The pain point you are solving', icon: '⚠️', done: true },
  { id: 3, title: 'Solution', content: 'Your product and how it helps', icon: '💡', done: true },
  { id: 4, title: 'Market Size', content: 'TAM, SAM, SOM breakdown', icon: '📊', done: false },
  { id: 5, title: 'Product Demo', content: 'Screenshots / walkthrough', icon: '🖥️', done: false },
  { id: 6, title: 'Business Model', content: 'How you make money', icon: '💰', done: false },
  { id: 7, title: 'Traction', content: 'Key metrics & growth proof', icon: '📈', done: false },
  { id: 8, title: 'Go-to-Market', content: 'How you acquire customers', icon: '🎯', done: false },
  { id: 9, title: 'Team', content: 'Founders & key team members', icon: '👥', done: false },
  { id: 10, title: 'The Ask', content: 'Funding amount & use of funds', icon: '🤝', done: false },
];

const themes = [
  { name: 'Dark Pro', color: 'bg-gray-900', text: 'text-white' },
  { name: 'Purple', color: 'bg-gradient-to-br from-[#4C1D95] to-[#7C3AED]', text: 'text-white' },
  { name: 'Ocean', color: 'bg-gradient-to-br from-blue-900 to-blue-600', text: 'text-white' },
  { name: 'Minimal', color: 'bg-white border border-gray-200', text: 'text-gray-900' },
];

const FounderPitchDeck: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(1);
  const [theme, setTheme] = useState(0);

  const current = slides.find(s => s.id === activeSlide)!;
  const completed = slides.filter(s => s.done).length;

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pitch Deck Builder</h1>
          <p className="text-gray-500 mt-1">Create a stunning investor-ready pitch deck with AI-generated content.</p>
        </div>
        <button className="flex items-center px-4 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl shadow text-sm transition-colors">
          <Download size={16} className="mr-2" /> Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Slide list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">{completed}/{slides.length} Slides Complete</p>
          <div className="space-y-1.5">
            {slides.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSlide(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${activeSlide === s.id ? 'bg-gradient-to-r from-[#4C1D95] to-[#6D28D9] text-white' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                <span className="text-lg flex-shrink-0">{s.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{s.title}</p>
                  <p className={`text-[11px] truncate ${activeSlide === s.id ? 'text-white/60' : 'text-gray-400'}`}>{s.content}</p>
                </div>
                {s.done && <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 ml-auto" />}
              </button>
            ))}
          </div>
        </div>

        {/* Slide preview + editor */}
        <div className="lg:col-span-2 space-y-5">
          {/* Theme picker */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Slide Theme</p>
            <div className="flex gap-2">
              {themes.map((t, i) => (
                <button
                  key={t.name}
                  onClick={() => setTheme(i)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold ${t.color} ${t.text} ${theme === i ? 'ring-2 ring-[#5B21B6] ring-offset-1' : 'opacity-70 hover:opacity-100'} transition-all`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Slide preview */}
          <div className={`rounded-2xl ${themes[theme].color} ${themes[theme].text} shadow-lg flex flex-col items-center justify-center text-center p-10 min-h-[240px] relative overflow-hidden`}>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-4 w-20 h-20 rounded-full bg-white/20 blur-xl" />
              <div className="absolute bottom-4 right-4 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
            </div>
            <span className="text-5xl mb-4">{current.icon}</span>
            <h2 className="text-2xl font-extrabold mb-2">{current.title}</h2>
            <p className={`text-sm ${themes[theme].text === 'text-white' ? 'text-white/60' : 'text-gray-500'}`}>{current.content}</p>
            <div className={`absolute bottom-4 right-5 text-xs font-bold opacity-40`}>{activeSlide} / {slides.length}</div>
          </div>

          {/* Navigation & AI */}
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveSlide(s => Math.max(1, s - 1))} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-30" disabled={activeSlide === 1}>
              <ChevronLeft size={18} />
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl text-sm transition-colors shadow">
              <Sparkles size={16} /> Generate Slide Content with AI
            </button>
            <button onClick={() => setActiveSlide(s => Math.min(slides.length, s + 1))} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-30" disabled={activeSlide === slides.length}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FounderPitchDeck;
