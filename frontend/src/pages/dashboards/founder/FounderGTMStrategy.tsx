import React, { useState } from 'react';
import { Send, RefreshCw, Download, Edit3, Save, Target, Users, Megaphone, Calendar, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';
import { getGTMStrategyData, updateStartup, addNotification, formatRupeeText } from '../../../utils/localStorageHelper';
import jsPDF from 'jspdf';

interface Props {
  startupData?: any;
  setStartupData?: (data: any) => void;
}

const FounderGTMStrategy: React.FC<Props> = ({ startupData, setStartupData }) => {
  const data = formatRupeeText(getGTMStrategyData(startupData));
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editForm, setEditForm] = useState(data);

  if (!startupData) {
    return (
      <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 text-center my-6">
        <p className="text-[#5B21B6] font-bold">Please select or generate a startup idea first to view Go-To-Market Strategy.</p>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      const startupId = startupData.startupId || startupData._id || startupData.id;
      const updatedAiGenerated = {
        ...(startupData.aiGenerated || {}),
        gtmStrategy: editForm
      };
      const updated = await updateStartup(startupId, { aiGenerated: updatedAiGenerated });
      if (setStartupData) {
        setStartupData(updated || { ...startupData, aiGenerated: updatedAiGenerated });
      }
      setIsEditing(false);
      addNotification({
        id: `notif_${Date.now()}`,
        userId: startupData.founderId || 'founder',
        title: 'GTM Strategy Saved',
        message: 'Your edited Go-To-Market strategy details have been saved.',
        type: 'ai_builder',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.error('Failed to save GTM strategy', e);
    }
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    setTimeout(() => {
      setEditForm({
        ...data,
        first100CustomersStrategy: `Execute direct community outreach, hyper-targeted social ads, and founder-led consultation calls for early adopter conversion.`
      });
      setIsGenerating(false);
    }, 1200);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(91, 33, 182);
    doc.text(`Go-To-Market Blueprint: ${startupData?.startupName || 'Startup'}`, 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text(`Value Proposition:`, 14, 30);
    doc.setFontSize(10);
    const splitVal = doc.splitTextToSize(editForm.valueProposition, 180);
    doc.text(splitVal, 14, 38);

    doc.setFontSize(12);
    doc.setTextColor(91, 33, 182);
    doc.text(`First 100 Customers Strategy:`, 14, 55);
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    const split100 = doc.splitTextToSize(editForm.first100CustomersStrategy, 180);
    doc.text(split100, 14, 63);

    doc.save(`${startupData?.startupName || 'Startup'}_GTM_Strategy.pdf`);
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Send size={24} className="text-[#5B21B6]" />
            <h1 className="text-2xl font-bold text-gray-900">Go-To-Market (GTM) Strategy</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Customer personas, launch execution plan, first 100 customers strategy, and 90-day growth roadmap.
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

      {/* Positioning & Value Proposition Banner */}
      <div className="bg-gradient-to-r from-[#4C1D95] via-[#5B21B6] to-purple-800 rounded-2xl p-6 text-white shadow-md space-y-4">
        <div>
          <span className="text-amber-400 font-semibold text-xs tracking-wider uppercase block mb-1">Positioning & Core Value Proposition</span>
          <p className="text-lg font-bold leading-relaxed">{editForm.valueProposition}</p>
        </div>
        <div className="pt-4 border-t border-white/10 text-xs text-white/80">
          <span className="font-bold text-amber-300">Positioning Strategy: </span>{editForm.positioningStrategy}
        </div>
      </div>

      {/* Ideal Customer Profile & Personas */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Users size={18} className="text-[#5B21B6]" /> Ideal Customer Profiles (ICP) & Personas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {editForm.customerPersonas.map((persona: any, idx: number) => (
            <div key={idx} className="p-5 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="font-bold text-gray-900 text-base">{persona.name}</span>
                <span className="text-xs bg-purple-100 text-[#5B21B6] font-bold px-2.5 py-1 rounded-full">
                  {persona.role}
                </span>
              </div>
              <div className="text-xs space-y-2">
                <div>
                  <span className="font-bold text-gray-700 block">Pain Points:</span>
                  <span className="text-gray-600">{Array.isArray(persona.painPoints) ? persona.painPoints.join(', ') : persona.painPoints}</span>
                </div>
                <div>
                  <span className="font-bold text-emerald-700 block">Goal:</span>
                  <span className="text-gray-600">{persona.goal}</span>
                </div>
                <div>
                  <span className="font-bold text-purple-800 block">Preferred Channels:</span>
                  <span className="text-gray-600">{Array.isArray(persona.channels) ? persona.channels.join(', ') : persona.channels}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Structured Launch Strategy Phases */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Megaphone size={18} className="text-amber-500" /> Launch Strategy Execution Phases
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 space-y-2">
            <span className="text-xs font-bold text-purple-900 uppercase">1. Pre-Launch Activities</span>
            <ul className="space-y-1.5 text-xs text-gray-700">
              {editForm.launchStrategy?.preLaunch?.map((act: string, i: number) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5B21B6] mt-1 flex-shrink-0"></span>
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100 space-y-2">
            <span className="text-xs font-bold text-amber-900 uppercase">2. Launch-Day Activities</span>
            <ul className="space-y-1.5 text-xs text-gray-700">
              {editForm.launchStrategy?.launchDay?.map((act: string, i: number) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 flex-shrink-0"></span>
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-2">
            <span className="text-xs font-bold text-emerald-900 uppercase">3. Post-Launch Retention</span>
            <ul className="space-y-1.5 text-xs text-gray-700">
              {editForm.launchStrategy?.postLaunch?.map((act: string, i: number) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0"></span>
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* First 100 Customers Strategy Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Target size={18} className="text-emerald-600" /> First 100 Customers Acquisition Strategy
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed bg-emerald-50/40 p-4 rounded-xl border border-emerald-100 font-medium">
          {editForm.first100CustomersStrategy}
        </p>
      </div>

      {/* 30-Day Launch Plan & 90-Day Growth Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 30-Day Launch Plan */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Calendar size={18} className="text-[#5B21B6]" /> 30-Day Launch Plan
          </h3>

          <div className="space-y-3">
            {editForm.thirtyDayLaunchPlan?.map((plan: any, idx: number) => (
              <div key={idx} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 text-sm">{plan.week}</span>
                  <span className="text-xs text-purple-700 font-semibold">{plan.goal}</span>
                </div>
                <ul className="text-xs text-gray-600 space-y-1 pl-2 pt-1 border-t border-gray-200">
                  {plan.keyTasks?.map((task: string, tIdx: number) => (
                    <li key={tIdx}>• {task}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 90-Day Growth Roadmap */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-600" /> 90-Day Growth Roadmap
          </h3>

          <div className="space-y-3">
            {editForm.ninetyDayRoadmap?.map((road: any, idx: number) => (
              <div key={idx} className="p-3.5 bg-blue-50/40 rounded-xl border border-blue-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 text-sm">{road.month}</span>
                  <span className="text-xs text-blue-700 font-semibold">{road.focus}</span>
                </div>
                <ul className="text-xs text-gray-600 space-y-1 pl-2 pt-1 border-t border-blue-200">
                  {road.keyMilestones?.map((m: string, mIdx: number) => (
                    <li key={mIdx}>• {m}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Marketing KPIs */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-500" /> Key Marketing KPIs to Track
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {editForm.keyMarketingKPIs?.map((kpi: string, idx: number) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm font-semibold text-gray-800 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center flex-shrink-0">
                {idx + 1}
              </span>
              <span>{kpi}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FounderGTMStrategy;
