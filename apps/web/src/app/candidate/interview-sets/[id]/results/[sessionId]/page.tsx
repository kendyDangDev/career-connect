'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ScoreSummary from '@/components/candidate/interview-sets/ScoreSummary';
import AnswerReview from '@/components/candidate/interview-sets/AnswerReview';
import { ArrowLeft, Loader2, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function PracticeResultsPage() {
  const params = useParams();
  const router = useRouter();
  
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.sessionId) return;
    
    const fetchResults = async () => {
      try {
        // This endpoint should return the PracticeSession with its answers
        const res = await fetch(`/api/interview/practice-sessions/${params.sessionId}`);
        const data = await res.json();
        
        if (data.success && data.data) {
          setSessionData(data.data);
        } else {
          // If no session data or API not ready, create dummy data for view testing
          createDummyData();
        }
      } catch (err) {
        console.error(err);
        createDummyData();
      } finally {
        setLoading(false);
      }
    };
    
    const createDummyData = () => {
      setSessionData({
        id: params.sessionId,
        overallScore: 7.5,
        startedAt: new Date(Date.now() - 15 * 60000).toISOString(), // 15 mins ago
        completedAt: new Date().toISOString(),
        overallFeedback: 'Thực hiện khá tốt. Bạn có kiến thức cơ bản vững vàng, cần cải thiện thêm khả năng lấy ví dụ thực tế.',
        answers: [
          {
            id: 'a1',
            question: {
              question: 'Bạn hãy giới thiệu bản thân và kinh nghiệm làm việc liên quan đến vị trí Frontend Developer?'
            },
            answer: 'Em đã làm Frontend được 2 năm, chủ yếu dùng ReactJS và Next.js. Có kinh nghiệm với TailwindCSS.',
            score: 7,
            feedback: 'Câu trả lời đi đúng trọng tâm nhưng hơi ngắn. Hãy mở rộng thêm về các project đã làm.',
            strengths: ['Đề cập được các công nghệ cốt lõi', 'Ngắn gọn'],
            weaknesses: ['Thiếu dẫn chứng dự án', 'Chưa nêu được điểm mạnh cá nhân'],
            sampleAnswer: 'Chào anh/chị, em là [Tên], đã có 2 năm kinh nghiệm ở vị trí Frontend Developer. Trong các dự án trước đây, em chuyên sử dụng hệ sinh thái ReactJS và Next.js kết hợp với TailwindCSS để xây dựng các ứng dụng web tối ưu hiệu suất và thân thiện với SEO. Một dự án tiêu biểu em từng tham gia là...'
          },
          {
            id: 'a2',
            question: {
              question: 'Bạn sẽ làm gì nếu API phía Backend bị chậm và ảnh hưởng đến trải nghiệm người dùng?'
            },
            answer: 'Em sẽ thêm loading spinner và báo cho backend để họ fix. Hoặc dùng cache.',
            score: 8,
            feedback: 'Giải pháp hợp lý và thực tế. Có thể đề cập thêm đến SWR hoặc React Query để cache tốt hơn.',
            strengths: ['Đưa ra được solution ngay', 'Tư duy xử lý nhanh'],
            weaknesses: ['Chưa đi sâu vào kỹ thuật cache'],
            sampleAnswer: 'Trước mắt để đảm bảo UX, em sẽ implement các Skeleton Loading hoặc Spinner để người dùng biết hệ thống đang xử lý. Tiếp theo, em sẽ áp dụng các thư viện như SWR hoặc React Query để cache dữ liệu, giảm số lượng request. Sau đó em sẽ phối hợp ngay với team Backend để xem xét việc optimize query hoặc thêm Redis cache từ phía server.'
          }
        ]
      });
    };
    
    fetchResults();
  }, [params.sessionId]);

  if (loading) {
    return (
      <div className="bg-slate-50 dark:bg-[#191022] min-h-screen pt-24 pb-20 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="bg-slate-50 dark:bg-[#191022] min-h-screen pt-24 pb-20 flex flex-col items-center justify-center text-slate-800 dark:text-white">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy kết quả</h2>
        <Link href={`/candidate/interview-sets/${params.id}`} className="text-purple-600 hover:underline">
          Quay lại bộ câu hỏi
        </Link>
      </div>
    );
  }

  const durationSecs = sessionData.startedAt && sessionData.completedAt 
    ? Math.floor((new Date(sessionData.completedAt).getTime() - new Date(sessionData.startedAt).getTime()) / 1000)
    : 900; // 15 mins default

  return (
    <div className="bg-slate-50 dark:bg-[#191022] min-h-screen text-slate-900 dark:text-slate-100 font-sans pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Header Options */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <Link 
            href={`/candidate/interview-sets/${params.id}`} 
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Chi tiết bộ câu hỏi
          </Link>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push(`/candidate/interview-sets/${params.id}/practice`)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-600 text-slate-700 dark:text-slate-200 hover:text-purple-600 rounded-xl transition-all text-sm font-bold shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Luyện tập lại
            </button>
            <button 
              onClick={() => router.push('/candidate/interview-sets')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all text-sm font-bold shadow-lg shadow-purple-500/20"
            >
              <Home className="w-4 h-4" />
              Về danh sách
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-8">Kết quả luyện tập</h1>
        
        {/* Abstract Score */}
        <div className="mb-10">
          <ScoreSummary 
            score={sessionData.overallScore || 0}
            totalQuestions={sessionData.answers?.length || 0}
            duration={durationSecs}
            strengths={['Giao tiếp tốt', 'Đúng trọng tâm']}
            improvements={['Cần chi tiết hơn']}
          />
        </div>

        {/* Detail Reviews */}
        <h2 className="text-xl font-bold mb-6 flex items-center">
          Chi tiết từng câu hỏi
          <span className="ml-3 text-sm font-medium text-slate-500 bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full">
            {sessionData.answers?.length || 0} câu
          </span>
        </h2>
        
        <div className="space-y-4">
          {sessionData.answers?.map((ans: any, idx: number) => (
            <AnswerReview 
              key={ans.id}
              index={idx}
              question={ans.question?.question || 'Câu hỏi ?'}
              userAnswer={ans.answer}
              score={ans.score}
              feedback={ans.feedback}
              sampleAnswer={ans.sampleAnswer}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
