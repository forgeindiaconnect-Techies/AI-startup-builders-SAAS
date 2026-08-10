import React, { useState } from 'react';
import { Target, RefreshCw, Download, Edit3, Save, Zap, Sparkles, CheckCircle, ShieldAlert, Award, Layers } from 'lucide-react';
import { getCompetitorAnalysisData, updateStartup, addNotification } from '../../../utils/localStorageHelper';
import jsPDF from 'jspdf';

interface Props {
  startupData?: any;
  setStartupData?: (data: any) => void;
}

const FounderCompetitorAnalysis: React.FC<Props> = ({ startupData, setStartupData }) => {
  const data = getCompetitorAnalysisData(startupData);
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editForm, setEditForm] = useState(data);

  if (!startupData) {
    return (
      <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 text-center my-6">
        <p className="text-[#5B21B6] font-bold">Please select or generate a startup idea first to view Competitor Analysis.</p>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      const startupId = startupData.startupId || startupData._id || startupData.id;
      const updatedAiGenerated = {
        ...(startupData.aiGenerated || {}),
        competitorAnalysis: editForm
      };
      const updated = await updateStartup(startupId, { aiGenerated: updatedAiGenerated });
      if (setStartupData) {
        setStartupData(updated || { ...startupData, aiGenerated: updatedAiGenerated });
      }
      setIsEditing(false);
      addNotification({
        id: `notif_${Date.now()}`,
        userId: startupData.founderId || 'founder',
        title: 'Competitor Analysis Saved',
        message: 'Your edited competitor analysis details have been saved.',
        type: 'ai_builder',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.error('Failed to save competitor analysis', e);
    }
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    setTimeout(() => {
      setEditForm({
        ...data,
        uniqueSellingProposition: `${startupData.startupName || 'Our Startup'} delivers 3x faster workflows and superior user experience at a lower cost compared to incumbents.`
      });
      setIsGenerating(false);
    }, 1200);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(91, 33, 182);
    doc.text(`Competitor Analysis: ${startupData?.startupName || 'Startup'}`, 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text(`Unique Selling Proposition (USP):`, 14, 30);
    doc.setFontSize(10);
    const splitUSP = doc.splitTextToSize(editForm.uniqueSellingProposition, 180);
    doc.text(splitUSP, 14, 38);

    doc.setFontSize(12);
    doc.setTextColor(91, 33, 182);
    doc.text(`Direct Competitors:`, 14, 55);
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    editForm.directCompetitors.forEach((c: any, i: number) => {
      doc.text(`${i + 1}. ${c.name} - ${c.pricing}`, 14, 65 + (i * 12));
    });

    doc.save(`${startupData?.startupName || 'Startup'}_Competitor_Analysis.pdf`);
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Target size={24} className="text-[#5B21B6]" />
            <h1 className="text-2xl font-bold text-gray-900">Competitor Analysis</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Deep AI competitor landscape mapping, market gap identification, and differentiation strategy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isEditing ? (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white rounded-xl text-sm font-bold shadow-sm transition-all"
            >
              <Save size={16} /> Save Changes
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold transition-all"
            >
              <Edit3 size={16} /> Edit Data
            </button>
          )}

          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 border border-purple-200 bg-purple-50 hover:bg-purple-100 text-[#5B21B6] rounded-xl text-sm font-bold transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={isGenerating ? 'animate-spin' : ''} />
            {isGenerating ? 'Analyzing...' : 'Regenerate AI'}
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all"
          >
            <Download size={16} /> Export Report
          </button>
        </div>
      </div>

      {/* Unique Selling Proposition Highlight */}
      <div className="bg-gradient-to-r from-[#4C1D95] via-[#5B21B6] to-purple-800 rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase mb-2">
          <Zap size={14} /> Unique Selling Proposition (USP)
        </div>
        {isEditing ? (
          <textarea
            value={editForm.uniqueSellingProposition}
            onChange={(e) => setEditForm({ ...editForm, uniqueSellingProposition: e.target.value })}
            className="w-full p-3 bg-white/10 text-white border border-white/20 rounded-xl text-sm focus:outline-none"
          />
        ) : (
          <p className="text-lg font-bold leading-relaxed">{editForm.uniqueSellingProposition}</p>
        )}
      </div>

      {/* Direct vs Indirect Competitors Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Direct Competitors */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Target size={18} className="text-[#5B21B6]" /> Direct Competitors
          </h3>
          <div className="space-y-4">
            {editForm.directCompetitors.map((comp: any, idx: number) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">{comp.name}</span>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-purple-100 text-[#5B21B6] rounded-full">
                    {comp.pricing}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{comp.product} • Target: {comp.targetAudience}</p>
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-200">
                  <div>
                    <span className="font-bold text-emerald-700 block">Strengths:</span>
                    <span className="text-gray-600">{Array.isArray(comp.strengths) ? comp.strengths.join(', ') : comp.strengths}</span>
                  </div>
                  <div>
                    <span className="font-bold text-rose-700 block">Weaknesses:</span>
                    <span className="text-gray-600">{Array.isArray(comp.weaknesses) ? comp.weaknesses.join(', ') : comp.weaknesses}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Indirect Competitors */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Layers size={18} className="text-amber-500" /> Indirect Competitors & Alternatives
          </h3>
          <div className="space-y-4">
            {editForm.indirectCompetitors.map((comp: any, idx: number) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">{comp.name}</span>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full">
                    {comp.pricing}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{comp.product}</p>
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-200">
                  <div>
                    <span className="font-bold text-emerald-700 block">Strengths:</span>
                    <span className="text-gray-600">{Array.isArray(comp.strengths) ? comp.strengths.join(', ') : comp.strengths}</span>
                  </div>
                  <div>
                    <span className="font-bold text-rose-700 block">Weaknesses:</span>
                    <span className="text-gray-600">{Array.isArray(comp.weaknesses) ? comp.weaknesses.join(', ') : comp.weaknesses}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Competitor Comparison Matrix Table */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Award size={18} className="text-[#5B21B6]" /> Competitor Comparison Matrix
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-purple-50 text-[#5B21B6] border-b border-purple-100">
                <th className="p-3 font-bold rounded-l-xl">Key Feature / Capability</th>
                <th className="p-3 font-bold bg-purple-100/70 text-purple-900">{startupData.startupName || 'My Startup'}</th>
                <th className="p-3 font-bold text-gray-700">Direct Competitor 1</th>
                <th className="p-3 font-bold text-gray-700 rounded-r-xl">Direct Competitor 2</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {editForm.comparisonMatrix.map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50/80">
                  <td className="p-3 font-semibold text-gray-800">{row.feature}</td>
                  <td className="p-3 font-bold text-[#5B21B6] bg-purple-50/40">{row.myStartup}</td>
                  <td className="p-3 text-gray-600">{row.competitor1}</td>
                  <td className="p-3 text-gray-600">{row.competitor2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Market Gaps & Competitive Advantages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldAlert size={18} className="text-amber-500" /> Identified Market Gaps
          </h3>
          <ul className="space-y-3">
            {editForm.marketGaps.map((gap: string, idx: number) => (
              <li key={idx} className="flex items-start gap-3 p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-sm text-gray-800">
                <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></span>
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle size={18} className="text-emerald-500" /> Competitive Advantages
          </h3>
          <ul className="space-y-3">
            {editForm.competitiveAdvantages.map((adv: string, idx: number) => (
              <li key={idx} className="flex items-start gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-sm text-gray-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
                <span>{adv}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FounderCompetitorAnalysis;
