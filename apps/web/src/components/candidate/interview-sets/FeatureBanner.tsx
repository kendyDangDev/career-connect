import React from 'react';
import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';

export default function FeatureBanner() {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-800 p-8 shadow-xl shadow-purple-500/20">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <BrainCircuit className="h-32 w-32" />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="max-w-xl text-white">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-bold tracking-widest text-white uppercase">
              Premium Feature
            </span>
          </div>
          <h2 className="mb-2 text-2xl font-bold">AI-POWERED: Tạo bộ câu hỏi</h2>
          <p className="text-purple-100">
            Tự động tạo bộ câu hỏi phỏng vấn chuyên sâu dựa trên mô tả công việc chỉ trong vài giây.
            Tiết kiệm thời gian tuyện dụng tối đa.
          </p>
        </div>
        <Link
          href="/candidate/interview-sets/create"
          className="shrink-0 transform rounded-xl bg-white px-8 py-3 font-bold whitespace-nowrap text-purple-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-slate-50"
        >
          Tạo bộ câu hỏi ngay
        </Link>
      </div>
    </div>
  );
}
