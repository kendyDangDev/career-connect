'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BrainCircuit, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import CVUploader from '@/components/candidate/interview-sets/CVUploader';
import JDInput from '@/components/candidate/interview-sets/JDInput';
import DifficultySelector from '@/components/candidate/interview-sets/DifficultySelector';

export default function CreateInterviewSetPage() {
  const router = useRouter();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState('');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [totalQuestions, setTotalQuestions] = useState(15);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = cvFile && jdText.trim().length > 50 && !isGenerating;

  const handleGenerate = async () => {
    if (!canSubmit) return;
    setIsGenerating(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('cvFile', cvFile);
      formData.append('jdText', jdText);
      formData.append('difficulty', difficulty);
      formData.append('totalQuestions', totalQuestions.toString());

      const res = await fetch('/api/interview-sets/generate', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to generate questions');
      }

      router.push(`/candidate/interview-sets/${data.data.id}`);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="bg-slate-50 dark:bg-[#191022] min-h-screen text-slate-900 dark:text-slate-100 font-sans pt-20">
        <div className="max-w-2xl mx-auto px-6 py-20 flex flex-col items-center gap-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center animate-pulse">
              <BrainCircuit className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <Sparkles className="w-4 h-4 text-yellow-800" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black mb-2">AI đang tạo bộ câu hỏi...</h2>
            <p className="text-slate-500">
              Đang phân tích CV và JD để tạo {totalQuestions} câu hỏi phỏng vấn cá nhân hóa.
              <br />
              Quá trình này có thể mất 15-30 giây.
            </p>
          </div>
          <div className="w-full max-w-xs">
            <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-loading-bar" />
            </div>
          </div>
        </div>
        <style jsx>{`
          @keyframes loading-bar {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 95%; }
          }
          .animate-loading-bar {
            animation: loading-bar 20s ease-in-out forwards;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-[#191022] min-h-screen text-slate-900 dark:text-slate-100 font-sans pt-20">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/candidate/interview-sets"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-purple-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách
          </Link>
          <h1 className="text-3xl font-black tracking-tight">Tạo bộ câu hỏi phỏng vấn</h1>
          <p className="text-slate-500 mt-1">
            Upload CV và nhập JD để AI tạo bộ câu hỏi cá nhân hóa cho bạn.
          </p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-8">
          {/* Step 1: CV Upload */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 text-xs font-black flex items-center justify-center">1</span>
              <h2 className="font-bold text-lg">Upload CV của bạn</h2>
            </div>
            <CVUploader onFileSelect={setCvFile} selectedFile={cvFile} />
          </section>

          {/* Step 2: JD Input */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 text-xs font-black flex items-center justify-center">2</span>
              <h2 className="font-bold text-lg">Nhập mô tả công việc (JD)</h2>
            </div>
            <JDInput value={jdText} onChange={setJdText} />
          </section>

          {/* Step 3: Difficulty */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 text-xs font-black flex items-center justify-center">3</span>
              <h2 className="font-bold text-lg">Chọn mức độ khó</h2>
            </div>
            <DifficultySelector value={difficulty} onChange={setDifficulty} />
          </section>

          {/* Step 4: Number of questions */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 text-xs font-black flex items-center justify-center">4</span>
              <h2 className="font-bold text-lg">Số lượng câu hỏi</h2>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={5}
                max={30}
                step={1}
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(parseInt(e.target.value))}
                className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-purple-600"
              />
              <span className="w-16 text-center py-2 px-3 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-black rounded-lg text-sm">
                {totalQuestions}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Thời gian ước tính: ~{totalQuestions * 3} phút
            </p>
          </section>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleGenerate}
            disabled={!canSubmit}
            className={`
              w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all
              ${canSubmit
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transform hover:-translate-y-0.5'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            <BrainCircuit className="w-5 h-5" />
            Tạo bộ câu hỏi với AI
          </button>
        </div>
      </div>
    </div>
  );
}
