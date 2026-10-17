import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar, NavTab } from './components/common/Navbar';
import { HomeView } from './components/views/HomeView';
import { PlaySetupView } from './components/views/PlaySetupView';
import { ActiveGameView } from './components/views/ActiveGameView';
import { GameResultsView } from './components/views/GameResultsView';
import { CategoriesView } from './components/views/CategoriesView';
import { DailyChallengeView } from './components/views/DailyChallengeView';
import { ProgressView } from './components/views/ProgressView';
import { AchievementsView } from './components/views/AchievementsView';
import { SettingsView } from './components/views/SettingsView';
import { QuestionBankStudioView } from './components/views/QuestionBankStudioView';
import { TestSuiteModal } from './components/modals/TestSuiteModal';
import {
  CategoryId,
  GameConfig,
  GameSessionResult,
  PlayerProgress,
  Question,
} from './types';
import {
  loadCustomQuestions,
  loadIncludeTemplatesPreference,
  loadPlayerProgress,
  recordSessionCompletion,
  resetPlayerProgress,
  saveCustomQuestions,
  saveIncludeTemplatesPreference,
  savePlayerProgress,
} from './utils/storage';
import { getFilteredQuestions, MASTER_QUESTIONS, SEED_QUESTIONS } from './data/questions';
import { getDailyChallengeQuestions } from './utils/daily';
import { shuffleArray } from './utils/shuffle';
import { Award, X } from 'lucide-react';

type AppView = NavTab | 'active_game' | 'game_results';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [progress, setProgress] = useState<PlayerProgress>(loadPlayerProgress);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [activeConfig, setActiveConfig] = useState<GameConfig | null>(null);
  const [lastSessionResult, setLastSessionResult] = useState<GameSessionResult | null>(null);
  const [isDailySession, setIsDailySession] = useState(false);
  const [testSuiteOpen, setTestSuiteOpen] = useState(false);
  const [customQuestions, setCustomQuestions] = useState<Question[]>(() => loadCustomQuestions());
  const [includeTemplates, setIncludeTemplates] = useState<boolean>(() => loadIncludeTemplatesPreference());
  const [achievementToast, setAchievementToast] = useState<string | null>(null);

  const [setupInitialCategory, setSetupInitialCategory] = useState<CategoryId>('mixed');

  // Synchronize progress on mount
  useEffect(() => {
    const loaded = loadPlayerProgress();
    setProgress(loaded);
  }, []);

  // Active full production pool combining compiled master packs and custom imported questions
  const combinedBank = useMemo(() => {
    return [
      ...MASTER_QUESTIONS,
      ...customQuestions,
    ];
  }, [customQuestions]);

  // Launch a game session
  const handleLaunchGame = useCallback(
    (config: GameConfig) => {
      let pool: Question[] = [];

      if (config.missedQuestionsOnly) {
        // Pool consists of questions currently in player's missed vault
        const missedIds = Object.keys(progress.missedQuestionIds);
        pool = combinedBank.filter(q => missedIds.includes(q.id));

        if (pool.length === 0) {
          pool = getFilteredQuestions(config.category, config.difficulty, combinedBank);
        }
      } else {
        pool = getFilteredQuestions(config.category, config.difficulty, combinedBank);
      }

      // Shuffle pool so questions appear in randomized order
      const shuffled = shuffleArray([...pool]);

      // Determine session size
      let sessionQuestions: Question[] = [];
      if (config.sessionLength === 'endless') {
        sessionQuestions = shuffled;
      } else {
        sessionQuestions = shuffled.slice(0, Math.min(config.sessionLength, shuffled.length));
      }

      if (sessionQuestions.length === 0) {
        // Fallback to all master questions if filter had 0 results
        sessionQuestions = shuffleArray([...MASTER_QUESTIONS]).slice(0, 10);
      }

      setActiveQuestions(sessionQuestions);
      setActiveConfig(config);
      setIsDailySession(false);
      setCurrentView('active_game');
    },
    [progress.missedQuestionIds, combinedBank]
  );

  // Launch Daily Challenge
  const handleStartDaily = useCallback(() => {
    const dailySet = getDailyChallengeQuestions();
    const dailyConfig: GameConfig = {
      category: 'mixed',
      difficulty: 'all',
      sessionLength: 10,
      timerMode: progress.settings.timerMode === 'relaxed' ? 'standard' : progress.settings.timerMode,
    };

    setActiveQuestions(dailySet);
    setActiveConfig(dailyConfig);
    setIsDailySession(true);
    setCurrentView('active_game');
  }, [progress.settings.timerMode]);

  // Session completion handler
  const handleFinishGame = useCallback(
    (result: GameSessionResult) => {
      const prevUnlocked = progress.achievementsUnlocked || {};
      const updated = recordSessionCompletion(progress, result);

      // Determine which achievements were unlocked specifically in this session
      const newlyUnlockedIds = Object.keys(updated.achievementsUnlocked).filter(
        id => !prevUnlocked[id]
      );

      if (newlyUnlockedIds.length > 0) {
        setAchievementToast(
          `Achievement Unlocked: ${newlyUnlockedIds.length} new accolade(s) earned!`
        );
        setTimeout(() => setAchievementToast(null), 5000);
      }

      setProgress(updated);
      setLastSessionResult(result);
      setCurrentView('game_results');
    },
    [progress]
  );

  // Handle Return Home
  const handleReturnHome = useCallback(() => {
    setCurrentView('home');
  }, []);

  // Settings handlers
  const handleUpdateSettings = (newSettings: PlayerProgress['settings']) => {
    const updated: PlayerProgress = {
      ...progress,
      settings: newSettings,
    };
    savePlayerProgress(updated);
    setProgress(updated);
  };

  const handleResetProgress = () => {
    const fresh = resetPlayerProgress();
    setProgress(fresh);
  };

  const handleImportProgress = (imported: PlayerProgress) => {
    setProgress(imported);
  };

  const handleImportCustomQuestions = (imported: Question[]) => {
    const merged = [...customQuestions, ...imported];
    setCustomQuestions(merged);
    saveCustomQuestions(merged);
  };

  const missedCount = Object.keys(progress.missedQuestionIds).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans']">
      {/* Top Navbar adhering to the strict Top Bar Contract */}
      {currentView !== 'active_game' && (
        <Navbar
          currentTab={(currentView === 'game_results' ? 'play' : currentView) as NavTab}
          onSelectTab={tab => setCurrentView(tab)}
          onQuickPlay={() => {
            handleLaunchGame({
              category: 'mixed',
              difficulty: 'all',
              sessionLength: 10,
              timerMode: progress.settings.timerMode,
            });
          }}
          rank={progress.rank}
          streak={progress.currentStreak}
        />
      )}

      {/* Achievement Banner Notification */}
      {achievementToast && (
        <div className="sticky top-16 z-50 max-w-md mx-auto my-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold text-xs shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 fill-current shrink-0" />
            <span>{achievementToast}</span>
          </div>
          <button
            onClick={() => setAchievementToast(null)}
            className="p-1 hover:opacity-80 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {currentView === 'home' && (
          <HomeView
            progress={progress}
            onStartGame={catId => {
              if (catId) {
                setSetupInitialCategory(catId);
              } else {
                setSetupInitialCategory('mixed');
              }
              setCurrentView('play');
            }}
            onOpenDaily={() => setCurrentView('daily')}
            onNavigateTab={tab => setCurrentView(tab)}
            totalQuestionsInBank={combinedBank.length}
          />
        )}

        {currentView === 'play' && (
          <PlaySetupView
            key={`setup_${setupInitialCategory}`}
            initialCategory={setupInitialCategory}
            missedQuestionCount={missedCount}
            onLaunchGame={config => handleLaunchGame(config)}
            onCancel={() => setCurrentView('home')}
          />
        )}

        {currentView === 'active_game' && activeConfig && (
          <ActiveGameView
            questions={activeQuestions}
            config={activeConfig}
            soundEnabled={progress.settings.sound}
            isDailyChallenge={isDailySession}
            onFinishGame={handleFinishGame}
            onQuitGame={() => setCurrentView('home')}
            onToggleSound={() =>
              handleUpdateSettings({
                ...progress.settings,
                sound: !progress.settings.sound,
              })
            }
          />
        )}

        {currentView === 'game_results' && lastSessionResult && (
          <GameResultsView
            result={lastSessionResult}
            soundEnabled={progress.settings.sound}
            onPlayAgain={() => {
              if (activeConfig) {
                handleLaunchGame(activeConfig);
              } else {
                setCurrentView('play');
              }
            }}
            onPracticeMissed={() => {
              handleLaunchGame({
                category: 'mixed',
                difficulty: 'all',
                sessionLength: 10,
                timerMode: progress.settings.timerMode,
                missedQuestionsOnly: true,
              });
            }}
            onReturnHome={handleReturnHome}
          />
        )}

        {currentView === 'categories' && (
          <CategoriesView
            progress={progress}
            onPlayCategory={catId => {
              setSetupInitialCategory(catId);
              setCurrentView('play');
            }}
            questionPool={combinedBank}
          />
        )}

        {currentView === 'daily' && (
          <DailyChallengeView
            progress={progress}
            onStartDaily={handleStartDaily}
          />
        )}

        {currentView === 'progress' && (
          <ProgressView
            progress={progress}
            onPracticeMissed={() => {
              handleLaunchGame({
                category: 'mixed',
                difficulty: 'all',
                sessionLength: 10,
                timerMode: progress.settings.timerMode,
                missedQuestionsOnly: true,
              });
            }}
            onNavigateTab={tab => setCurrentView(tab as any)}
          />
        )}

        {currentView === 'achievements' && (
          <AchievementsView progress={progress} />
        )}

        {currentView === 'bank' && (
          <QuestionBankStudioView
            seedQuestions={SEED_QUESTIONS}
            importedQuestions={customQuestions}
            includeTemplatesInBank={includeTemplates}
            onToggleTemplates={include => {
              setIncludeTemplates(include);
              saveIncludeTemplatesPreference(include);
            }}
            onCommitImportedQuestions={newQuestions => {
              const merged = [...customQuestions, ...newQuestions];
              setCustomQuestions(merged);
              saveCustomQuestions(merged);
            }}
            onClearImportedQuestions={() => {
              setCustomQuestions([]);
              saveCustomQuestions([]);
            }}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            progress={progress}
            onUpdateSettings={handleUpdateSettings}
            onResetProgress={handleResetProgress}
            onImportProgress={handleImportProgress}
            onImportQuestions={handleImportCustomQuestions}
            onOpenTestSuite={() => setTestSuiteOpen(true)}
          />
        )}
      </main>

      {/* Diagnostics & Test Suite Modal */}
      <TestSuiteModal
        isOpen={testSuiteOpen}
        onClose={() => setTestSuiteOpen(false)}
      />

      {/* Quiet Accessible Footer complying with Anti-Slop Guidelines */}
      {currentView !== 'active_game' && (
        <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="font-bold text-slate-400">GEOGRAFIST</span> · Know the World. Master the Facts.
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-500">
              <span>Curated Static Fact Repositories · Zero Hallucinations</span>
              <span aria-hidden="true">·</span>
              <button
                onClick={() => setCurrentView('bank')}
                className="hover:text-amber-400 transition-colors cursor-pointer"
              >
                Question Bank Studio
              </button>
              <span aria-hidden="true">·</span>
              <button
                onClick={() => setTestSuiteOpen(true)}
                className="hover:text-amber-400 transition-colors cursor-pointer"
              >
                Diagnostic Tests
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
