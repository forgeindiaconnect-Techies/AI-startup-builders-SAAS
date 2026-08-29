import React, { useState } from 'react';
import { Layers, RefreshCw, Download, Edit3, Save, CheckSquare, Code2, Users, Rocket, Clock, Sparkles, AlertCircle } from 'lucide-react';
import { getMVPPlanData, updateStartup, addNotification, formatRupeeText } from '../../../utils/localStorageHelper';
import jsPDF from 'jspdf';

interface Props {
  startupData?: any;
  setStartupData?: (data: any) => void;
}

const FounderMVPPlanner: React.FC<Props> = ({ startupData, setStartupData }) => {
  const data = formatRupeeText(getMVPPlanData(startupData));
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editForm, setEditForm] = useState(data);

  if (!startupData) {
    return (
      <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 text-center my-6">
        <p className="text-[#5B21B6] font-bold">Please select or generate a startup idea first to view MVP Planner.</p>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      const startupId = startupData.startupId || startupData._id || startupData.id;
      const updatedAiGenerated = {
        ...(startupData.aiGenerated || {}),
        mvpPlan: editForm
      };
      const updated = await updateStartup(startupId, { aiGenerated: updatedAiGenerated });
      if (setStartupData) {
        setStartupData(updated || { ...startupData, aiGenerated: updatedAiGenerated });
      }
      setIsEditing(false);
      addNotification({
        id: `notif_${Date.now()}`,
        userId: startupData.founderId || 'founder',
        title: 'MVP Plan Saved',
        message: 'Your edited MVP planning roadmap details have been saved.',
        type: 'ai_builder',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.error('Failed to save MVP plan', e);
    }
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    setTimeout(() => {
      setEditForm({
        ...data,
        mvpConcept: `Streamlined MVP execution blueprint optimized for fast release and early user validation.`
      });
      setIsGenerating(false);
    }, 1200);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(91, 33, 182);
    doc.text(`MVP Roadmap & Specification: ${startupData?.startupName || 'Startup'}`, 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text(`Estimated Complexity: ${editForm.estimatedComplexity}`, 14, 30);
    doc.text(`MVP Concept:`, 14, 38);
    doc.setFontSize(10);
    const splitConcept = doc.splitTextToSize(editForm.mvpConcept, 180);
    doc.text(splitConcept, 14, 46);

    doc.setFontSize(12);
    doc.setTextColor(91, 33, 182);
    doc.text(`Must-Have MVP Features:`, 14, 65);
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    editForm.mustHaveFeatures.forEach((feat: string, idx: number) => {
      doc.text(`• ${feat}`, 14, 75 + (idx * 8));
    });

    doc.save(`${startupData?.startupName || 'Startup'}_MVP_Plan.pdf`);
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Layers size={24} className="text-[#5B21B6]" />
            <h1 className="text-2xl font-bold text-gray-900">AI MVP Planner</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Structured feature specification, tech stack, release roadmap, and development phases.
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

      {/* MVP Concept Banner */}
      <div className="bg-gradient-to-r from-[#4C1D95] via-[#5B21B6] to-purple-800 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase mb-2">
            <Sparkles size={14} /> Core MVP Concept
          </div>
          {isEditing ? (
            <textarea
              value={editForm.mvpConcept}
              onChange={(e) => setEditForm({ ...editForm, mvpConcept: e.target.value })}
              className="w-full p-3 bg-white/10 text-white border border-white/20 rounded-xl text-sm focus:outline-none"
            />
          ) : (
            <p className="text-lg font-bold leading-relaxed">{editForm.mvpConcept}</p>
          )}
        </div>
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl text-center flex-shrink-0">
          <span className="text-white/60 text-xs uppercase font-bold block">Estimated Complexity</span>
          <span className="text-xl font-extrabold text-amber-300 mt-1 block">{editForm.estimatedComplexity}</span>
        </div>
      </div>

      {/* Feature Separation: MVP Features vs Future Features */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Must-Have Features */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <CheckSquare size={18} className="text-emerald-600" /> Must-Have (MVP V1)
            </h3>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Phase 1</span>
          </div>
          <ul className="space-y-2">
            {editForm.mustHaveFeatures.map((feat: string, idx: number) => (
              <li key={idx} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-sm font-medium text-gray-800 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Nice-to-Have Features */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Sparkles size={18} className="text-[#5B21B6]" /> Nice-to-Have (MVP V1.5)
            </h3>
            <span className="text-xs bg-purple-100 text-[#5B21B6] font-bold px-2 py-0.5 rounded-full">Phase 2</span>
          </div>
          <ul className="space-y-2">
            {editForm.niceToHaveFeatures.map((feat: string, idx: number) => (
              <li key={idx} className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-sm font-medium text-gray-800 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5B21B6] mt-2 flex-shrink-0"></span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Future Features */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Rocket size={18} className="text-amber-500" /> Future Scale (V2+)
            </h3>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">Post-MVP</span>
          </div>
          <ul className="space-y-2">
            {editForm.futureFeatures.map((feat: string, idx: number) => (
              <li key={idx} className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-sm font-medium text-gray-800 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0"></span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* User Roles & User Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Roles */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Users size={18} className="text-[#5B21B6]" /> Defined User Roles
          </h3>
          <div className="space-y-3">
            {editForm.userRoles.map((role: string, idx: number) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm font-semibold text-gray-800 flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-purple-100 text-[#5B21B6] font-bold text-xs flex items-center justify-center">
                  {idx + 1}
                </span>
                <span>{role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step-by-Step User Flow */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Clock size={18} className="text-blue-600" /> Step-by-Step Core User Flow
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {editForm.userFlow.map((flow: any, idx: number) => (
              <div key={idx} className="p-4 bg-blue-50/40 rounded-xl border border-blue-100 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {flow.step || idx + 1}
                  </span>
                  <span className="font-bold text-gray-900 text-sm">{flow.title}</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed pl-8">{flow.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technology Stack & Development Phases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Technology Stack */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Code2 size={18} className="text-[#5B21B6]" /> Technology Stack Requirements
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase block mb-2">Frontend</span>
              <div className="flex flex-wrap gap-1.5">
                {editForm.requiredTechStack?.frontend?.map((tech: string, i: number) => (
                  <span key={i} className="text-xs font-semibold px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-gray-800">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase block mb-2">Backend</span>
              <div className="flex flex-wrap gap-1.5">
                {editForm.requiredTechStack?.backend?.map((tech: string, i: number) => (
                  <span key={i} className="text-xs font-semibold px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-gray-800">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase block mb-2">Database</span>
              <div className="flex flex-wrap gap-1.5">
                {editForm.requiredTechStack?.database?.map((tech: string, i: number) => (
                  <span key={i} className="text-xs font-semibold px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-gray-800">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase block mb-2">Cloud & APIs</span>
              <div className="flex flex-wrap gap-1.5">
                {editForm.requiredTechStack?.cloudServices?.map((tech: string, i: number) => (
                  <span key={i} className="text-xs font-semibold px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-gray-800">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Development Phases & MVP Roadmap */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Rocket size={18} className="text-emerald-600" /> Development Phases & Roadmap
          </h3>

          <div className="space-y-3">
            {editForm.developmentPhases.map((phase: any, idx: number) => (
              <div key={idx} className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100 flex items-start justify-between gap-3">
                <div>
                  <span className="font-bold text-gray-900 text-sm block">{phase.phase}</span>
                  <span className="text-xs text-gray-600">{phase.focus}</span>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full flex-shrink-0">
                  {phase.duration}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FounderMVPPlanner;
