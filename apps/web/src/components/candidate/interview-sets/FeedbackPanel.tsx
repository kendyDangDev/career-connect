import React from 'react';
import { Star, ThumbsUp, ThumbsDown, Lightbulb, ChevronRight } from 'lucide-react';

interface FeedbackProps {
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  sampleAnswer: string;
}

interface FeedbackPanelProps {
  feedback: FeedbackProps;
  onNextQuestion: () => void;
  isLastQuestion: boolean;
}

export default function FeedbackPanel({ feedback, onNextQuestion, isLastQuestion }: FeedbackPanelProps) {
  // Score color mapping
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
    if (score >= 5) return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
    return 'text-red-500 bg-red-50 dark:bg-red-900/20';
  };

  const getScoreRingColor = (score: number) => {
    if (score >= 8) return 'text-emerald-500';
    if (score >= 5) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          Nhận xét từ AI
        </h3>
        
        <div className={`px-4 py-1.5 rounded-full flex items-center justify-center font-bold text-lg border-2 border-current ${getScoreColor(feedback.score)}`}>
          {feedback.score}<span className="text-sm font-medium ml-1 opacity-70">/10</span>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        <div>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            {feedback.feedback}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedback.strengths?.length > 0 && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
              <h4 className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-400 mb-3">
                <ThumbsUp className="w-4 h-4" />
                Điểm tốt
              </h4>
              <ul className="space-y-2">
                {feedback.strengths.map((str, idx) => (
                  <li key={idx} className="text-emerald-700 dark:text-emerald-300/80 text-sm flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    {str}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {feedback.weaknesses?.length > 0 && (
            <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
              <h4 className="flex items-center gap-2 font-bold text-red-800 dark:text-red-400 mb-3">
                <ThumbsDown className="w-4 h-4" />
                Cần cải thiện
              </h4>
              <ul className="space-y-2">
                {feedback.weaknesses.map((weak, idx) => (
                  <li key={idx} className="text-red-700 dark:text-red-300/80 text-sm flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                    {weak}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {feedback.sampleAnswer && (
          <div className="p-5 rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/10">
            <h4 className="flex items-center gap-2 font-bold text-blue-800 dark:text-blue-400 mb-3">
              <Lightbulb className="w-4 h-4" />
              Câu trả lời gợi ý
            </h4>
            <p className="text-blue-900 dark:text-blue-300 text-sm leading-relaxed whitespace-pre-wrap">
              {feedback.sampleAnswer}
            </p>
          </div>
        )}
        
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onNextQuestion}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white font-bold rounded-xl transition-all"
          >
            {isLastQuestion ? 'Hoàn thành & Xem kết quả' : 'Câu hỏi tiếp theo'}
            {!isLastQuestion && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
