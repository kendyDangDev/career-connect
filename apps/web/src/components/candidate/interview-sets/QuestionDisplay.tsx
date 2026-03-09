import React from 'react';
import { Target, List } from 'lucide-react';

interface QuestionDisplayProps {
  question: string;
  category: string;
  difficulty: string;
  currentIndex: number;
  total: number;
}

export default function QuestionDisplay({ 
  question, category, difficulty, currentIndex, total 
}: QuestionDisplayProps) {
  const isEasy = difficulty === 'EASY';
  const isMedium = difficulty === 'MEDIUM';

  const diffColor = isEasy 
    ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20'
    : isMedium 
      ? 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20'
      : 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-bold text-sm w-10 h-10 rounded-full">
            {currentIndex + 1}/{total}
          </span>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Câu hỏi phỏng vấn
          </h2>
        </div>
        <div className="flex gap-2 items-center text-xs font-bold">
          <span className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-lg">
            <List className="w-3.5 h-3.5" />
            {category}
          </span>
          <span className={`flex items-center gap-1 px-3 py-1 rounded-lg ${diffColor}`}>
            <Target className="w-3.5 h-3.5" />
            {difficulty}
          </span>
        </div>
      </div>
      
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-800">
        <p className="text-lg text-slate-900 dark:text-slate-100 leading-relaxed font-medium">
          {question}
        </p>
      </div>
    </div>
  );
}
