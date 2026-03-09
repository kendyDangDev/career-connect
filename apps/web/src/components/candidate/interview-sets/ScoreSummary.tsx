import React from 'react';
import { Target, Trophy, Clock, BrainCircuit } from 'lucide-react';

interface ScoreSummaryProps {
  score: number;
  totalQuestions: number;
  duration: number; // in seconds
  strengths: string[];
  improvements: string[];
}

export default function ScoreSummary({ score, totalQuestions, duration, strengths, improvements }: ScoreSummaryProps) {
  // Format duration
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const timeString = `${minutes}p ${seconds > 0 ? `${seconds}s` : ''}`;

  const getScoreColor = (s: number) => {
    if (s >= 8) return 'text-emerald-500 from-emerald-500/20 to-emerald-50';
    if (s >= 5) return 'text-orange-500 from-orange-500/20 to-orange-50';
    return 'text-red-500 from-red-500/20 to-red-50';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
      <div className="p-8 md:p-10 flex flex-col md:flex-row gap-10 items-center justify-between">
        
        {/* Score Circle */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <div className={`relative w-40 h-40 rounded-full flex items-center justify-center bg-gradient-to-b ${getScoreColor(score)} dark:from-slate-800 dark:to-slate-900 border-[8px] border-white dark:border-slate-800 shadow-xl z-10`}>
            <div className="absolute inset-0 rounded-full border-4 border-white/20 dark:border-slate-700/50 m-2"></div>
            <div className="text-center">
              <span className={`text-5xl font-black ${getScoreColor(score).split(' ')[0]}`}>{score.toFixed(1)}</span>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">/ 10</p>
            </div>
          </div>
          <h3 className="text-xl font-bold mt-4 text-slate-800 dark:text-white">Điểm tổng quan</h3>
        </div>

        {/* Stats Grid */}
        <div className="flex-1 w-full grid grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Số câu hỏi</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{totalQuestions} câu</p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Thời gian làm bài</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{timeString}</p>
            </div>
          </div>
          
          <div className="col-span-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
             <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Nhận xét chung</p>
                  <p className="text-base font-medium text-slate-800 dark:text-slate-200">
                    {score >= 8 ? 'Xuất sắc! Bạn nắm rất vững kiến thức và kỹ năng cần thiết.' : 
                     score >= 5 ? 'Khá tốt! Tuy nhiên vẫn còn một số điểm cần ôn tập thêm.' : 
                     'Chưa đạt yêu cầu! Hãy xem lại các nhận xét chi tiết bên dưới để cải thiện.'}
                  </p>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
