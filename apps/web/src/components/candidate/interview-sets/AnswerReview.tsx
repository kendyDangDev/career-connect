import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Star, CheckCircle2, MessageSquare, Lightbulb } from 'lucide-react';

interface AnswerReviewProps {
  index: number;
  question: string;
  userAnswer: string;
  score: number;
  feedback: string;
  sampleAnswer?: string;
}

export default function AnswerReview({
  index, question, userAnswer, score, feedback, sampleAnswer
}: AnswerReviewProps) {
  const [isExpanded, setIsExpanded] = useState(index === 0); // Open first one by default

  const getScoreColor = (s: number) => {
    if (s >= 8) return 'text-emerald-600 bg-emerald-50 ring-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20 dark:ring-emerald-800/50';
    if (s >= 5) return 'text-orange-600 bg-orange-50 ring-orange-200 dark:text-orange-400 dark:bg-orange-900/20 dark:ring-orange-800/50';
    return 'text-red-600 bg-red-50 ring-red-200 dark:text-red-400 dark:bg-red-900/20 dark:ring-red-800/50';
  };

  return (
    <div className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden transition-all duration-300 ${
      isExpanded 
        ? 'border-purple-300 dark:border-purple-700 shadow-md' 
        : 'border-slate-200 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-800/50'
    }`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 focus:outline-none"
      >
        <div className="flex flex-1 items-start gap-4">
          <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-sm">
            {index + 1}
          </span>
          <div className="text-left">
            <h4 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2">
              {question}
            </h4>
            {!isExpanded && (
              <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                {userAnswer || 'Chưa trả lời'}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4 ml-4">
          <div className={`px-3 py-1 font-bold text-sm rounded-lg ring-1 ${getScoreColor(score)}`}>
            {score}/10
          </div>
          <div className="text-slate-400">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="p-6 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-6 bg-slate-50/50 dark:bg-slate-900/30">
          
          {/* User Answer */}
          <div>
            <h5 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Câu trả lời của bạn:
            </h5>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
              {userAnswer ? (
                <p className="whitespace-pre-wrap">{userAnswer}</p>
              ) : (
                <p className="text-slate-400 italic">Ứng viên đã bỏ qua câu hỏi này.</p>
              )}
            </div>
          </div>

          {/* AI Feedback */}
          <div>
            <h5 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Star className="w-4 h-4 text-purple-600" />
              Nhận xét:
            </h5>
            <div className="bg-purple-50/50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30 text-purple-900 dark:text-purple-300">
              <p className="whitespace-pre-wrap leading-relaxed">{feedback}</p>
            </div>
          </div>

          {/* Sample Answer */}
          {sampleAnswer && (
            <div>
              <h5 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Gợi ý câu trả lời tốt:
              </h5>
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl text-slate-700 dark:text-slate-300">
                <p className="whitespace-pre-wrap leading-relaxed text-sm">{sampleAnswer}</p>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
