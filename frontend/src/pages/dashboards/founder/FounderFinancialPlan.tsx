import React, { useState } from 'react';
import { IndianRupee, RefreshCw, Download, Edit3, Save, TrendingUp, DollarSign, Calculator, AlertCircle, PieChart, ShieldCheck } from 'lucide-react';
import { getFinancialPlanData, updateStartup, addNotification, formatRupeeText } from '../../../utils/localStorageHelper';
import jsPDF from 'jspdf';

interface Props {
  startupData?: any;
  setStartupData?: (data: any) => void;
}

const FounderFinancialPlan: React.FC<Props> = ({ startupData, setStartupData }) => {
  const data = formatRupeeText(getFinancialPlanData(startupData));
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editForm, setEditForm] = useState(data);

  if (!startupData) {
    return (
      <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 text-center my-6">
        <p className="text-[#5B21B6] font-bold">Please select or generate a startup idea first to view Financial Plan.</p>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      const startupId = startupData.startupId || startupData._id || startupData.id;
      const updatedAiGenerated = {
        ...(startupData.aiGenerated || {}),
        financialPlan: editForm
      };
      const updated = await updateStartup(startupId, { aiGenerated: updatedAiGenerated });
      if (setStartupData) {
        setStartupData(updated || { ...startupData, aiGenerated: updatedAiGenerated });
      }
      setIsEditing(false);
      addNotification({
        id: `notif_${Date.now()}`,
        userId: startupData.founderId || 'founder',
        title: 'Financial Plan Saved',
        message: 'Your edited financial assumptions and projections have been saved.',
        type: 'ai_builder',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.error('Failed to save financial plan', e);
    }
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    setTimeout(() => {
      setEditForm({
        ...data,
        breakEvenEstimate: 'Month 6 (Accelerated Customer Acquisition)'
      });
      setIsGenerating(false);
    }, 1200);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(91, 33, 182);
    doc.text(`Financial Model: ${startupData?.startupName || 'Startup'}`, 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text(`Initial CapEx: ${editForm.initialStartupCost}`, 14, 30);
    doc.text(`Monthly OpEx: ${editForm.monthlyExpenses}`, 14, 38);
    doc.text(`Break-even Estimate: ${editForm.breakEvenEstimate}`, 14, 46);

    doc.setFontSize(14);
    doc.setTextColor(91, 33, 182);
    doc.text("Multi-Year Projections (Revenue vs Expenses vs Profit):", 14, 60);

    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text(`Year 1: Revenue ${editForm.year1Projection.revenue} | Net Profit ${editForm.year1Projection.netProfit}`, 14, 70);
    doc.text(`Year 3: Revenue ${editForm.year3Projection.revenue} | Net Profit ${editForm.year3Projection.netProfit}`, 14, 78);
    doc.text(`Year 5: Revenue ${editForm.year5Projection.revenue} | Net Profit ${editForm.year5Projection.netProfit}`, 14, 86);

    doc.save(`${startupData?.startupName || 'Startup'}_Financial_Plan.pdf`);
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <IndianRupee size={24} className="text-[#5B21B6]" />
            <h1 className="text-2xl font-bold text-gray-900">AI Financial Planning & Projections</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Cost breakdown, revenue model, customer acquisition economics, and 1-3-5 year financial forecasts.
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

      {/* AI Estimate Disclaimer Banner */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between gap-3 text-amber-900 text-xs md:text-sm font-medium">
        <div className="flex items-center gap-2">
          <AlertCircle size={18} className="text-amber-600 flex-shrink-0" />
          <span>All monetary values are AI-generated financial estimates. You can edit any assumption directly.</span>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-[#5B21B6] hover:underline font-bold text-xs flex-shrink-0"
        >
          {isEditing ? 'Done Editing' : 'Edit Assumptions'}
        </button>
      </div>

      {/* Key Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-gradient-to-br from-[#4C1D95] to-[#6D28D9] rounded-2xl p-6 text-white shadow-lg">
          <span className="text-xs font-bold text-white/70 uppercase block mb-1">Initial CapEx Cost</span>
          {isEditing ? (
            <input
              type="text"
              value={editForm.initialStartupCost}
              onChange={(e) => setEditForm({ ...editForm, initialStartupCost: e.target.value })}
              className="w-full p-1.5 bg-white/10 border border-white/30 rounded text-white font-extrabold text-2xl"
            />
          ) : (
            <p className="text-3xl font-extrabold">{editForm.initialStartupCost}</p>
          )}
          <p className="text-xs text-white/60 mt-2">Setup & Infrastructure</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Monthly OpEx</span>
          {isEditing ? (
            <input
              type="text"
              value={editForm.monthlyExpenses}
              onChange={(e) => setEditForm({ ...editForm, monthlyExpenses: e.target.value })}
              className="w-full p-1.5 border border-gray-300 rounded font-extrabold text-2xl"
            />
          ) : (
            <p className="text-3xl font-extrabold text-gray-900">{editForm.monthlyExpenses}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">Recurring Operational Burn</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Break-Even Point</span>
          {isEditing ? (
            <input
              type="text"
              value={editForm.breakEvenEstimate}
              onChange={(e) => setEditForm({ ...editForm, breakEvenEstimate: e.target.value })}
              className="w-full p-1.5 border border-gray-300 rounded font-extrabold text-2xl"
            />
          ) : (
            <p className="text-3xl font-extrabold text-emerald-600">{editForm.breakEvenEstimate}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">Estimated Runway Target</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Year 1 Net Profit</span>
          <p className="text-3xl font-extrabold text-[#5B21B6]">{editForm.year1Projection.netProfit}</p>
          <p className="text-xs text-gray-500 mt-2">Target Net Margin</p>
        </div>
      </div>

      {/* Upfront Cost Distribution Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <PieChart size={18} className="text-[#5B21B6]" /> Initial Cost Allocation
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100">
            <span className="text-xs font-bold text-purple-900 uppercase">Development & Tech</span>
            {isEditing ? (
              <input
                type="text"
                value={editForm.developmentCost}
                onChange={(e) => setEditForm({ ...editForm, developmentCost: e.target.value })}
                className="w-full mt-1 p-1.5 border border-purple-200 rounded text-sm font-bold"
              />
            ) : (
              <p className="text-xl font-extrabold text-[#5B21B6] mt-1">{editForm.developmentCost}</p>
            )}
          </div>

          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100">
            <span className="text-xs font-bold text-amber-900 uppercase">Marketing & Launch</span>
            {isEditing ? (
              <input
                type="text"
                value={editForm.marketingCost}
                onChange={(e) => setEditForm({ ...editForm, marketingCost: e.target.value })}
                className="w-full mt-1 p-1.5 border border-amber-200 rounded text-sm font-bold"
              />
            ) : (
              <p className="text-xl font-extrabold text-amber-700 mt-1">{editForm.marketingCost}</p>
            )}
          </div>

          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
            <span className="text-xs font-bold text-blue-900 uppercase">Operations & Reserve</span>
            {isEditing ? (
              <input
                type="text"
                value={editForm.operationalExpenses}
                onChange={(e) => setEditForm({ ...editForm, operationalExpenses: e.target.value })}
                className="w-full mt-1 p-1.5 border border-blue-200 rounded text-sm font-bold"
              />
            ) : (
              <p className="text-xl font-extrabold text-blue-700 mt-1">{editForm.operationalExpenses}</p>
            )}
          </div>
        </div>
      </div>

      {/* Multi-Year Financial Forecast Table */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp size={18} className="text-emerald-600" /> Multi-Year Financial Forecast (1, 3, 5 Years)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-purple-50 text-[#5B21B6] border-b border-purple-100">
                <th className="p-3 font-bold rounded-l-xl">Timeline</th>
                <th className="p-3 font-bold text-gray-700">Projected Revenue</th>
                <th className="p-3 font-bold text-gray-700">Estimated Expenses</th>
                <th className="p-3 font-bold text-emerald-700 rounded-r-xl">Net Profit Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-semibold">
              <tr className="hover:bg-gray-50/80">
                <td className="p-3 text-gray-900">Year 1</td>
                <td className="p-3 text-purple-900">{editForm.year1Projection.revenue}</td>
                <td className="p-3 text-gray-600">{editForm.year1Projection.expenses}</td>
                <td className="p-3 text-emerald-600">{editForm.year1Projection.netProfit}</td>
              </tr>
              <tr className="hover:bg-gray-50/80">
                <td className="p-3 text-gray-900">Year 3</td>
                <td className="p-3 text-purple-900">{editForm.year3Projection.revenue}</td>
                <td className="p-3 text-gray-600">{editForm.year3Projection.expenses}</td>
                <td className="p-3 text-emerald-600">{editForm.year3Projection.netProfit}</td>
              </tr>
              <tr className="hover:bg-gray-50/80">
                <td className="p-3 text-gray-900">Year 5</td>
                <td className="p-3 text-purple-900">{editForm.year5Projection.revenue}</td>
                <td className="p-3 text-gray-600">{editForm.year5Projection.expenses}</td>
                <td className="p-3 text-emerald-600">{editForm.year5Projection.netProfit}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pricing & Customer Acquisition Assumptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Calculator size={18} className="text-[#5B21B6]" /> Suggested Pricing Strategy
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
            {formatRupeeText(editForm.suggestedPricing)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck size={18} className="text-amber-500" /> Customer Acquisition Assumptions
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
            {editForm.customerAcquisitionAssumptions}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FounderFinancialPlan;
