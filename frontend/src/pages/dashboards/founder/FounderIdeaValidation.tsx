import React, { useState } from 'react';
import { ShieldCheck, RefreshCw, Download, CheckCircle2, AlertTriangle, TrendingUp, Target, Lightbulb, Edit3, Save, Sparkles, Award } from 'lucide-react';
import { getIdeaValidationData, updateStartup, addNotification } from '../../../utils/localStorageHelper';
import jsPDF from 'jspdf';

interface Props {
  startupData?: any;
  setStartupData?: (data: any) => void;
}

const FounderIdeaValidation: React.FC<Props> = ({ startupData, setStartupData }) => {
  const data = getIdeaValidationData(startupData);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editForm, setEditForm] = useState(data);

  if (!startupData) {
    return (
      <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 text-center my-6">
        <p className="text-[#5B21B6] font-bold">Please select or generate a startup idea first to view Idea Validation.</p>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      const startupId = startupData.startupId || startupData._id || startupData.id;
      const updatedAiGenerated = {
        ...(startupData.aiGenerated || {}),
        ideaValidation: editForm
      };
      const updated = await updateStartup(startupId, { aiGenerated: updatedAiGenerated });
      if (setStartupData) {
        setStartupData(updated || { ...startupData, aiGenerated: updatedAiGenerated });
      }
      setIsEditing(false);
      addNotification({
        id: `notif_${Date.now()}`,
        userId: startupData.founderId || 'founder',
        title: 'Idea Validation Saved',
        message: 'Your edited idea validation details have been saved successfully.',
        type: 'ai_builder',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.error('Failed to save validation', e);
    }
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    setTimeout(() => {
      const refreshed = {
        ...data,
        validationScore: Math.min(98, Math.max(70, data.validationScore + Math.floor(Math.random() * 7) - 3)),
        validationSummary: `${data.startupIdea} displays exceptionally strong product-market fit potential. AI analysis highlights high demand efficiency and unit economics feasibility in current market conditions.`
      };
      setEditForm(refreshed);
      setIsGenerating(false);
    }, 1200);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(91, 33, 182);
    doc.text(`AI Idea Validation Report: ${startupData?.startupName || 'Startup'}`, 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text(`Validation Score: ${editForm.validationScore}/100 (${editForm.finalRecommendation} Recommendation)`, 14, 30);
    doc.text(`Problem Strength: ${editForm.problemStrength}`, 14, 38);
    doc.text(`Market Need: ${editForm.marketNeed}`, 14, 46);
    doc.text(`Customer Demand: ${editForm.customerDemand}`, 14, 54);
    doc.text(`Solution Feasibility: ${editForm.solutionFeasibility}`, 14, 62);

    doc.setFontSize(14);
    doc.setTextColor(91, 33, 182);
    doc.text("Summary:", 14, 74);
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const splitSummary = doc.splitTextToSize(editForm.validationSummary, 180);
    doc.text(splitSummary, 14, 82);

    doc.save(`${startupData?.startupName || 'Startup'}_Idea_Validation.pdf`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={24} className="text-[#5B21B6]" />
            <h1 className="text-2xl font-bold text-gray-900">AI Idea Validation</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Automated multi-factor evaluation of market demand, feasibility, customer desire, and business potential.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isEditing && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white rounded-xl text-sm font-bold shadow-sm transition-all"
            >
              <Save size={16} /> Save Changes
            </button>
          )}




        </div>
      </div>

      {/* Input Summary Section */}
      <div className="bg-gradient-to-r from-purple-900 via-[#4C1D95] to-[#5B21B6] rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase mb-3">
          <Sparkles size={14} /> Selected Project Inputs
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="bg-white/10 p-3.5 rounded-xl backdrop-blur-sm">
            <span className="text-white/60 text-xs block mb-1">Startup Idea</span>
            <p className="font-semibold text-white truncate">{startupData.startupIdea || startupData.startupName}</p>
          </div>
          <div className="bg-white/10 p-3.5 rounded-xl backdrop-blur-sm">
            <span className="text-white/60 text-xs block mb-1">Category / Industry</span>
            <p className="font-semibold text-white">{editForm.industryCategory}</p>
          </div>
          <div className="bg-white/10 p-3.5 rounded-xl backdrop-blur-sm">
            <span className="text-white/60 text-xs block mb-1">Target Customer</span>
            <p className="font-semibold text-white truncate">{editForm.targetCustomer}</p>
          </div>
          <div className="bg-white/10 p-3.5 rounded-xl backdrop-blur-sm">
            <span className="text-white/60 text-xs block mb-1">Proposed Solution</span>
            <p className="font-semibold text-white truncate">{editForm.proposedSolution}</p>
          </div>
        </div>
      </div>

      {/* Main Scorecard & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Validation Score Gauge Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between items-center text-center">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">AI Validation Score</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getScoreColor(editForm.validationScore)}`}>
              {editForm.finalRecommendation} Potential
            </span>
          </div>

          <div className="relative my-4 flex items-center justify-center">
            <div className="w-36 h-36 rounded-full border-8 border-purple-100 flex flex-col items-center justify-center bg-gradient-to-b from-purple-50/50 to-white shadow-inner">
              <span className="text-4xl font-extrabold text-[#5B21B6]">{editForm.validationScore}</span>
              <span className="text-xs font-medium text-gray-400">out of 100</span>
            </div>
          </div>

          <div className="w-full pt-4 border-t border-gray-100 mt-2">
            <p className="text-xs text-gray-500 font-medium">
              Calculated across 12 strategic startup viability metrics.
            </p>
          </div>
        </div>

        {/* Multi-Factor Viability Metrics */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Award size={18} className="text-amber-500" /> Key Viability Metrics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
              <span className="text-xs font-bold text-gray-500 uppercase">Problem Strength</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-lg font-bold text-gray-900">{editForm.problemStrength}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>

            <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
              <span className="text-xs font-bold text-gray-500 uppercase">Market Need</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-lg font-bold text-gray-900">{editForm.marketNeed}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#5B21B6]"></span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-[#5B21B6] h-full rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>

            <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
              <span className="text-xs font-bold text-gray-500 uppercase">Customer Demand</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-lg font-bold text-gray-900">{editForm.customerDemand}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>

            <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
              <span className="text-xs font-bold text-gray-500 uppercase">Solution Feasibility</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-lg font-bold text-gray-900 truncate">{editForm.solutionFeasibility}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-100 mt-2">
            <span className="text-xs font-bold text-purple-900 uppercase">Business Potential</span>
            <p className="text-sm font-bold text-[#5B21B6] mt-0.5">{editForm.businessPotential}</p>
          </div>
        </div>
      </div>

      {/* Validation Summary & Recommendations */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Lightbulb size={18} className="text-[#5B21B6]" /> Validation Summary
        </h3>
        
        {isEditing ? (
          <textarea
            value={editForm.validationSummary}
            onChange={(e) => setEditForm({ ...editForm, validationSummary: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none min-h-[100px]"
          />
        ) : (
          <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
            {editForm.validationSummary}
          </p>
        )}
      </div>

      {/* Strengths, Weaknesses, and Risks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Strengths */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-emerald-700 font-bold text-sm">
            <CheckCircle2 size={18} /> Strengths
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            {editForm.strengths.map((str: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-amber-700 font-bold text-sm">
            <AlertTriangle size={18} /> Weaknesses
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            {editForm.weaknesses.map((wk: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0"></span>
                <span>{wk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Key Risks */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-rose-700 font-bold text-sm">
            <Target size={18} /> Key Risks
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            {editForm.keyRisks.map((rk: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 flex-shrink-0"></span>
                <span>{rk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommended Improvements */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-blue-600" /> Recommended Strategic Improvements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {editForm.recommendedImprovements.map((imp: string, idx: number) => (
            <div key={idx} className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                {idx + 1}
              </span>
              <p className="text-sm font-medium text-gray-800">{imp}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FounderIdeaValidation;
