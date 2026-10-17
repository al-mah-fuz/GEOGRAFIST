import React from 'react';
import { Play, ArrowRight, Layers, CheckCircle } from 'lucide-react';
import { CategoryId, PlayerProgress, Question } from '../../types';
import { CATEGORY_DEFINITIONS, MASTER_QUESTIONS } from '../../data/questions';

interface CategoriesViewProps {
  progress: PlayerProgress;
  onPlayCategory: (categoryId: CategoryId) => void;
  questionPool?: Question[];
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  progress,
  onPlayCategory,
  questionPool = MASTER_QUESTIONS,
}) => {
  return (
    <div className="space-y-8 pb-16">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
          Game Categories
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Explore specialized knowledge domains or challenge yourself with the complete world mixture.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CATEGORY_DEFINITIONS.map(cat => {
          const stats = progress.categoryStats[cat.id] || { answered: 0, correct: 0 };
          const accuracy =
            stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0;

          return (
            <div
              key={cat.id}
              className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 flex flex-col justify-between space-y-6 hover:border-slate-700 transition-all shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    {cat.tagline}
                  </span>
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Curated & Verified</span>
                  </span>
                </div>

                <h2 className="text-xl font-bold text-white font-['Outfit']">
                  {cat.name}
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              {/* Progress and Action */}
              <div className="space-y-4 pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>
                    Answered: <strong className="text-white">{stats.answered}</strong>
                  </span>
                  <span>
                    Accuracy: <strong className="text-emerald-400">{accuracy}%</strong>
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-300"
                    style={{ width: `${accuracy}%` }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => onPlayCategory(cat.id)}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play {cat.name}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
