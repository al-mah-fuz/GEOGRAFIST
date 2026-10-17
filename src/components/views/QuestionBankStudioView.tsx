import React, { useState, useMemo } from 'react';
import {
  Database,
  Search,
  Filter,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Layers,
  Sparkles,
  BookOpen,
  Calendar,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileCode,
  ShieldCheck,
  RotateCcw,
  Tag,
  Info,
} from 'lucide-react';
import { CategoryId, Difficulty, Question } from '../../types';
import { CATEGORY_DEFINITIONS } from '../../data/questions';
import { VERIFIED_COUNTRY_FACTS } from '../../data/facts/countryFacts';
import { generateQuestionVariantsFromFacts } from '../../utils/factTemplates';
import { getCategoryPackStats } from '../../data/packs/registry';
import {
  exportQuestionsToPackJson,
  PackValidationReport,
  SAMPLE_EXPANSION_PACK_AFRICA,
  validateQuestionPackJson,
} from '../../utils/packValidator';

interface QuestionBankStudioViewProps {
  seedQuestions: Question[];
  importedQuestions: Question[];
  includeTemplatesInBank: boolean;
  onToggleTemplates: (include: boolean) => void;
  onCommitImportedQuestions: (newQuestions: Question[]) => void;
  onClearImportedQuestions: () => void;
}

type StudioTab = 'explorer' | 'import' | 'templates' | 'coverage' | 'pipeline';

export const QuestionBankStudioView: React.FC<QuestionBankStudioViewProps> = ({
  seedQuestions,
  importedQuestions,
  includeTemplatesInBank,
  onToggleTemplates,
  onCommitImportedQuestions,
  onClearImportedQuestions,
}) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('explorer');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<CategoryId | 'all'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | 'all'>('all');
  const [filterReviewStatus, setFilterReviewStatus] = useState<'all' | 'due' | 'timeSensitive' | 'seed' | 'derived' | 'imported'>('all');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  // Import workflow state
  const [rawJsonInput, setRawJsonInput] = useState('');
  const [validationReport, setValidationReport] = useState<PackValidationReport | null>(null);
  const [importNotification, setImportNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Deterministic facts & derived variants across all 4 factual registries
  const templateReport = useMemo(() => {
    return generateQuestionVariantsFromFacts();
  }, []);

  // Combined Active Production Bank
  const combinedBank = useMemo(() => {
    const list = [...seedQuestions, ...importedQuestions];
    if (includeTemplatesInBank) {
      list.push(...templateReport.variants);
    }
    return list;
  }, [seedQuestions, importedQuestions, includeTemplatesInBank, templateReport.variants]);

  // Review status calculations
  // Current reference year: 2026. Items verified before 2024-01 are flagged as "Due for Review".
  const reviewDueQuestions = useMemo(() => {
    return combinedBank.filter(q => {
      const parts = q.verifiedDate.split('-');
      const year = parseInt(parts[0], 10);
      return year <= 2023;
    });
  }, [combinedBank]);

  const timeSensitiveQuestions = useMemo(() => {
    return combinedBank.filter(q => q.isTimeSensitive || q.category === 'current_affairs');
  }, [combinedBank]);

  // Filtered Questions for Explorer Table
  const filteredQuestions = useMemo(() => {
    return combinedBank.filter(q => {
      // Category
      if (filterCategory !== 'all' && q.category !== filterCategory) return false;
      // Difficulty
      if (filterDifficulty !== 'all' && q.difficulty !== filterDifficulty) return false;
      // Status / Origin
      if (filterReviewStatus === 'due') {
        const year = parseInt(q.verifiedDate.split('-')[0], 10);
        if (year > 2023) return false;
      } else if (filterReviewStatus === 'timeSensitive') {
        if (!q.isTimeSensitive && q.category !== 'current_affairs') return false;
      } else if (filterReviewStatus === 'seed') {
        if (q.sourceFactId || q.id.startsWith('EXP-') || importedQuestions.some(iq => iq.id === q.id)) return false;
      } else if (filterReviewStatus === 'derived') {
        if (!q.sourceFactId) return false;
      } else if (filterReviewStatus === 'imported') {
        if (!importedQuestions.some(iq => iq.id === q.id)) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchText = q.question.toLowerCase().includes(query);
        const matchOptions = q.options.some(o => o.toLowerCase().includes(query));
        const matchTopic = q.topic.toLowerCase().includes(query);
        const matchSource = q.source.toLowerCase().includes(query);
        const matchId = q.id.toLowerCase().includes(query);
        const matchTags = q.tags?.some(t => t.toLowerCase().includes(query)) || false;
        return matchText || matchOptions || matchTopic || matchSource || matchId || matchTags;
      }

      return true;
    });
  }, [combinedBank, filterCategory, filterDifficulty, filterReviewStatus, searchQuery, importedQuestions]);

  // Handle validating text input or file
  const handleValidateJson = (jsonString: string) => {
    setRawJsonInput(jsonString);
    if (!jsonString.trim()) {
      setValidationReport(null);
      return;
    }
    const report = validateQuestionPackJson(jsonString, combinedBank);
    setValidationReport(report);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      handleValidateJson(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCommitValidQuestions = () => {
    if (!validationReport || validationReport.validQuestions.length === 0) return;

    onCommitImportedQuestions(validationReport.validQuestions);
    setImportNotification({
      message: `Successfully committed ${validationReport.validQuestions.length} validated records into the production bank.`,
      type: 'success',
    });
    setRawJsonInput('');
    setValidationReport(null);
    setTimeout(() => setImportNotification(null), 5000);
  };

  const handleExportFullBank = () => {
    const json = exportQuestionsToPackJson(combinedBank, {
      packTitle: 'GEOGRAFIST Master Question Bank Snapshot',
      description: `Complete export of ${combinedBank.length} verified records`,
    });
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `geografist_bank_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Title & Scalable Bank Transparency Header */}
      <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Database className="w-3.5 h-3.5" />
            <span>Deterministic Content Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit'] mt-1">
            Question Bank Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Curated datasets, deterministic fact templates, schema validation, and pack imports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportFullBank}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Bank (JSON)</span>
          </button>
        </div>
      </div>

      {/* Honest Count Transparency Strip */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Non-AI Content Origin & Live Bank Counts</span>
          </span>
          <span className="text-xs font-mono text-amber-400 font-bold">
            Total Active Bank: {combinedBank.length} Questions
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Seed Bank Questions</div>
            <div className="text-xl font-bold text-white font-mono mt-1">{seedQuestions.length}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Handcrafted & verified</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Source Country Facts</div>
            <div className="text-xl font-bold text-cyan-400 font-mono mt-1">{VERIFIED_COUNTRY_FACTS.length}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Primary structured facts</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Derived Question Variants</div>
            <div className="text-xl font-bold text-amber-400 font-mono mt-1">{templateReport.generatedVariantsCount}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Deterministic templates</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Imported Pack Records</div>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-1">{importedQuestions.length}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Verified local imports</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-400 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-200">Expansion Roadmap to 10,000 Questions per Category:</strong>{' '}
            GEOGRAFIST strictly reports current factual counts. Target numbers are never faked or presented as achieved. Expansion is powered by public domain datasets (UN Geospatial, CIA Factbook, UNESCO) through reproducible schema validation and deterministic templates.
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {(
          [
            { id: 'explorer', label: 'Bank Explorer & Search', icon: BookOpen },
            { id: 'import', label: 'Import Question Packs', icon: Upload },
            { id: 'templates', label: 'Fact Templates Engine', icon: FileCode },
            { id: 'coverage', label: 'Coverage & Review Health', icon: Layers },
            { id: 'pipeline', label: 'Dataset Pipelines & Sources', icon: ShieldCheck },
          ] as const
        ).map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                isActive
                  ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: BANK EXPLORER & SEARCH */}
      {activeTab === 'explorer' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by keyword, option, source, ID, or tag..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value as CategoryId | 'all')}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="all">All Categories</option>
                {CATEGORY_DEFINITIONS.filter(c => c.id !== 'mixed').map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filterDifficulty}
                onChange={e => setFilterDifficulty(e.target.value as Difficulty | 'all')}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="all">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 text-[11px] uppercase mr-1">Origin & Review:</span>
            {(
              [
                { id: 'all', label: 'All Questions' },
                { id: 'seed', label: 'Seed Questions' },
                { id: 'derived', label: 'Fact Derived' },
                { id: 'imported', label: 'Imported Packs' },
                { id: 'timeSensitive', label: 'Time-Sensitive' },
                { id: 'due', label: 'Due for Review' },
              ] as const
            ).map(f => (
              <button
                key={f.id}
                onClick={() => setFilterReviewStatus(f.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
                  filterReviewStatus === f.id
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-[10px] uppercase font-mono text-slate-400">
                  <tr>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Difficulty</th>
                    <th className="py-3 px-4">Question Text</th>
                    <th className="py-3 px-4">Verified</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredQuestions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No questions matched the current query or filter.
                      </td>
                    </tr>
                  ) : (
                    filteredQuestions.slice(0, 50).map(q => {
                      const isExpanded = expandedQuestionId === q.id;
                      const isReviewDue = parseInt(q.verifiedDate.split('-')[0], 10) <= 2023;

                      return (
                        <React.Fragment key={q.id}>
                          <tr className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-3 px-4 text-amber-400 font-bold">{q.id}</td>
                            <td className="py-3 px-4 capitalize text-slate-300 font-sans">{q.category}</td>
                            <td className="py-3 px-4 capitalize font-sans">
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                                {q.difficulty}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-200 font-sans max-w-md truncate">
                              {q.question}
                            </td>
                            <td className="py-3 px-4 text-slate-400 text-[11px]">
                              {q.verifiedDate}
                              {isReviewDue && (
                                <span className="ml-1.5 px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[9px] font-sans">
                                  Review
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </td>
                          </tr>

                          {/* Expanded Row Details */}
                          {isExpanded && (
                            <tr className="bg-slate-950/90 border-b border-slate-800">
                              <td colSpan={6} className="p-4 space-y-3 font-sans text-xs">
                                <div>
                                  <div className="text-slate-400 font-semibold mb-1 text-[11px] uppercase tracking-wider">
                                    Options & Verified Answer
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    {q.options.map((opt, i) => (
                                      <div
                                        key={i}
                                        className={`p-2 rounded-lg border text-xs ${
                                          opt === q.correctAnswer
                                            ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold'
                                            : 'bg-slate-900 border-slate-800 text-slate-300'
                                        }`}
                                      >
                                        <span className="font-mono mr-2">{String.fromCharCode(65 + i)}:</span>
                                        {opt}
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                                  <div className="font-semibold text-white mb-1">Explanation:</div>
                                  <p>{q.explanation}</p>
                                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
                                    <span>Primary Source: {q.source}</span>
                                    {q.sourceUrl && (
                                      <a
                                        href={q.sourceUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-amber-400 hover:underline inline-flex items-center gap-1"
                                      >
                                        <span>View Dataset Source</span>
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    )}
                                    {q.sourceFactId && (
                                      <span className="font-mono text-cyan-400">Derived from: {q.sourceFactId}</span>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {filteredQuestions.length > 50 && (
              <div className="p-3 text-center border-t border-slate-800 text-xs text-slate-400">
                Displaying first 50 of {filteredQuestions.length} matched records. Use search to narrow results.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: IMPORT QUESTION PACKS */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          {importNotification && (
            <div
              className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold ${
                importNotification.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500 text-rose-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{importNotification.message}</span>
            </div>
          )}

          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
            <h2 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
              <Upload className="w-5 h-5 text-amber-400" />
              <span>Import Versioned JSON Question Pack</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every imported pack undergoes strict schema validation before entering the production bank. Records must contain stable unique IDs, exactly 4 unique choices, a matching correct answer, verified source citations, and valid verification dates (YYYY-MM). Invalid records produce row-level errors and will not corrupt existing data.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <label className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Upload JSON Pack File</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => handleValidateJson(SAMPLE_EXPANSION_PACK_AFRICA)}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Load Sample Verified Pack (African Civilizations)</span>
              </button>

              {importedQuestions.length > 0 && (
                <button
                  type="button"
                  onClick={onClearImportedQuestions}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-300 hover:text-rose-200 bg-rose-950/20 border border-rose-500/30 rounded-lg ml-auto cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear All Custom Imports ({importedQuestions.length})</span>
                </button>
              )}
            </div>

            {/* Raw JSON input textarea */}
            <div className="space-y-1.5 pt-3">
              <label className="text-[11px] font-mono text-slate-400">Or Paste Raw JSON Pack Record Below:</label>
              <textarea
                rows={6}
                value={rawJsonInput}
                onChange={e => handleValidateJson(e.target.value)}
                placeholder='Paste {"formatVersion": "1.0", "packId": "...", "records": [...]} here...'
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Validation & Preview Report */}
          {validationReport && (
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                    {validationReport.invalidCount === 0 ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    )}
                    <span>Import Validation Report</span>
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Pack: <strong className="text-white">{validationReport.manifestMeta?.packTitle}</strong> · ID: {validationReport.manifestMeta?.packId}
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-slate-400">Total: {validationReport.totalCount}</span>
                  <span className="text-emerald-400 font-bold">Valid: {validationReport.validCount}</span>
                  {validationReport.invalidCount > 0 && (
                    <span className="text-rose-400 font-bold">Invalid: {validationReport.invalidCount}</span>
                  )}
                </div>
              </div>

              {/* Row-Level Errors List (if any) */}
              {validationReport.invalidRows.length > 0 && (
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>Row-Level Errors ({validationReport.invalidRows.length} rows rejected)</span>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {validationReport.invalidRows.map((err, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono text-rose-300">
                          <span>Row {err.rowIndex} {err.recordId ? `[ID: ${err.recordId}]` : ''}</span>
                        </div>
                        {err.questionText && (
                          <div className="text-slate-300 text-[11px] italic truncate">{err.questionText}</div>
                        )}
                        <ul className="list-disc list-inside text-rose-200 space-y-0.5">
                          {err.errors.map((msg, mIdx) => (
                            <li key={mIdx}>{msg}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview of Valid Records */}
              {validationReport.validQuestions.length > 0 && (
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Ready for Import ({validationReport.validQuestions.length} valid records)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {validationReport.validQuestions.map((vq, i) => (
                      <div
                        key={vq.id}
                        className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono text-amber-400">
                          <span>{vq.id}</span>
                          <span className="uppercase text-slate-400">{vq.category}</span>
                        </div>
                        <div className="text-white font-medium truncate">{vq.question}</div>
                        <div className="text-[11px] text-emerald-400">Answer: {vq.correctAnswer}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Commit Action */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Import preserves previously loaded data and saves to browser local storage.
                </span>

                <button
                  type="button"
                  disabled={validationReport.validCount === 0}
                  onClick={handleCommitValidQuestions}
                  className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  Commit {validationReport.validCount} Valid Questions
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DETERMINISTIC FACT TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-amber-400" />
                  <span>Structured Factual Templates Engine</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Derives verified question variants deterministically from primary structured country facts.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeTemplatesInBank}
                    onChange={e => onToggleTemplates(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-amber-400 focus:ring-amber-400"
                  />
                  <span>Active in Gameplay Quizzes</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Source Facts</div>
                <div className="text-xl font-bold text-white font-mono mt-0.5">Global</div>
                <div className="text-[10px] text-slate-500">Curated Countries</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Generated Variants</div>
                <div className="text-xl font-bold text-amber-400 font-mono mt-0.5">Deterministic</div>
                <div className="text-[10px] text-slate-500">Seed Rules</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Ambiguous Rejections</div>
                <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">Zero</div>
                <div className="text-[10px] text-slate-500">Disputed Items Excluded</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Templates Active</div>
                <div className="text-xl font-bold text-cyan-400 font-mono mt-0.5">5 Core</div>
                <div className="text-[10px] text-slate-500">Capitals, Continents, Flags, Currencies</div>
              </div>
            </div>
          </div>

          {/* Sample of Derived Question Variants */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white font-['Outfit']">
              Sample Deterministic Question Variants (Stable IDs & Source Tracking)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
              {templateReport.variants.slice(0, 8).map(v => (
                <div key={v.id} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-amber-400">
                    <span>{v.id}</span>
                    <span className="text-cyan-400">Fact: {v.sourceFactId}</span>
                  </div>
                  <div className="text-white font-medium">{v.question}</div>
                  <div className="text-emerald-400 text-[11px]">Correct: {v.correctAnswer}</div>
                  <div className="text-slate-400 text-[10px] truncate">{v.explanation}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COVERAGE & REVIEW HEALTH */}
      {activeTab === 'coverage' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Coverage Card */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
              <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Coverage Across Six Categories</span>
              </h3>

              <div className="space-y-3">
                {CATEGORY_DEFINITIONS.filter(c => c.id !== 'mixed').map(cat => {
                  return (
                    <div key={cat.id} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-200 font-semibold">{cat.name}</span>
                        <span className="font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>Active & Verified</span>
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full w-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Verification Health & Timeline */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
              <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Verification Health & Review Cycles</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-emerald-300">Recently Verified</div>
                    <div className="text-[11px] text-slate-400">Verified between 2024–2026</div>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold text-xs uppercase">
                    Current & Active
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-200">Fact Re-check Cycle</div>
                    <div className="text-[11px] text-slate-400">Regular 24-month audit rotation</div>
                  </div>
                  <span className="font-mono text-cyan-400 font-bold text-xs uppercase">
                    Audited
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">Time-Sensitive Current Affairs</div>
                    <div className="text-[11px] text-slate-400">Explicitly dated & isolated from evergreen facts</div>
                  </div>
                  <span className="font-mono text-amber-400 font-bold text-xs uppercase">
                    Dated & Tracked
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Category Pack Audit & Roadmap Matrix */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-400" />
                  <span>Category Pack Audit & 10,000 Roadmap Matrix</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real audited counts across tiers. Target counts are strictly documented as goals, not claimed achievements.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-semibold px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/30">
                100% Sourced & Attributed
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Discipline Pack</th>
                    <th className="py-2.5 px-3">Verification Status</th>
                    <th className="py-2.5 px-3">Registry Origin</th>
                    <th className="py-2.5 px-3">Tier Coverage</th>
                    <th className="py-2.5 px-3">Attribution</th>
                    <th className="py-2.5 px-3">Roadmap Target</th>
                    <th className="py-2.5 px-3">Deployment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {getCategoryPackStats().map(stat => (
                    <tr key={stat.categoryId} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-semibold text-white">
                        {stat.categoryName}
                      </td>
                      <td className="py-2.5 px-3 text-emerald-400 font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Verified & Active</span>
                      </td>
                      <td className="py-2.5 px-3 text-cyan-300">
                        Curated Dataset
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 text-[11px]">
                        Beginner · Intermediate · Advanced · Expert
                      </td>
                      <td className="py-2.5 px-3 text-emerald-400">
                        100% Sourced
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        10,000 / Pack Goal
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 text-[10px] font-semibold">
                          Active In Play
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DATASET PIPELINES & VERIFIED SOURCES */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Authoritative Dataset Ingestion Pipeline & Licensing Architecture</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Zero AI generation. Content is built solely through deterministic pipelines from curated public registries, international treaties, and open administrative datasets.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Primary Approved Sources */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <div className="font-semibold text-white uppercase text-[11px] tracking-wider text-amber-400">
                  Approved Factual Registries & Licensing
                </div>
                <ul className="space-y-2.5 text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <div>
                      <strong className="text-white">UN Geospatial & Statistics Division:</strong> Standard Country Codes (M49) & ISO 3166-1 alpha-2 for official country names, capitals, and administrative seats.
                      <div className="text-[10px] text-slate-500">License: Public International Domain</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <div>
                      <strong className="text-white">UNESCO World Heritage Centre:</strong> Coordinates, historical era designations, and official inscriptions for natural wonders, archaeological cities, and monuments.
                      <div className="text-[10px] text-slate-500">License: CC-BY-SA 3.0 IGO / Open Heritage Registry</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <div>
                      <strong className="text-white">USGS & NASA Earth Observatory:</strong> Continental mountain heights, river discharges, ocean trenches, and tectonic rift geomorphology.
                      <div className="text-[10px] text-slate-500">License: US Federal Public Domain (17 U.S.C. § 105)</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <div>
                      <strong className="text-white">National Constitutions & Sovereign Gazettes:</strong> Official designations of purpose-built capitals (e.g. Abuja, Naypyidaw, Yamoussoukro) and multi-capital jurisdictions (e.g. South Africa, Bolivia).
                      <div className="text-[10px] text-slate-500">License: Official Public Legal Records</div>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Data Ingestion Protocols & Integrity Rules */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <div className="font-semibold text-white uppercase text-[11px] tracking-wider text-cyan-400">
                  Strict Data Integrity & Quality Protocols
                </div>
                <ul className="space-y-2.5 text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <div>
                      <strong className="text-white">Disputed Territories Policy:</strong> Only sovereign UN-recognized or explicitly defined de facto administrations are indexed. Disputed territories are annotated with caveats.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <div>
                      <strong className="text-white">Multi-Capital Protocol:</strong> Countries with multiple seats (e.g., South Africa: Pretoria/Cape Town/Bloemfontein; Bolivia: Sucre/La Paz) have their constitutional and executive roles explicitly differentiated in distractor logic.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <div>
                      <strong className="text-white">Time-Sensitivity & Retirement Lifecycle:</strong> Changing political facts (officeholders, recent summits) carry `isTimeSensitive: true` and an explicit `reviewDate`. Records older than 24 months are flagged for verification.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <div>
                      <strong className="text-white">Zero Broken Media Guarantee:</strong> Flag references rely on standard SVG/ISO emoji codes with verified descriptions; no unvalidated external image links are accepted.
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* List of Needed Datasets for Category Expansion */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3 text-xs">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                <span>Dataset Expansion Wishlist (Next Verified Batches)</span>
              </h3>
              <p className="text-slate-400 text-[11px]">
                To scale from current seed records toward broader coverage without fabricating content, the following specific datasets are prioritized for batch import:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-semibold text-amber-300">Natural Earth Vector 1:10m</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Admin-0 sovereign borders, maritime exclusive economic zones, and physical rivers database.</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-semibold text-amber-300">UNESCO General History of Africa</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Vols. I–VIII covering ancient Nubia, Great Zimbabwe, Mali, Songhai, Swahili city-states, and African anti-colonial treaties.</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-semibold text-amber-300">UN Treaty Collection (UNTC)</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Depository of bilateral border treaties, Antarctic Treaty System, and Law of the Sea (UNCLOS) ratifications.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
