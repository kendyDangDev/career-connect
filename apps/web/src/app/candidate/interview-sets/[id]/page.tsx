'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, BrainCircuit, Play, Clock, 
  Target, AlertCircle, FileText, CheckCircle2,
  ChevronDown, ChevronUp
} from 'lucide-react';
import Link from 'next/link';

export default function QuestionSetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    
    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/interview-sets/${params.id}`);
        const result = await res.json();
        if (result.success && result.data) {
          setData(result.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetail();
  }, [params.id]);

  if (loading) {
    return (
      <div className="bg-slate-50 dark:bg-[#191022] min-h-screen text-slate-900 dark:text-slate-100 font-sans pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-slate-50 dark:bg-[#191022] min-h-screen text-slate-900 dark:text-slate-100 font-sans pt-20 flex flex-col items-center justify-center">
        <AlertCircle className="w-16 h-16 text-slate-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Không tìm thấy bộ câu hỏi</h2>
        <button 
          onClick={() => router.push('/candidate/interview-sets')}
          className="text-purple-600 hover:underline"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const handleStartPractice = async () => {
    // Navigate to practice room
    router.push(`/candidate/interview-sets/${params.id}/practice`);
  };

  return (
    <div className="bg-slate-50 dark:bg-[#191022] min-h-screen text-slate-900 dark:text-slate-100 font-sans pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <Link 
          href="/candidate/interview-sets" 
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-purple-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách
        </Link>
        
        {/* Header Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                  <BrainCircuit className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                    {data.title}
                  </h1>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6">
                <div className="flex items-center">
                  <Target className="w-4 h-4 mr-1.5" />
                  Độ khó: <span className="font-semibold text-slate-700 dark:text-slate-300 ml-1">{data.difficulty}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-1.5" />
                  {data.totalQuestions} câu hỏi
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1.5" />
                  ~{data.estimatedDuration} phút
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 min-w-[200px]">
              <button 
                onClick={handleStartPractice}
                className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-purple-500/20"
              >
                <Play className="w-5 h-5 mr-2 fill-current" />
                Bắt đầu luyện tập
              </button>
              {data.status === 'GENERATING' && (
                <p className="text-xs text-center font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 py-2 rounded-lg">
                  Đang tạo thêm câu hỏi...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Questions List */}
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <CheckCircle2 className="w-6 h-6 mr-2 text-purple-600" />
          Danh sách câu hỏi 
          <span className="ml-2 text-sm font-medium text-slate-500 bg-slate-200 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
            {data.questions?.length || 0}
          </span>
        </h2>
        
        <div className="space-y-4">
          {data.questions?.map((q: any, index: number) => {
            const isExpanded = expandedId === q.id;
            return (
              <div 
                key={q.id} 
                className={`bg-white dark:bg-slate-900 border rounded-xl overflow-hidden transition-all duration-200 ${
                  isExpanded ? 'border-purple-300 dark:border-purple-700 shadow-md ring-1 ring-purple-100 dark:ring-purple-900/50' : 'border-slate-200 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-800/50'
                }`}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="w-full text-left px-6 py-4 flex items-start gap-4 focus:outline-none"
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-sm shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-slate-100">{q.question}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs font-medium">
                      <span className="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded">
                        {q.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded ${
                        q.difficulty === 'EASY' ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20' :
                        q.difficulty === 'MEDIUM' ? 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20' :
                        'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
                      }`}>
                        {q.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-slate-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="px-6 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Gợi ý trả lời:</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
                      {q.sampleAnswer || 'Chưa có gợi ý nào cho câu hỏi này.'}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
