import React, { useState } from 'react';
import { Lightbulb, Sparkles, FileText, BarChart3, Search, Scale, ClipboardList, MessageSquare, Lock, ShieldCheck, Target, Layers, IndianRupee, Send, Download } from 'lucide-react';
import FounderIdeaGenerator from '../../pages/dashboards/founder/FounderIdeaGenerator';
import FounderIdeaValidation from '../../pages/dashboards/founder/FounderIdeaValidation';
import FounderCompetitorAnalysis from '../../pages/dashboards/founder/FounderCompetitorAnalysis';
import FounderMVPPlanner from '../../pages/dashboards/founder/FounderMVPPlanner';
import FounderFinancialPlan from '../../pages/dashboards/founder/FounderFinancialPlan';
import FounderGTMStrategy from '../../pages/dashboards/founder/FounderGTMStrategy';
import FounderBranding from '../../pages/dashboards/founder/FounderBranding';
import FounderBusinessPlan from '../../pages/dashboards/founder/FounderBusinessPlan';
import FounderPitchDeck from '../../pages/dashboards/founder/FounderPitchDeck';
import FounderMarketResearch from '../../pages/dashboards/founder/FounderMarketResearch';
import FounderLegalDocs from '../../pages/dashboards/founder/FounderLegalDocs';
import FounderReports from '../../pages/dashboards/founder/FounderReports';
import FounderAIChat from '../../pages/dashboards/founder/FounderAIChat';
import PlanGate, { usePlanAccess } from '../shared/PlanGate';
import jsPDF from 'jspdf';
import { Document as DocxDocument, Packer, Paragraph, TextRun } from 'docx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface Props {
  startupData: any;
}

const tabs = [
  { id: 'idea',                label: 'AI Idea Generator',    icon: Lightbulb,     component: FounderIdeaGenerator },
  { id: 'idea_validation',     label: 'Idea Validation',      icon: ShieldCheck,   component: FounderIdeaValidation },
  { id: 'competitor_analysis', label: 'Competitor Analysis',  icon: Target,        component: FounderCompetitorAnalysis },
  { id: 'mvp_planner',         label: 'MVP Planner',          icon: Layers,        component: FounderMVPPlanner },
  { id: 'financial_plan',      label: 'Financial Plan',       icon: IndianRupee,   component: FounderFinancialPlan },
  { id: 'gtm_strategy',        label: 'Go-To-Market Strategy', icon: Send,         component: FounderGTMStrategy },
  { id: 'branding',            label: 'Logo & Branding',      icon: Sparkles,      component: FounderBranding, plans: ['pro', 'premium_startup_builder'] },
  { id: 'plan',                label: 'Business Plan',        icon: FileText,      component: FounderBusinessPlan },
  { id: 'pitch',               label: 'Pitch Deck',           icon: BarChart3,     component: FounderPitchDeck },
  { id: 'market',              label: 'Market Research',      icon: Search,        component: FounderMarketResearch },
  { id: 'legal',               label: 'Legal & Documents',    icon: Scale,         component: FounderLegalDocs },
  { id: 'reports',             label: 'AI Reports',           icon: ClipboardList, component: FounderReports },
  { id: 'chat',                label: 'AI Chat',              icon: MessageSquare, component: FounderAIChat, plans: ['pro', 'premium_startup_builder'] },
];

const SharedStartupDetailsTabs: React.FC<Props> = ({ startupData }) => {
  const [activeTab, setActiveTab] = useState('idea');
  const { canAccess } = usePlanAccess();

  const activeTabDef = tabs.find(t => t.id === activeTab) || tabs[0];
  const ActiveComponent = activeTabDef.component;

  const handleDownload = async (format: string) => {
    const startup = startupData;
    const cleanName = (startup.startupName || 'Startup').replace(/\s+/g, '_');
    const finalFormat = format.toLowerCase();
    const finalName = `${cleanName}_Report.${finalFormat}`;
    
    const ai = startup.aiGenerated || {};
    const idea = ai.ideaAnalysis || {};
    const plan = ai.businessPlan || {};
    const market = ai.marketResearch || {};
    const report = ai.aiReport || {};

    try {
      if (finalFormat === 'pdf') {
        const doc = new jsPDF();
        let y = 20;

        const addTextLine = (text: string, fontSize = 12, isBold = false, color = '#111827') => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.setFontSize(fontSize);
          doc.setFont('helvetica', isBold ? 'bold' : 'normal');
          doc.setTextColor(color);
          const lines = doc.splitTextToSize(text, 170);
          lines.forEach((line: string) => {
            if (y > 270) {
              doc.addPage();
              y = 20;
              doc.setFontSize(fontSize);
              doc.setFont('helvetica', isBold ? 'bold' : 'normal');
              doc.setTextColor(color);
            }
            doc.text(line, 20, y);
            y += fontSize * 0.5 + 4;
          });
        };

        addTextLine(`Startup Report: ${startup.startupName || 'Concept'}`, 22, true, '#5B21B6');
        y += 6;
        addTextLine(`Concept: ${startup.startupIdea || 'AI Generated Idea'}`, 11, false, '#4B5563');
        y += 10;

        addTextLine('1. AI Idea Analysis', 16, true, '#1E1B4B');
        y += 2;
        addTextLine(`Refined Idea: ${idea.refinedIdea || idea.refinedStartupIdea || 'N/A'}`, 11, false);
        addTextLine(`Problem Statement: ${idea.problemStatement || 'N/A'}`, 11, false);
        addTextLine(`Solution: ${idea.solution || 'N/A'}`, 11, false);
        addTextLine(`Target Customers: ${Array.isArray(idea.targetCustomers) ? idea.targetCustomers.join(', ') : idea.targetCustomers || 'N/A'}`, 11, false);
        addTextLine(`Business Model: ${idea.businessModel || 'N/A'}`, 11, false);
        addTextLine(`Revenue Model: ${idea.revenueModel || 'N/A'}`, 11, false);
        addTextLine(`Core Features: ${Array.isArray(idea.coreFeatures) ? idea.coreFeatures.join(', ') : idea.coreFeatures || 'N/A'}`, 11, false);
        y += 6;

        addTextLine('2. Business Plan', 16, true, '#1E1B4B');
        y += 2;
        addTextLine(`Executive Summary: ${plan.executiveSummary || 'N/A'}`, 11, false);
        addTextLine(`Pricing Strategy: ${plan.pricingStrategy || 'N/A'}`, 11, false);
        addTextLine(`Go-To-Market Strategy: ${plan.goToMarketStrategy || 'N/A'}`, 11, false);
        addTextLine(`Operations Plan: ${plan.operationsPlan || 'N/A'}`, 11, false);
        addTextLine(`Financial Projection: ${plan.financialProjection || 'N/A'}`, 11, false);
        addTextLine(`Funding Ask: ${plan.fundingAsk || 'N/A'}`, 11, false);
        y += 6;

        addTextLine('3. Market Research', 16, true, '#1E1B4B');
        y += 2;
        addTextLine(`TAM: ${market.tam || 'N/A'} | SAM: ${market.sam || 'N/A'} | SOM: ${market.som || 'N/A'}`, 11, true);
        addTextLine(`Competitor Analysis: ${Array.isArray(market.competitors) ? market.competitors.join(', ') : market.competitors || market.competitorAnalysis || 'N/A'}`, 11, false);
        addTextLine(`Pricing Suggestions: ${market.pricingSuggestions || 'N/A'}`, 11, false);
        addTextLine(`Location/Distribution Suggestions: ${market.locationSuggestions || 'N/A'}`, 11, false);
        y += 6;

        addTextLine('4. AI Report & Metrics', 16, true, '#1E1B4B');
        y += 2;
        addTextLine(`Investment Readiness Score: ${report.investmentReadinessScore || 'N/A'}/100`, 11, true, '#10B981');
        addTextLine(`Scalability Score: ${report.scalabilityScore || 'N/A'}/100`, 11, true, '#10B981');
        addTextLine(`Key Strengths: ${Array.isArray(report.keyStrengths) ? report.keyStrengths.join(', ') : report.businessStrengths || 'N/A'}`, 11, false);
        addTextLine(`Risk Factors: ${Array.isArray(report.riskFactors) ? report.riskFactors.join(', ') : report.weaknesses || 'N/A'}`, 11, false);
        addTextLine(`Mentor Review Summary: ${report.mentorReviewSummary || 'N/A'}`, 11, false);

        doc.save(finalName);
      } else if (finalFormat === 'word' || finalFormat === 'docx' || finalFormat === 'doc') {
        const docxDoc = new DocxDocument({
          sections: [{
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `Startup Report: ${startup.startupName || 'Concept'}`, bold: true, size: 36, color: '5B21B6' }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Original Concept: ${startup.startupIdea || 'AI Generated Idea'}`, italics: true, size: 24 }),
                ],
              }),
              new Paragraph({ text: '' }),

              new Paragraph({ children: [new TextRun({ text: '1. AI Idea Analysis', bold: true, size: 28, color: '1E1B4B' })] }),
              new Paragraph({ text: `Refined Idea: ${idea.refinedIdea || idea.refinedStartupIdea || 'N/A'}` }),
              new Paragraph({ text: `Problem Statement: ${idea.problemStatement || 'N/A'}` }),
              new Paragraph({ text: `Solution: ${idea.solution || 'N/A'}` }),
              new Paragraph({ text: `Target Customers: ${Array.isArray(idea.targetCustomers) ? idea.targetCustomers.join(', ') : idea.targetCustomers || 'N/A'}` }),
              new Paragraph({ text: `Business Model: ${idea.businessModel || 'N/A'}` }),
              new Paragraph({ text: `Revenue Model: ${idea.revenueModel || 'N/A'}` }),
              new Paragraph({ text: `Core Features: ${Array.isArray(idea.coreFeatures) ? idea.coreFeatures.join(', ') : idea.coreFeatures || 'N/A'}` }),
              new Paragraph({ text: '' }),

              new Paragraph({ children: [new TextRun({ text: '2. Business Plan', bold: true, size: 28, color: '1E1B4B' })] }),
              new Paragraph({ text: `Executive Summary: ${plan.executiveSummary || 'N/A'}` }),
              new Paragraph({ text: `Pricing Strategy: ${plan.pricingStrategy || 'N/A'}` }),
              new Paragraph({ text: `Go-To-Market Strategy: ${plan.goToMarketStrategy || 'N/A'}` }),
              new Paragraph({ text: `Operations Plan: ${plan.operationsPlan || 'N/A'}` }),
              new Paragraph({ text: `Financial Projection: ${plan.financialProjection || 'N/A'}` }),
              new Paragraph({ text: `Funding Ask: ${plan.fundingAsk || 'N/A'}` }),
              new Paragraph({ text: '' }),

              new Paragraph({ children: [new TextRun({ text: '3. Market Research', bold: true, size: 28, color: '1E1B4B' })] }),
              new Paragraph({ text: `TAM: ${market.tam || 'N/A'} | SAM: ${market.sam || 'N/A'} | SOM: ${market.som || 'N/A'}` }),
              new Paragraph({ text: `Competitor Analysis: ${Array.isArray(market.competitors) ? market.competitors.join(', ') : market.competitors || market.competitorAnalysis || 'N/A'}` }),
              new Paragraph({ text: `Pricing Suggestions: ${market.pricingSuggestions || 'N/A'}` }),
              new Paragraph({ text: `Location Suggestions: ${market.locationSuggestions || 'N/A'}` }),
              new Paragraph({ text: '' }),

              new Paragraph({ children: [new TextRun({ text: '4. AI Report & Metrics', bold: true, size: 28, color: '1E1B4B' })] }),
              new Paragraph({ text: `Investment Readiness Score: ${report.investmentReadinessScore || 'N/A'}/100` }),
              new Paragraph({ text: `Scalability Score: ${report.scalabilityScore || 'N/A'}/100` }),
              new Paragraph({ text: `Key Strengths: ${Array.isArray(report.keyStrengths) ? report.keyStrengths.join(', ') : report.businessStrengths || 'N/A'}` }),
              new Paragraph({ text: `Risk Factors: ${Array.isArray(report.riskFactors) ? report.riskFactors.join(', ') : report.weaknesses || 'N/A'}` }),
              new Paragraph({ text: `Mentor Review Summary: ${report.mentorReviewSummary || 'N/A'}` }),
            ],
          }],
        });
        const blob = await Packer.toBlob(docxDoc);
        saveAs(blob, `${cleanName}_Report.docx`);
      } else if (finalFormat === 'zip') {
        const zip = new JSZip();
        zip.file("README.txt", `Report package for ${startup.startupName || 'Concept'}.\nGenerated automatically by AI Startup Builder.`);
        zip.file("Idea_Analysis.txt", `Refined Idea: ${idea.refinedIdea || idea.refinedStartupIdea || 'N/A'}\n\nProblem Statement: ${idea.problemStatement || 'N/A'}\n\nSolution: ${idea.solution || 'N/A'}\n\nTarget Customers: ${Array.isArray(idea.targetCustomers) ? idea.targetCustomers.join(', ') : idea.targetCustomers || 'N/A'}\n\nBusiness Model: ${idea.businessModel || 'N/A'}\n\nRevenue Model: ${idea.revenueModel || 'N/A'}\n\nCore Features: ${Array.isArray(idea.coreFeatures) ? idea.coreFeatures.join(', ') : idea.coreFeatures || 'N/A'}`);
        zip.file("Business_Plan.txt", `Executive Summary: ${plan.executiveSummary || 'N/A'}\n\nPricing Strategy: ${plan.pricingStrategy || 'N/A'}\n\nGo-To-Market Strategy: ${plan.goToMarketStrategy || 'N/A'}\n\nOperations Plan: ${plan.operationsPlan || 'N/A'}\n\nFinancial Projection: ${plan.financialProjection || 'N/A'}\n\nFunding Ask: ${plan.fundingAsk || 'N/A'}`);
        zip.file("Market_Research.txt", `TAM: ${market.tam || 'N/A'}\nSAM: ${market.sam || 'N/A'}\nSOM: ${market.som || 'N/A'}\n\nCompetitor Analysis: ${Array.isArray(market.competitors) ? market.competitors.join(', ') : market.competitors || market.competitorAnalysis || 'N/A'}\n\nPricing Suggestions: ${market.pricingSuggestions || 'N/A'}\n\nLocation Suggestions: ${market.locationSuggestions || 'N/A'}`);
        zip.file("AI_Metrics.txt", `Investment Readiness Score: ${report.investmentReadinessScore || 'N/A'}/100\n\nScalability Score: ${report.scalabilityScore || 'N/A'}/100\n\nKey Strengths: ${Array.isArray(report.keyStrengths) ? report.keyStrengths.join(', ') : report.businessStrengths || 'N/A'}\n\nRisk Factors: ${Array.isArray(report.riskFactors) ? report.riskFactors.join(', ') : report.weaknesses || 'N/A'}\n\nMentor Review Summary: ${report.mentorReviewSummary || 'N/A'}`);
        
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, finalName);
      }
    } catch (error) {
      console.error("Error generating document:", error);
      window.alert(`Failed to generate ${finalFormat.toUpperCase()} file.`);
    }
  };

  return (
    <div className="w-full flex flex-col read-only-view">
      {/* Download Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100 bg-purple-50/30 p-4 rounded-2xl border border-purple-100/50">
        <div className="text-sm font-bold text-gray-700 flex items-center gap-2">
          <Download size={16} className="text-[#5B21B6]" />
          <span>Export Startup Idea Package:</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => handleDownload('pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 hover:border-red-300 font-bold rounded-xl text-xs transition-colors shadow-sm"
          >
            <FileText size={14} /> Download PDF
          </button>
          <button
            onClick={() => handleDownload('word')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 hover:border-blue-300 font-bold rounded-xl text-xs transition-colors shadow-sm"
          >
            <FileText size={14} /> Download Word (DOCX)
          </button>
          <button
            onClick={() => handleDownload('zip')}
            className="flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 hover:border-amber-300 font-bold rounded-xl text-xs transition-colors shadow-sm"
          >
            <Layers size={14} /> Download ZIP Archive
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border border-gray-100 bg-gray-50/50 p-2 rounded-2xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const isLocked = tab.plans ? !canAccess(tab.plans) : false;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                isActive 
                  ? 'bg-white text-[#5B21B6] shadow-sm ring-1 ring-gray-200/50' 
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <Icon size={16} className={`mr-2 ${isActive ? 'text-[#5B21B6]' : 'text-gray-400'}`} />
              {tab.label}
              {isLocked && <Lock size={13} className="ml-2 text-amber-500" />}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 w-full relative">
        {/* We pass a dummy setStartupData since it's read-only */}
        {activeTabDef.plans ? (
          <PlanGate requiredPlans={activeTabDef.plans}>
            <ActiveComponent startupData={startupData} setStartupData={() => {}} />
          </PlanGate>
        ) : (
          <ActiveComponent startupData={startupData} setStartupData={() => {}} />
        )}
      </div>
    </div>
  );
};

export default SharedStartupDetailsTabs;
