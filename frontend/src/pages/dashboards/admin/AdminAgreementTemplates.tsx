import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText, Plus, Copy, Trash2, Edit3, CheckCircle2, XCircle, Archive, Eye, Check, RefreshCw,
  Search, Filter, ShieldCheck, Sparkles, Layers, Layers3, AlertCircle, ArrowRight, X
} from 'lucide-react';
import {
  getAgreementTemplates,
  saveTemplate,
  duplicateTemplate,
  deleteOrArchiveTemplate,
  ALL_BUSINESS_CATEGORIES,
  STANDARD_AGREEMENT_TYPES,
  type IAgreementTemplate,
  type ITemplateClause
} from '../../../utils/agreementTemplateStorage';
import { useAuth } from '../../../context/AuthContext';

const AdminAgreementTemplates: React.FC = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<IAgreementTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<Partial<IAgreementTemplate> | null>(null);
  const [previewTarget, setPreviewTarget] = useState<IAgreementTemplate | null>(null);

  // Form states for creating / editing
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('FinTech');
  const [formType, setFormType] = useState<IAgreementTemplate['agreementType']>('Equity Investment Agreement');
  const [formVersion, setFormVersion] = useState('1.0');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive' | 'Archived'>('Active');
  const [formDescription, setFormDescription] = useState('');
  const [formClauses, setFormClauses] = useState<ITemplateClause[]>([]);
  const [formRequiredFields, setFormRequiredFields] = useState<string[]>([]);

  // Clause editing inputs
  const [newClauseTitle, setNewClauseTitle] = useState('');
  const [newClauseContent, setNewClauseContent] = useState('');

  const refreshList = () => {
    const list = getAgreementTemplates();
    setTemplates(list);
  };

  useEffect(() => {
    refreshList();
  }, []);

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.businessCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.agreementType.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || t.businessCategory === selectedCategory;
      const matchesType = selectedType === 'All' || t.agreementType === selectedType;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [templates, searchQuery, selectedCategory, selectedType]);

  const handleOpenCreate = () => {
    setCurrentTemplate(null);
    setFormName('');
    setFormCategory('FinTech');
    setFormType('Equity Investment Agreement');
    setFormVersion('1.0');
    setFormStatus('Active');
    setFormDescription('Standard admin-approved legal template.');
    setFormClauses([
      { id: 'c1', title: 'Parties & Recitals', content: 'This Investment Agreement is executed by and between the Investor and Startup Issuer.', isEditable: false },
      { id: 'c2', title: 'Investment & Equity Terms', content: 'Capital allocation in exchange for equity stake or future equity conversion.', isEditable: false }
    ]);
    setFormRequiredFields(['Investment Amount', 'Equity %', 'Valuation']);
    setShowEditModal(true);
  };

  const handleOpenEdit = (t: IAgreementTemplate) => {
    setCurrentTemplate(t);
    setFormName(t.name);
    setFormCategory(t.businessCategory);
    setFormType(t.agreementType);
    setFormVersion(t.version);
    setFormStatus(t.status);
    setFormDescription(t.description || '');
    setFormClauses(t.clauses || []);
    setFormRequiredFields(t.requiredFields || []);
    setShowEditModal(true);
  };

  const handleAddClause = () => {
    if (!newClauseTitle.trim() || !newClauseContent.trim()) {
      alert('Clause title and content are required.');
      return;
    }
    const clause: ITemplateClause = {
      id: `c_${Date.now()}`,
      title: newClauseTitle.trim(),
      content: newClauseContent.trim(),
      isEditable: true
    };
    setFormClauses(prev => [...prev, clause]);
    setNewClauseTitle('');
    setNewClauseContent('');
  };

  const handleRemoveClause = (clauseId: string) => {
    setFormClauses(prev => prev.filter(c => c.id !== clauseId));
  };

  const handleSaveForm = () => {
    if (!formName.trim()) {
      alert('Template Name is required.');
      return;
    }

    const payload: IAgreementTemplate = {
      id: currentTemplate?.id || `tmpl_${Date.now()}`,
      name: formName.trim(),
      businessCategory: formCategory,
      agreementType: formType,
      version: formVersion,
      status: formStatus,
      description: formDescription,
      clauses: formClauses,
      requiredFields: formRequiredFields,
      optionalFields: ['Milestones / Conditions', 'Use of Funds'],
      createdBy: currentTemplate?.createdBy || user?.fullName || 'System Admin',
      createdAt: currentTemplate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: currentTemplate?.usageCount || 0
    };

    saveTemplate(payload);
    setShowEditModal(false);
    refreshList();
  };

  const handleDuplicate = (id: string) => {
    const copy = duplicateTemplate(id);
    if (copy) {
      refreshList();
    }
  };

  const handleToggleStatus = (t: IAgreementTemplate) => {
    const updated: IAgreementTemplate = {
      ...t,
      status: t.status === 'Active' ? 'Inactive' : 'Active',
      updatedAt: new Date().toISOString()
    };
    saveTemplate(updated);
    refreshList();
  };

  const handleArchive = (id: string) => {
    if (!confirm('Are you sure you want to archive this template?')) return;
    deleteOrArchiveTemplate(id, true);
    refreshList();
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 rounded-3xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-500/30 text-purple-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
              Admin Governance
            </span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Layers3 className="text-purple-400" size={26} /> Admin Agreement Template Management
          </h1>
          <p className="text-purple-200 text-xs mt-1">
            Control the master library of legal templates, assign business categories, manage clauses, and maintain version control.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition flex items-center gap-2 self-start md:self-auto"
        >
          <Plus size={16} /> Create New Template
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search templates by name, business category, or type..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-600"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl focus:outline-none"
          >
            <option value="All">All Business Categories</option>
            {ALL_BUSINESS_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl focus:outline-none"
          >
            <option value="All">All Agreement Types</option>
            {STANDARD_AGREEMENT_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <FileText size={16} className="text-purple-600" /> Approved Agreement Templates ({filteredTemplates.length})
          </h3>
          <span className="text-xs text-slate-500 font-semibold">Master Library</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap text-xs font-medium">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="px-5 py-3.5">Template Name</th>
                <th className="px-5 py-3.5">Business Category</th>
                <th className="px-5 py-3.5">Agreement Type</th>
                <th className="px-5 py-3.5">Version</th>
                <th className="px-5 py-3.5">Usage</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Last Updated</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400 text-xs">
                    No matching agreement templates found in library.
                  </td>
                </tr>
              ) : (
                filteredTemplates.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900">
                      <div>{t.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{t.description?.slice(0, 50)}...</div>
                    </td>
                    <td className="px-5 py-4 font-extrabold text-indigo-700">
                      <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-[10px]">
                        {t.businessCategory}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-purple-900">{t.agreementType}</td>
                    <td className="px-5 py-4 font-bold text-slate-600">v{t.version}</td>
                    <td className="px-5 py-4 font-extrabold text-slate-800">{t.usageCount} uses</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleStatus(t)}
                        className={`px-2.5 py-1 rounded-full font-bold text-[10px] transition ${
                          t.status === 'Active' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' :
                          t.status === 'Inactive' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' :
                          'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {t.status}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-[11px]">
                      {new Date(t.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setPreviewTarget(t);
                            setShowPreviewModal(true);
                          }}
                          title="Preview Template"
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(t)}
                          title="Edit Template"
                          className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDuplicate(t.id)}
                          title="Duplicate Template"
                          className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => handleArchive(t.id)}
                          title="Archive Template"
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition"
                        >
                          <Archive size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
              <h3 className="text-lg font-black flex items-center gap-2">
                <Edit3 className="text-purple-400" size={20} />
                {currentTemplate ? `Edit Template: ${currentTemplate.name}` : 'Create New Agreement Template'}
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Template Name *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g. FinTech Equity Investment Agreement"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Business Category *</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:border-purple-600"
                  >
                    {ALL_BUSINESS_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Agreement Type *</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as any)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:border-purple-600"
                  >
                    {STANDARD_AGREEMENT_TYPES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Version</label>
                  <input
                    type="text"
                    value={formVersion}
                    onChange={e => setFormVersion(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-normal focus:border-purple-600"
                />
              </div>

              {/* Clauses Manager */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="font-extrabold text-slate-900 text-sm mb-3">Template Clauses ({formClauses.length})</h4>
                
                <div className="space-y-3 mb-4">
                  {formClauses.map((clause, i) => (
                    <div key={clause.id || i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-start gap-4">
                      <div>
                        <span className="font-extrabold text-purple-900 block">{clause.title}</span>
                        <p className="text-slate-600 text-[11px] mt-0.5">{clause.content}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveClause(clause.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-slate-100 rounded-2xl space-y-3">
                  <span className="font-bold text-slate-800">Add New Clause</span>
                  <input
                    type="text"
                    placeholder="Clause Title (e.g. Regulatory & Data Privacy)"
                    value={newClauseTitle}
                    onChange={e => setNewClauseTitle(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold"
                  />
                  <textarea
                    rows={2}
                    placeholder="Clause text content..."
                    value={newClauseContent}
                    onChange={e => setNewClauseContent(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-normal"
                  />
                  <button
                    onClick={handleAddClause}
                    className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl text-xs hover:bg-purple-500 transition"
                  >
                    Add Clause
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveForm}
                className="px-6 py-2 bg-purple-600 text-white font-black rounded-xl hover:bg-purple-500 transition"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {showPreviewModal && previewTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-black text-slate-900 text-base">{previewTarget.name} (v{previewTarget.version})</h3>
              <button onClick={() => setShowPreviewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-4 p-4 bg-slate-50 rounded-2xl text-xs text-slate-700">
              <div className="flex gap-4 border-b pb-2">
                <div><span className="font-bold">Category:</span> {previewTarget.businessCategory}</div>
                <div><span className="font-bold">Type:</span> {previewTarget.agreementType}</div>
                <div><span className="font-bold">Status:</span> {previewTarget.status}</div>
              </div>

              {previewTarget.clauses.map((c, i) => (
                <div key={i} className="p-3 bg-white border border-slate-200 rounded-xl">
                  <h5 className="font-extrabold text-purple-900 mb-1">{c.title}</h5>
                  <p className="text-slate-600">{c.content}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t flex justify-end">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-5 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAgreementTemplates;
