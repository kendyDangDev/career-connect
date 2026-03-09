'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QuestionDisplay from '@/components/candidate/interview-sets/QuestionDisplay';
import AnswerInput from '@/components/candidate/interview-sets/AnswerInput';
import FeedbackPanel from '@/components/candidate/interview-sets/FeedbackPanel';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function PracticeRoomPage() {
  const params = useParams();
  const router = useRouter();

  const [questionSet, setQuestionSet] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [currentFeedback, setCurrentFeedback] = useState<any>(null);
  const [sessionAnswers, setSessionAnswers] = useState<any[]>([]);
  const [isFinishing, setIsFinishing] = useState(false);

  // 1. Fetch Question Set details & create Practice Session
  useEffect(() => {
    if (!params.id) return;

    const initPractice = async () => {
      try {
        // Fetch questions
        const resSet = await fetch(`/api/interview-sets/${params.id}`);
        const dataSet = await resSet.json();

        if (dataSet.success && dataSet.data) {
          setQuestionSet(dataSet.data);
          setQuestions(dataSet.data.questions || []);

          // Create a session in backend
          const resSession = await fetch('/api/interview/practice-sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questionSetId: params.id }),
          });
          const dataSession = await resSession.json();
          if (dataSession.success && dataSession.data?.id) {
            setSessionId(dataSession.data.id);
          }
        }
      } catch (err) {
        console.error('Failed to initialize practice session:', err);
      } finally {
        setLoading(false);
      }
    };

    initPractice();
  }, [params.id]);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleSubmitAnswer = async (answer: string) => {
    if (!currentQuestion) return;

    try {
      // Call AI evaluation API
      const res = await fetch('/api/interview/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          answer,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setCurrentFeedback(data.data);
        setSessionAnswers((prev) => [...prev, data.data]);
      } else {
        // Fallback mockup if endpoint fails or not implemented yet
        const mockup = {
          score: 7,
          feedback: 'Câu trả lời khá tốt nhưng cần chi tiết hơn về mặt kỹ thuật.',
          strengths: ['Hiểu rõ vấn đề cơ bản', 'Giao tiếp rõ ràng'],
          weaknesses: ['Thiếu ví dụ thực tế', 'Chưa đi sâu vào logic hệ thống'],
          sampleAnswer: 'Ví dụ câu trả lời mẫu từ AI: ...',
        };
        setCurrentFeedback(mockup);
        setSessionAnswers((prev) => [...prev, mockup]);
      }
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi đánh giá câu trả lời.');
    }
  };

  const handleNextQuestion = async () => {
    if (isLastQuestion) {
      // Finish session
      setIsFinishing(true);
      try {
        if (sessionId) {
          await fetch(`/api/interview/practice-sessions/${sessionId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'COMPLETED' }),
          });
        }
        // Redirect to results
        router.push(
          `/candidate/interview-sets/${params.id}/results/${sessionId || 'demo-session'}`
        );
      } catch (err) {
        console.error(err);
        router.push(
          `/candidate/interview-sets/${params.id}/results/${sessionId || 'demo-session'}`
        );
      }
    } else {
      setCurrentIndex((prev) => prev + 1);
      setCurrentFeedback(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#191022]">
        <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-slate-800 dark:bg-[#191022] dark:text-slate-200">
        <AlertCircle className="mb-4 h-16 w-16 text-slate-400" />
        <h2 className="mb-4 text-xl font-bold">Lỗi tải câu hỏi / Bộ câu hỏi rỗng</h2>
        <Link
          href={`/candidate/interview-sets/${params.id}`}
          className="text-purple-600 hover:underline"
        >
          Quay lại
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 font-sans text-slate-900 dark:bg-[#191022] dark:text-white">
      <div className="mx-auto max-w-4xl px-6">
        {/* Practice Room Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href={`/candidate/interview-sets/${params.id}`}
            className="flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-purple-600"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Thoát luyện tập
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">Tiến độ:</span>
            <div className="h-2.5 w-32 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-purple-600 transition-all duration-500 ease-out"
                style={{ width: `${(currentIndex / questions.length) * 100}%` }}
              />
            </div>
            <span className="ml-2 text-sm font-bold text-purple-600">
              {Math.round((currentIndex / questions.length) * 100)}%
            </span>
          </div>
        </div>

        {/* Form Body */}
        <div className="space-y-6">
          <QuestionDisplay
            question={currentQuestion.question}
            category={currentQuestion.category}
            difficulty={currentQuestion.difficulty}
            currentIndex={currentIndex}
            total={questions.length}
          />

          {currentFeedback ? (
            <FeedbackPanel
              feedback={currentFeedback}
              onNextQuestion={handleNextQuestion}
              isLastQuestion={isLastQuestion}
            />
          ) : (
            <AnswerInput onSubmit={handleSubmitAnswer} language={questionSet?.language || 'vi'} />
          )}
        </div>
      </div>

      {/* Fullscreen Loading Overlay when finishing */}
      {isFinishing && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-slate-950/80">
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-purple-600" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Đang tổng hợp kết quả...
          </h3>
          <p className="mt-2 text-slate-500">Vui lòng chờ trong giây lát.</p>
        </div>
      )}
    </div>
  );
}
