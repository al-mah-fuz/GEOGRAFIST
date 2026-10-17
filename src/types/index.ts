/**
 * GEOGRAFIST — Core Type Definitions
 */

export type QuestionCategory = 'flags' | 'capitals' | 'history' | 'current_affairs' | 'explorer';

export type CategoryId = QuestionCategory | 'mixed';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type TimerMode = 'relaxed' | 'standard' | 'rapid';

export type SessionLength = 10 | 20 | 50 | 'endless';

export type PlayerRank =
  | 'Beginner'
  | 'Explorer'
  | 'Geographer'
  | 'Historian'
  | 'Scholar'
  | 'World Master';

export interface QuestionMedia {
  type: 'flag' | 'landmark' | 'map';
  countryCode?: string; // ISO 2-letter uppercase e.g. "JP", "ZA", "BR"
  flagEmoji?: string;
  label?: string;
}

export interface Question {
  id: string; // e.g. "GEO-FLG-001"
  category: QuestionCategory;
  topic: string; // e.g. "Nordic Flags", "West African Kingdoms"
  difficulty: Difficulty;
  question: string;
  options: [string, string, string, string]; // exactly 4 unique options
  correctAnswer: string; // must match one of options
  explanation: string;
  source: string; // verified source citation
  verifiedDate: string; // YYYY-MM
  media?: QuestionMedia;
  language?: string; // e.g. "en"
  sourceUrl?: string; // verified dataset URL or citation link
  license?: string; // e.g. "Public Domain", "CC-BY-4.0", "Open Government Licence"
  isTimeSensitive?: boolean; // distinguishes current affairs/transient from evergreen facts
  eventDate?: string; // YYYY or YYYY-MM for time-sensitive events
  reviewDate?: string; // YYYY-MM date when this fact should be re-verified or retired
  status?: 'verified' | 'under_review' | 'retired'; // workflow status: retired/under_review items kept out of scored play
  region?: string; // e.g. "Sub-Saharan Africa", "Southeast Asia", "Mediterranean"
  era?: string; // e.g. "Ancient", "Medieval", "Early Modern", "Contemporary"
  administrativeNotes?: string; // details on multiple seats of government, disputed territories, name variants
  tags?: string[];
  sourceFactId?: string; // for template-derived questions
  templateId?: string; // e.g. "tpl_country_to_capital"
}

export interface PackOption {
  id: string;
  text: string;
}

export interface QuestionPackRecord {
  id: string;
  category: 'flags' | 'capitals' | 'history' | 'current_affairs' | 'explorer';
  topic: string;
  difficulty: Difficulty;
  language?: string;
  question: string;
  options: (PackOption | string)[]; // array of either {id, text} or plain string
  correctOptionId?: string;
  correctAnswer: string;
  explanation: string;
  sourceTitle: string;
  sourceUrl?: string;
  verifiedDate: string;
  isTimeSensitive?: boolean;
  eventDate?: string;
  tags?: string[];
  media?: QuestionMedia;
  sourceFactId?: string;
  templateId?: string;
}

export interface QuestionPackManifest {
  formatVersion: '1.0' | '1.1';
  packId: string;
  packTitle: string;
  description: string;
  author: string;
  license: string;
  createdAt: string;
  records: QuestionPackRecord[];
}

export interface CountryFact {
  factId: string; // e.g. "FACT-GEO-JPN"
  countryName: string;
  iso2: string;
  capital: string;
  continent: 'Africa' | 'Asia' | 'Europe' | 'North America' | 'South America' | 'Oceania';
  currencyName: string;
  flagDescription: string;
  flagEmoji?: string;
  verifiedSource: string;
  verifiedDate: string;
}

export interface ExplorerFact {
  factId: string;
  name: string;
  type: 'mountain' | 'river' | 'ocean' | 'strait' | 'desert' | 'waterfall' | 'trench' | 'lake' | 'wonder';
  location: string;
  continent: 'Africa' | 'Asia' | 'Europe' | 'North America' | 'South America' | 'Oceania' | 'Antarctica' | 'Global';
  superlativeOrFeature: string;
  verifiedSource: string;
  verifiedDate: string;
}

export interface HistoryFact {
  factId: string;
  title: string;
  era: 'Ancient' | 'Classical' | 'Medieval' | 'Early Modern' | 'Modern' | 'Contemporary';
  region: 'Africa' | 'Asia' | 'Europe' | 'Americas' | 'Middle East' | 'Oceania' | 'Global';
  timePeriod: string;
  coreDescription: string;
  primaryKeyFact: string;
  verifiedSource: string;
  verifiedDate: string;
}

export interface CurrentAffairsFact {
  factId: string;
  topic: string;
  eventDate: string;
  organizationOrEvent: string;
  stableFactSummary: string;
  verifiedSource: string;
  verifiedDate: string;
  reviewDate: string;
}

export interface CategoryPack {
  categoryId: CategoryId;
  packTitle: string;
  version: string;
  uniqueFactsCount: number;
  questions: Question[];
  byDifficulty: Record<Difficulty, Question[]>;
  verifiedDate: string;
  license: string;
}

export interface CategoryPackStats {
  categoryId: CategoryId;
  categoryName: string;
  totalQuestions: number;
  uniqueUnderlyingFacts: number;
  byDifficulty: Record<Difficulty, number>;
  sourceCoveragePercent: number;
  verifiedDateRange: string;
  targetCount: number;
  reviewDueCount: number;
}

export interface AnswerRecord {
  questionId: string;
  questionText: string;
  category: CategoryId;
  selectedAnswer: string; // '__TIMEOUT__' | '__SKIPPED__' | user choice
  correctAnswer: string;
  isCorrect: boolean;
  isSkipped?: boolean;
  timeSpentSeconds: number;
  pointsEarned: number;
  explanation: string;
  source: string;
}

export interface CategoryBreakdownItem {
  total: number;
  correct: number;
  accuracy: number;
}

export interface GameSessionResult {
  id: string;
  date: string; // ISO string
  category: CategoryId;
  difficulty: Difficulty | 'all';
  totalQuestions: number;
  correctCount: number;
  skippedCount?: number;
  accuracy: number; // 0 to 100
  totalPoints: number;
  xpEarned: number;
  bestStreak: number;
  avgTimeSeconds: number;
  totalDurationSeconds?: number;
  isDailyChallenge?: boolean;
  isPracticeMissed?: boolean;
  categoryBreakdown?: Partial<Record<CategoryId, CategoryBreakdownItem>>;
  answers: AnswerRecord[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: CategoryId | 'general';
  icon: string;
  unlockedAt?: string; // ISO string if unlocked
  progress: number; // 0 to 100
  reqText: string;
}

export interface PersonalBests {
  highestScore: number;
  highestAccuracySessionScore: number; // score when accuracy was 100%
  longestStreak: number;
  fastestSessionSeconds: number; // shortest duration for completed >=10 question game
  bestDailyScore: number;
}

export interface PlayerProgress {
  version: number; // Schema version (currently 2)
  username: string;
  avatar: string;
  createdAt: string;
  xp: number;
  level: number;
  rank: PlayerRank;
  currentStreak: number;
  bestStreak: number;
  totalGames: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  totalSkipped: number;
  personalBests: PersonalBests;
  categoryStats: Record<CategoryId, { answered: number; correct: number }>;
  dailyCompleted: Record<string, {
    date: string; // YYYY-MM-DD
    score: number;
    total: number;
    accuracy: number;
    completedAt: string;
    bestScore?: number;
    attemptsCount?: number;
  }>;
  missedQuestionIds: Record<string, number>; // questionId -> failCount
  achievementsUnlocked: Record<string, string>; // achievementId -> unlockedAt ISO date
  recentSessions: GameSessionResult[];
  settings: {
    sound: boolean;
    timerMode: TimerMode;
    reducedMotion: boolean;
    haptics: boolean;
  };
}

export interface GameConfig {
  category: CategoryId;
  difficulty: Difficulty | 'all';
  sessionLength: SessionLength;
  timerMode: TimerMode;
  missedQuestionsOnly?: boolean;
}
