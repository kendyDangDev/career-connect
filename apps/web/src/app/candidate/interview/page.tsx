'use client';

import { useState } from 'react';
import { useInterview } from '@/hooks/useInterview';
import InterviewRoom from '@/components/interview/InterviewRoom';
import InterviewFeedback from '@/components/interview/InterviewFeedback';
import { Briefcase, FileText, Globe, Play, Loader2, Sparkles } from 'lucide-react';

export default function InterviewPage() {
  const {
    phase,
    conversationHistory,
    currentQuestion,
    questionNumber,
    feedback,
    error,
    isLoading,
    startInterview,
    submitAnswer,
    endInterview,
    resetInterview,
  } = useInterview();

  const [jobDescription, setJobDescription] = useState('');
  const [candidateCV, setCandidateCV] = useState('');
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');

  const handleStart = async () => {
    if (!jobDescription.trim() || !candidateCV.trim()) return;
    await startInterview(jobDescription, candidateCV, language);
  };

  // ─── Idle Phase: Setup Form ─────────────────────────────────────────
  if (phase === 'idle') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <Sparkles size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">AI Mock Interview</h1>
          <p className="mt-2 text-slate-500">
            Luyện tập phỏng vấn với AI — nhận phản hồi chi tiết và điểm số ngay lập tức
          </p>
        </div>

        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {/* Job Description */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Briefcase size={16} className="text-blue-500" />
              Mô tả công việc (JD)
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Dán nội dung Job Description tại đây..."
              rows={6}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder-slate-400 transition-colors focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Candidate CV */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FileText size={16} className="text-emerald-500" />
              CV / Hồ sơ ứng viên
            </label>
            <textarea
              value={candidateCV}
              onChange={(e) => setCandidateCV(e.target.value)}
              placeholder="Dán nội dung CV hoặc tóm tắt profile tại đây..."
              rows={6}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder-slate-400 transition-colors focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Language Select */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Globe size={16} className="text-purple-500" />
              Ngôn ngữ phỏng vấn
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setLanguage('vi')}
                className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
                  language === 'vi'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🇻🇳 Tiếng Việt
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
                  language === 'en'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🇺🇸 English
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>
          )}

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={!jobDescription.trim() || !candidateCV.trim() || isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4 text-base font-semibold text-white shadow-lg transition-all hover:scale-[1.01] hover:shadow-xl active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Đang khởi tạo...
              </>
            ) : (
              <>
                <Play size={20} />
                Bắt đầu phỏng vấn
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ─── Feedback Phase ────────────────────────────────────────────────
  if (phase === 'feedback' && feedback) {
    return (
      <div className="px-4 py-10">
        <InterviewFeedback
          overallScore={feedback.overallScore}
          categories={feedback.categories}
          strengths={feedback.strengths}
          weaknesses={feedback.weaknesses}
          suggestions={feedback.suggestions}
          summary={feedback.summary}
          onTryAgain={resetInterview}
        />
      </div>
    );
  }

  // ─── Active Interview Phase ────────────────────────────────────────
  return (
    <div className="px-4 py-6">
      <InterviewRoom
        phase={phase as any}
        currentQuestion={currentQuestion}
        questionNumber={questionNumber}
        conversationHistory={conversationHistory}
        error={error}
        isLoading={isLoading}
        onSubmitAnswer={submitAnswer}
        onEndInterview={endInterview}
      />
    </div>
  );
}
