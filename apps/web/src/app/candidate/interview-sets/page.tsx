'use client';

import React, { useEffect, useState, useCallback } from 'react';
import PageHeader from '@/components/candidate/interview-sets/PageHeader';
import FeatureBanner from '@/components/candidate/interview-sets/FeatureBanner';
import FilterSection from '@/components/candidate/interview-sets/FilterSection';
import QuestionSetCard from '@/components/candidate/interview-sets/QuestionSetCard';
import RightSidebar from '@/components/candidate/interview-sets/RightSidebar';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function InterviewSetsPage() {
  const [questionSets, setQuestionSets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [status, setStatus] = useState('');

  const fetchSets = useCallback(async (q: string, diff: string, st: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: '1', limit: '10' });
      if (q) params.set('search', q);
      if (diff) params.set('difficulty', diff);
      if (st) params.set('status', st);
      const res = await fetch(`/api/interview-sets?${params}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setQuestionSets(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch question sets', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSets('', '', '');
  }, [fetchSets]);

  const handleSearch = (q: string) => {
    setSearch(q);
    fetchSets(q, difficulty, status);
  };

  const handleDifficultyChange = (val: string) => {
    setDifficulty(val);
    fetchSets(search, val, status);
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    fetchSets(search, difficulty, val);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 font-sans text-slate-900 dark:bg-[#191022] dark:text-slate-100">
      <div className="flex items-start">
        {/* Main Content Area */}
        <main className="min-w-0 flex-1">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8">
            <PageHeader />

            <FeatureBanner />

            <FilterSection
              onSearch={handleSearch}
              difficulty={difficulty}
              onDifficultyChange={handleDifficultyChange}
              status={status}
              onStatusChange={handleStatusChange}
            />

            {/* Job Listing Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : questionSets.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {questionSets.map((set) => (
                  <QuestionSetCard key={set.id} {...set} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-2 text-xl font-bold">Chưa có bộ câu hỏi nào</h3>
                <p className="mx-auto mb-6 max-w-md text-slate-500">
                  Upload CV và nhập mô tả công việc để AI phân tích và tạo cho bạn một bộ câu hỏi
                  phỏng vấn sát với thực tế nhất.
                </p>
                <Link
                  href="/candidate/interview-sets/create"
                  className="inline-flex items-center rounded-xl bg-purple-600 px-6 py-3 font-bold text-white transition-colors hover:bg-purple-700"
                >
                  Tạo bộ câu hỏi ngay
                </Link>
              </div>
            )}
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
