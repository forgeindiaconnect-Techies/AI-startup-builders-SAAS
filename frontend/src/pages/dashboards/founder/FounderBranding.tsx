import React, { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import {
  Palette, Type, PenTool, Share2, Sparkles,
  HeartHandshake, Hash, Layout, Download,
  RefreshCw, CheckCircle2, FileText, Wand2, Star, Zap
} from 'lucide-react';
import { saveLogo, getLogosByStartupId, saveDocument, addNotification } from '../../../utils/localStorageHelper';
import { API_URL } from '../../../config/api';

interface FounderBrandingProps {
  startupData?: any;
  setStartupData?: (data: any) => void;
}

// ─── DEMO LOGO CARD COMPONENTS ───────────────────────────────────────────────

const parseColor = (colorStr: string) => {
  const hexMatch = colorStr?.match(/#[0-9A-Fa-f]{6}/);
  return hexMatch ? hexMatch[0] : '#5B21B6';
};

interface DemoLogoCardProps {
  id: number;
  name: string;
  tagline: string;
  colors: string[];
  style: 'icon-text' | 'text-only' | 'app-icon';
  selected: boolean;
  onSelect: () => void;
  cardRef?: React.RefObject<HTMLDivElement>;
}

const DemoLogoCard: React.FC<DemoLogoCardProps> = ({
  id, name, tagline, colors, style, selected, onSelect, cardRef
}) => {
  const primary = parseColor(colors[0]) || '#4B2E1E';
  const accent = parseColor(colors[2]) || '#D4AF37';
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer rounded-2xl border-2 transition-all duration-200 overflow-hidden group ${
        selected
          ? 'border-[#5B21B6] shadow-lg shadow-purple-100 scale-[1.02]'
          : 'border-gray-100 hover:border-purple-200 hover:shadow-md'
      }`}
    >
      {selected && (
        <div className="absolute top-3 right-3 z-10 w-7 h-7 bg-[#5B21B6] rounded-full flex items-center justify-center shadow-md">
          <CheckCircle2 size={16} className="text-white" />
        </div>
      )}

      {/* The exportable logo area */}
      <div ref={cardRef} className="flex flex-col items-center justify-center p-8 min-h-[220px]" style={{ background: '#fff' }}>
        {style === 'icon-text' && (
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md"
              style={{ background: primary }}
            >
              <span style={{ color: accent, fontSize: 28, fontWeight: 900, fontFamily: 'Georgia, serif', lineHeight: 1 }}>
                {initials}
              </span>
            </div>
            <div className="text-center">
              <p style={{ color: primary, fontWeight: 900, fontSize: 22, letterSpacing: '-0.5px', fontFamily: 'Georgia, serif', lineHeight: 1 }}>
                {name}
              </p>
              <p style={{ color: accent, fontWeight: 600, fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', marginTop: 4, fontFamily: 'Arial, sans-serif' }}>
                {tagline}
              </p>
            </div>
          </div>
        )}

        {style === 'text-only' && (
          <div className="text-center">
            <p style={{ color: primary, fontWeight: 900, fontSize: 30, letterSpacing: '-1px', fontFamily: 'Georgia, serif', lineHeight: 1 }}>
              {name}
            </p>
            <div className="mx-auto my-2" style={{ width: 40, height: 3, background: accent, borderRadius: 99 }} />
            <p style={{ color: '#888', fontWeight: 500, fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'Arial, sans-serif' }}>
              {tagline}
            </p>
          </div>
        )}

        {style === 'app-icon' && (
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-20 h-20 rounded-[28px] flex items-center justify-center shadow-lg"
              style={{ background: `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)` }}
            >
              <span style={{ color: '#fff', fontSize: 32, fontWeight: 900, fontFamily: 'Arial, sans-serif', lineHeight: 1 }}>
                {initials[0]}
              </span>
            </div>
            <p style={{ color: '#333', fontWeight: 700, fontSize: 14, letterSpacing: '0.5px', fontFamily: 'Arial, sans-serif' }}>
              {name}
            </p>
          </div>
        )}
      </div>

      {/* Card label */}
      <div className="px-4 py-3 border-t border-gray-50 bg-gray-50 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-gray-700">
            {id === 1 ? 'Option 1: Icon + Text' : id === 2 ? 'Option 2: Text Only' : 'Option 3: App Icon'}
          </p>
          <p className="text-[11px] text-gray-400">
            {style === 'icon-text' ? 'Great for websites & print' : style === 'text-only' ? 'Clean & professional' : 'Perfect for mobile & social'}
          </p>
        </div>
        {selected && <span className="text-xs font-bold text-[#5B21B6] bg-purple-50 px-2 py-0.5 rounded-full">Selected</span>}
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

const FounderBranding: React.FC<FounderBrandingProps> = ({ startupData }) => {
  const defaultBranding = {
    brandColorPalette: ['#5B21B6', '#7C3AED', '#D4AF37', '#1E293B'],
    taglineSuggestions: [
      `${startupData?.startupName || 'Startup'} — Quality, Value & Smart Choice`,
      `Innovative ${startupData?.industry || 'Business'} Solutions`,
      `Empowering Your Creative & Professional Needs`
    ],
    logoPrompt: `Minimalist, modern, vector logo for a business named "${startupData?.startupName || 'Stationary shop'}", professional corporate icon, clean lines, high resolution`
  };

  const branding = startupData?.aiGenerated?.branding || defaultBranding;

  const [isGenerating, setIsGenerating] = useState(false);
  const [showDemoCards, setShowDemoCards] = useState(false);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [savedLogo, setSavedLogo] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const cardRef1 = useRef<HTMLDivElement>(null);
  const cardRef2 = useRef<HTMLDivElement>(null);
  const cardRef3 = useRef<HTMLDivElement>(null);
  const cardRefs = [cardRef1, cardRef2, cardRef3];

  useEffect(() => {
    if (startupData?.startupId) {
      const existing = getLogosByStartupId(startupData.startupId);
      if (existing.length > 0) {
        setSavedLogo(existing[0]);
        setShowDemoCards(false);
        return;
      }
      const persistedLogo = startupData?.aiGenerated?.logo;
      if (persistedLogo?.imageUrl) {
        const br = startupData.aiGenerated?.branding || {};
        setSavedLogo({
          id: `logo_${Date.now()}`,
          startupId: startupData.startupId,
          startupName: startupData.startupName,
          logoImage: persistedLogo.imageUrl,
          logoMode: 'ai_generated',
          tagline: br.taglineSuggestions?.[0] || 'Startup Tagline',
          colors: (br.brandColorPalette || []).map((c: string) => parseColor(c)),
          createdAt: persistedLogo.createdAt || new Date().toISOString(),
          selected: true,
        });
        setShowDemoCards(false);
      }
    }
  }, [startupData?.startupId]);

  const colors = branding.brandColorPalette || [];
  const tagline = branding.taglineSuggestions?.[0] || 'Startup Tagline';

  const handleGenerateLogo = async () => {
    setIsGenerating(true);
    setShowDemoCards(false);
    setSavedLogo(null);
    setSelectedCard(null);

    try {
      // Attempt real API call first (Stability AI via backend)
      const response = await fetch(`${API_URL}/ai-builder/generate-logo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startupName: startupData?.startupName,
          startupIdea: startupData?.startupIdea,
          prompt: branding.logoPrompt,
          startupId: startupData?.startupId,
        }),
        signal: AbortSignal.timeout(90000),
      });

      if (!response.ok) throw new Error('API not available');

      const json = await response.json();
      if (!json.success) throw new Error(json.message || 'API not available');

      const data = json.data;
      // Real API mode: save logo and show it
      const logoObj = {
        id: `logo_${Date.now()}`,
        startupId: startupData?.startupId,
        startupName: startupData?.startupName,
        startupIdea: startupData?.startupIdea,
        logoPrompt: branding.logoPrompt,
        logoImage: data.imageUrl || (data.base64 ? `data:image/png;base64,${data.base64}` : ''),
        cloudinaryUrl: data.cloudinaryUrl || '',
        logoMode: 'ai_generated',
        tagline,
        colors: colors.map((c: string) => parseColor(c)),
        createdAt: new Date().toISOString(),
        selected: true,
      };
      saveLogo(logoObj);
      setSavedLogo(logoObj);
    } catch (_err) {
      // Fallback: Demo mode — show 3 CSS logo cards
      setShowDemoCards(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectLogo = async (cardIndex: number) => {
    setSelectedCard(cardIndex);
    const ref = cardRefs[cardIndex - 1];

    // Capture the selected logo card to base64 using html-to-image
    let logoDataUrl = '';
    if (ref.current) {
      try {
        logoDataUrl = await toPng(ref.current, { backgroundColor: '#ffffff', pixelRatio: 2 });
      } catch (e) {
        logoDataUrl = '';
      }
    }

    const styleMap = ['icon-text', 'text-only', 'app-icon'];
    const logoObj = {
      id: `logo_${Date.now()}`,
      startupId: startupData?.startupId,
      startupName: startupData?.startupName,
      startupIdea: startupData?.startupIdea,
      logoPrompt: branding.logoPrompt,
      logoImage: logoDataUrl,
      logoMode: 'demo',
      logoStyle: styleMap[cardIndex - 1],
      tagline,
      colors: colors.map((c: string) => parseColor(c)),
      fontStyle: branding.fontStyleSuggestions,
      iconIdea: branding.logoConceptIdeas,
      selected: true,
      createdAt: new Date().toISOString(),
    };

    saveLogo(logoObj);
    setSavedLogo(logoObj);
  };

  const handleDownload = async () => {
    if (!savedLogo) return;
    setIsDownloading(true);

    try {
      if (savedLogo.logoImage && savedLogo.logoImage.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = savedLogo.logoImage;
        a.download = `${startupData?.startupName || 'logo'}_logo.png`;
        a.click();
      } else if (savedLogo.logoImage && /^https?:\/\//.test(savedLogo.logoImage)) {
        const res = await fetch(savedLogo.logoImage);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${startupData?.startupName || 'logo'}_logo.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else if (selectedCard) {
        const ref = cardRefs[selectedCard - 1];
        if (ref.current) {
          const dataUrl = await toPng(ref.current, { backgroundColor: '#ffffff', pixelRatio: 3 });
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = `${startupData?.startupName || 'logo'}_logo.png`;
          a.click();
        }
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveToDocuments = () => {
    if (!savedLogo) return;
    setIsSaving(true);

    setTimeout(() => {
      const doc = {
        id: `doc_logo_${Date.now()}`,
        startupId: startupData?.startupId,
        founderId: startupData?.founderId || 'founder_demo_user',
        fileName: `${startupData?.startupName || 'startup'}_Logo.png`,
        fileType: 'PNG',
        fileSize: '0.4 MB',
        fileData: savedLogo.logoImage || '',
        category: 'Logo & Branding',
        status: 'private',
        sharedWith: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveDocument(doc);
      addNotification({
        id: `notification_${Date.now()}`,
        userId: startupData?.founderId || 'founder_demo_user',
        title: 'Logo saved to Documents',
        message: `${doc.fileName} has been saved to your documents.`,
        type: 'document_export',
        isRead: false,
        actionUrl: '/dashboard/founder/documents',
        createdAt: new Date().toISOString(),
      });

      setIsSaving(false);
      setSaveMsg('Saved to Documents!');
      setTimeout(() => setSaveMsg(''), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Logo & Branding</h2>
          <p className="text-sm text-gray-500 mt-1">AI-generated brand identity, visual guidelines, and logo generation for your startup.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleGenerateLogo}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl shadow-md text-sm transition-all disabled:opacity-60 active:scale-95"
          >
            {isGenerating
              ? <><RefreshCw size={16} className="animate-spin" /> Generating logo...</>
              : <><Wand2 size={16} /> Generate Logo with AI</>
            }
          </button>
          {showDemoCards && (
            <button
              onClick={handleGenerateLogo}
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-all disabled:opacity-60"
            >
              <RefreshCw size={16} /> Regenerate
            </button>
          )}
        </div>
      </div>

      {/* Branding Info Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Brand Identity */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
              <Type className="text-[#5B21B6]" size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Brand Identity</h3>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Brand Names</h4>
              <div className="flex flex-wrap gap-2">
                {branding.brandNameSuggestions?.map((name: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-gray-50 text-gray-800 rounded-lg text-sm border border-gray-100 font-medium">{name}</span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Taglines</h4>
              <ul className="space-y-1.5">
                {branding.taglineSuggestions?.map((t: string, i: number) => (
                  <li key={i} className="text-sm text-gray-700 italic border-l-2 border-[#5B21B6] pl-3">"{t}"</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <HeartHandshake size={13} /> Brand Personality
              </h4>
              <p className="text-sm text-gray-700 font-medium">{branding.brandPersonality}</p>
            </div>
          </div>
        </div>

        {/* Visual Guidelines */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center">
              <Palette className="text-pink-600" size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Visual Guidelines</h3>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Brand Colors</h4>
              <div className="flex flex-wrap gap-3">
                {colors.map((colorStr: string, i: number) => {
                  const hex = parseColor(colorStr);
                  const label = colorStr.split('(')[1]?.replace(')', '') || colorStr;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-xl border border-gray-200 shadow-sm" style={{ backgroundColor: hex }} />
                      <span className="text-[10px] text-gray-500 font-medium w-14 text-center truncate" title={label}>{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><PenTool size={13} /> Font Style</h4>
              <p className="text-sm text-gray-700">{branding.fontStyleSuggestions}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Star size={13} /> Logo Style</h4>
              <p className="text-sm text-gray-700 font-medium">{branding.logoStyle || 'Modern, Clean, Vector-based'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Logo Prompt */}
      <div className="bg-gray-900 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
            <Zap className="text-yellow-400" size={18} />
          </div>
          <h3 className="text-base font-bold text-white">AI Logo Generation Prompt</h3>
          <span className="ml-auto text-[11px] bg-white/10 text-white/60 px-3 py-1 rounded-full font-medium">Auto-generated</span>
        </div>
        <pre className="text-xs text-green-300 font-mono whitespace-pre-wrap leading-relaxed overflow-auto max-h-48">
          {branding.logoPrompt || 'No prompt generated yet. Run AI generation first.'}
        </pre>
      </div>

      {/* Demo Logo Cards */}
      {showDemoCards && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Sparkles className="text-amber-500" size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Demo Logo Previews</h3>
              <p className="text-xs text-gray-500">Quick CSS logo previews. Select one to save & download, or generate a real AI logo above.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <DemoLogoCard
              id={1} name={startupData?.startupName || 'Startup'} tagline={tagline} colors={colors}
              style="icon-text" selected={selectedCard === 1}
              onSelect={() => handleSelectLogo(1)}
              cardRef={cardRef1}
            />
            <DemoLogoCard
              id={2} name={startupData?.startupName || 'Startup'} tagline={tagline} colors={colors}
              style="text-only" selected={selectedCard === 2}
              onSelect={() => handleSelectLogo(2)}
              cardRef={cardRef2}
            />
            <DemoLogoCard
              id={3} name={startupData?.startupName || 'Startup'} tagline={tagline} colors={colors}
              style="app-icon" selected={selectedCard === 3}
              onSelect={() => handleSelectLogo(3)}
              cardRef={cardRef3}
            />
          </div>

          {selectedCard && (
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2">
                <CheckCircle2 size={16} /> Option {selectedCard} selected & saved
              </span>
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl text-sm transition-all shadow disabled:opacity-60"
              >
                {isDownloading ? <RefreshCw size={15} className="animate-spin" /> : <Download size={15} />}
                Download PNG
              </button>
              <button
                onClick={handleSaveToDocuments}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-all disabled:opacity-60"
              >
                {isSaving ? <RefreshCw size={15} className="animate-spin" /> : <FileText size={15} />}
                Save to Documents
              </button>
              {saveMsg && <span className="text-sm font-bold text-[#5B21B6]">✓ {saveMsg}</span>}
            </div>
          )}
        </div>
      )}

      {/* Saved Logo Display */}
      {savedLogo && !showDemoCards && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="text-emerald-600" size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Selected Logo</h3>
              <p className="text-xs text-gray-400">Saved on {new Date(savedLogo.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {savedLogo.logoImage && (
              <div className="w-36 h-36 rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex items-center justify-center bg-white flex-shrink-0">
                <img src={savedLogo.logoImage} alt="Selected Logo" className="w-full h-full object-contain p-2" />
              </div>
            )}
            <div className="flex-1 space-y-2">
              <p className="font-bold text-gray-900">{savedLogo.startupName}</p>
              <p className="text-sm text-gray-500 italic">"{savedLogo.tagline}"</p>
              <p className="text-xs text-gray-400">Mode: <span className="font-semibold text-gray-600">{savedLogo.logoMode === 'demo' ? 'Demo CSS Logo' : 'AI Generated'}</span></p>
              {savedLogo.logoImage && /^https?:\/\//.test(savedLogo.logoImage) && (
                <p className="text-[11px] text-sky-600 bg-sky-50 px-2 py-1 rounded-full w-fit font-semibold">☁️ Stored on Cloudinary</p>
              )}
              <div className="flex flex-wrap gap-2 pt-3">
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="flex items-center gap-2 px-4 py-2 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl text-sm transition-all shadow disabled:opacity-60"
                >
                  {isDownloading ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                  Download PNG
                </button>
                <button
                  onClick={handleSaveToDocuments}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-all"
                >
                  {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <FileText size={14} />}
                  Save to Documents
                </button>
                <button
                  onClick={handleGenerateLogo}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold rounded-xl text-sm border border-gray-200 transition-all"
                >
                  <RefreshCw size={14} /> Regenerate
                </button>
                {saveMsg && <span className="text-sm font-bold text-[#5B21B6] self-center">✓ {saveMsg}</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Application & Marketing */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Sparkles className="text-blue-600" size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Application & Marketing</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-gray-50 p-4 rounded-xl">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Layout size={13} /> Packaging / UI Style
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">{branding.packagingStyleSuggestions}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Layout size={13} /> Website Hero Copy
            </h4>
            <p className="text-sm font-semibold text-gray-900">{branding.websiteHero}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Share2 size={13} /> Social Media Strategy
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">{branding.socialMediaIdeas}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Hash size={13} /> Marketing Captions
            </h4>
            <ul className="space-y-1.5">
              {branding.marketingCaptions?.map((caption: string, i: number) => (
                <li key={i} className="text-sm text-gray-700 border-l-2 border-blue-400 pl-2">{caption}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};

export default FounderBranding;
