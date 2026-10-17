import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  BookOpen,
} from 'lucide-react';
import { PlayerProgress, TimerMode, Question } from '../../types';
import { exportProgressToJson, importProgressFromJson } from '../../utils/storage';
import { MASTER_QUESTIONS, validateQuestion } from '../../data/questions';

interface SettingsViewProps {
  progress: PlayerProgress;
  onUpdateSettings: (newSettings: PlayerProgress['settings']) => void;
  onResetProgress: () => void;
  onImportProgress: (imported: PlayerProgress) => void;
  onImportQuestions: (importedQuestions: Question[]) => void;
  onOpenTestSuite: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  progress,
  onUpdateSettings,
  onResetProgress,
  onImportProgress,
  onImportQuestions,
  onOpenTestSuite,
}) => {
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleToggleSound = () => {
    onUpdateSettings({
      ...progress.settings,
      sound: !progress.settings.sound,
    });
  };

  const handleTimerChange = (mode: TimerMode) => {
    onUpdateSettings({
      ...progress.settings,
      timerMode: mode,
    });
  };

  const handleToggleReducedMotion = () => {
    onUpdateSettings({
      ...progress.settings,
      reducedMotion: !progress.settings.reducedMotion,
    });
  };

  // Export Progress JSON
  const handleExportData = () => {
    const jsonStr = exportProgressToJson(progress);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `geografist_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Career data exported successfully.', 'success');
  };

  // Import Progress JSON
  const handleImportProgressFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      const res = importProgressFromJson(content);
      if (res.success && res.progress) {
        onImportProgress(res.progress);
        showNotification('Career profile restored successfully.', 'success');
      } else {
        showNotification(res.error || 'Failed to parse career file.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  // Import Custom Question Pack
  const handleImportQuestionsFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (!Array.isArray(parsed)) {
          showNotification('Question pack must be a JSON array of questions.', 'error');
          return;
        }

        const validQuestions: Question[] = [];
        for (const item of parsed) {
          const check = validateQuestion(item);
          if (check.valid) {
            validQuestions.push(item);
          }
        }

        if (validQuestions.length === 0) {
          showNotification('No valid questions matching schema found in file.', 'error');
          return;
        }

        onImportQuestions(validQuestions);
        showNotification(
          `Imported ${validQuestions.length} validated question(s) into current session.`,
          'success'
        );
      } catch (err) {
        showNotification('Invalid JSON question file.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      {/* Title */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
          Application Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Preferences, storage backup, diagnostics, and question architecture.
        </p>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold ${
            notification.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="p-1 hover:opacity-80 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Preferences Section */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-6">
        <h2 className="text-lg font-bold text-white font-['Outfit']">Gameplay Preferences</h2>

        {/* Audio Toggle */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="space-y-0.5">
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              {progress.settings.sound ? (
                <Volume2 className="w-4 h-4 text-amber-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
              <span>Sound Effects (Web Audio API Synthesizer)</span>
            </div>
            <div className="text-xs text-slate-400">
              Chimes and feedback synthesized in the browser without external network requests.
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleSound}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
              progress.settings.sound ? 'bg-amber-400 justify-end' : 'bg-slate-800 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-slate-950 shadow-md" />
          </button>
        </div>

        {/* Timer Default Mode */}
        <div className="space-y-3 pb-4 border-b border-slate-800/80">
          <div className="text-sm font-semibold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Default Timer Pacing</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'relaxed', label: 'Relaxed (No Timer)' },
                { id: 'standard', label: 'Standard (15s)' },
                { id: 'rapid', label: 'Rapid Fire (8s)' },
              ] as const
            ).map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleTimerChange(opt.id)}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  progress.settings.timerMode === opt.id
                    ? 'bg-amber-400/10 border-amber-400 text-amber-300'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reduced Motion Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-sm font-semibold text-white">Reduced Motion & Minimal Animations</div>
            <div className="text-xs text-slate-400">
              Suppresses confetti effects and micro-transitions for visual comfort.
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleReducedMotion}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
              progress.settings.reducedMotion ? 'bg-amber-400 justify-end' : 'bg-slate-800 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-slate-950 shadow-md" />
          </button>
        </div>
      </div>

      {/* Verified Question Bank Architecture */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div>
            <h2 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span>Curated Question Bank Architecture</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Strictly verified data with non-repetitive session isolation.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Active & Fact-Checked</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs text-center font-mono">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-slate-400 text-[10px] uppercase">Flags</div>
            <div className="text-xs font-semibold text-emerald-400 mt-1">Verified</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-slate-400 text-[10px] uppercase">Capitals</div>
            <div className="text-xs font-semibold text-emerald-400 mt-1">Verified</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-slate-400 text-[10px] uppercase">History</div>
            <div className="text-xs font-semibold text-emerald-400 mt-1">Verified</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-slate-400 text-[10px] uppercase">Current Affairs</div>
            <div className="text-xs font-semibold text-emerald-400 mt-1">Verified</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-slate-400 text-[10px] uppercase">Explorer</div>
            <div className="text-xs font-semibold text-emerald-400 mt-1">Verified</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={onOpenTestSuite}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 rounded-lg transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Run Automated Test Suite (12 Verification Tests)</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-slate-400" />
            <span>Import Custom Question Pack (JSON)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportQuestionsFile}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Backup & Persistence */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
        <h2 className="text-lg font-bold text-white font-['Outfit']">Career Data Management</h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Your career XP, daily challenges, and unlocked achievements are securely stored in browser LocalStorage. You can export a snapshot backup to transfer to another device.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Profile Backup (JSON)</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Restore Profile from JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportProgressFile}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={() => setResetModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-500/30 rounded-lg transition-colors cursor-pointer ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Reset Career Progress</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-md w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white font-['Outfit']">Reset Career Progress?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This action permanently clears your accumulated XP, current rank, streaks, recorded daily challenge history, and achievements from local storage. This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setResetModalOpen(false);
                  onResetProgress();
                  showNotification('Career progress has been reset to Beginner.', 'success');
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
