import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, Play, ShieldCheck, RefreshCw } from 'lucide-react';
import { runGeografistTestSuite, TestSuiteSummary } from '../../utils/tests';

interface TestSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestSuiteModal: React.FC<TestSuiteModalProps> = ({ isOpen, onClose }) => {
  const [testSummary, setTestSummary] = useState<TestSuiteSummary | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const executeTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const summary = runGeografistTestSuite();
      setTestSummary(summary);
      setIsRunning(false);
    }, 150);
  };

  useEffect(() => {
    if (isOpen) {
      executeTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-2xl w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Outfit']">
                System Diagnostics & Test Suite
              </h2>
              <p className="text-xs text-slate-400">
                Automated deterministic unit tests for validation, scoring, and storage.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Strip */}
        {testSummary && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-white">Status:</span>
              {testSummary.failed === 0 ? (
                <span className="text-emerald-400 font-bold inline-flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-4 h-4" /> ALL {testSummary.total} TESTS PASSING
                </span>
              ) : (
                <span className="text-rose-400 font-bold inline-flex items-center gap-1 font-mono">
                  <XCircle className="w-4 h-4" /> {testSummary.failed} TEST(S) FAILED
                </span>
              )}
            </div>
            <button
              onClick={executeTests}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors font-medium cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>Rerun</span>
            </button>
          </div>
        )}

        {/* Test List */}
        <div className="space-y-3">
          {testSummary?.results.map(test => (
            <div
              key={test.id}
              className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                test.passed
                  ? 'bg-slate-900/60 border-slate-800'
                  : 'bg-rose-950/20 border-rose-500/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-white">
                  {test.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{test.name}</span>
                </div>
                <span className="font-mono text-slate-500 text-[10px]">
                  {test.durationMs}ms
                </span>
              </div>
              <p className="text-slate-300 pl-6 leading-relaxed">
                {test.message}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
