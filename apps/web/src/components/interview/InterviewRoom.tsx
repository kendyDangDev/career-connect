'use client';

import { useEffect, useCallback } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { Mic, MicOff, Square, Loader2, Volume2, Send, PhoneOff } from 'lucide-react';

interface InterviewRoomProps {
  phase: 'starting' | 'ai_speaking' | 'user_recording' | 'processing' | 'generating_feedback';
  currentQuestion: string;
  questionNumber: number;
  conversationHistory: { role: 'ai' | 'user'; content: string }[];
  error: string | null;
  isLoading: boolean;
  onSubmitAnswer: (audioBlob: Blob) => Promise<void>;
  onEndInterview: () => Promise<void>;
}

export default function InterviewRoom({
  phase,
  currentQuestion,
  questionNumber,
  conversationHistory,
  error,
  isLoading,
  onSubmitAnswer,
  onEndInterview,
}: InterviewRoomProps) {
  const {
    isRecording,
    recordingDuration,
    audioBlob,
    startRecording,
    stopRecording,
    resetRecording,
    error: recorderError,
  } = useAudioRecorder();

  // Auto-submit when recording is stopped and blob is ready
  const handleSubmit = useCallback(async () => {
    if (audioBlob) {
      await onSubmitAnswer(audioBlob);
      resetRecording();
    }
  }, [audioBlob, onSubmitAnswer, resetRecording]);

  // Submit automatically after recording stops
  useEffect(() => {
    if (audioBlob && phase === 'user_recording') {
      handleSubmit();
    }
  }, [audioBlob, phase, handleSubmit]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      {/* ─── Status Bar ───────────────────────────────────────── */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className={`h-3 w-3 rounded-full ${
              phase === 'ai_speaking'
                ? 'animate-pulse bg-blue-500'
                : phase === 'user_recording'
                  ? 'animate-pulse bg-red-500'
                  : phase === 'processing' || phase === 'generating_feedback'
                    ? 'animate-pulse bg-amber-500'
                    : 'bg-green-500'
            }`}
          />
          <span className="text-sm font-medium text-slate-700">
            {phase === 'starting' && 'Đang khởi tạo phỏng vấn...'}
            {phase === 'ai_speaking' && 'AI đang đặt câu hỏi...'}
            {phase === 'user_recording' && (isRecording ? 'Đang ghi âm...' : 'Sẵn sàng ghi âm')}
            {phase === 'processing' && 'Đang xử lý câu trả lời...'}
            {phase === 'generating_feedback' && 'Đang tổng hợp đánh giá...'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Câu hỏi #{questionNumber}
          </span>
          <button
            onClick={onEndInterview}
            disabled={isLoading || phase === 'generating_feedback'}
            className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
          >
            <PhoneOff size={14} />
            Kết thúc
          </button>
        </div>
      </div>

      {/* ─── Conversation Area ────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-6" style={{ minHeight: '400px', maxHeight: '500px', overflowY: 'auto' }}>
          {conversationHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  msg.role === 'ai'
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 text-slate-800'
                    : 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white'
                }`}
              >
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider opacity-60">
                  {msg.role === 'ai' ? '🤖 AI Interviewer' : '🎤 Bạn'}
                </div>
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {(phase === 'processing' || phase === 'generating_feedback' || phase === 'starting') && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3">
                <Loader2 size={16} className="animate-spin text-blue-500" />
                <span className="text-sm text-slate-500">
                  {phase === 'generating_feedback'
                    ? 'Đang tổng hợp đánh giá...'
                    : phase === 'starting'
                      ? 'Đang chuẩn bị câu hỏi...'
                      : 'Đang xử lý...'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Recording Controls ───────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center gap-4">
          {/* Waveform / Voice Indicator */}
          {isRecording && (
            <div className="flex items-center gap-1">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 animate-pulse rounded-full bg-red-400"
                  style={{
                    height: `${Math.random() * 24 + 8}px`,
                    animationDelay: `${i * 0.05}s`,
                    animationDuration: `${0.5 + Math.random() * 0.5}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Timer */}
          {isRecording && (
            <div className="font-mono text-2xl font-bold text-red-500">
              {formatDuration(recordingDuration)}
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-4">
            {phase === 'user_recording' && !isRecording && (
              <button
                onClick={startRecording}
                disabled={isLoading}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-pink-500 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-50"
              >
                <Mic size={28} />
              </button>
            )}

            {isRecording && (
              <button
                onClick={stopRecording}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
              >
                <Square size={24} />
              </button>
            )}

            {phase === 'ai_speaking' && (
              <div className="flex items-center gap-2 text-blue-500">
                <Volume2 size={24} className="animate-pulse" />
                <span className="text-sm font-medium">AI đang nói...</span>
              </div>
            )}

            {(phase === 'processing' || phase === 'starting') && (
              <div className="flex items-center gap-2 text-amber-500">
                <Loader2 size={24} className="animate-spin" />
                <span className="text-sm font-medium">Đang xử lý...</span>
              </div>
            )}
          </div>

          {/* Instructions */}
          {phase === 'user_recording' && !isRecording && (
            <p className="text-center text-xs text-slate-400">
              Nhấn nút micro để bắt đầu trả lời. Nhấn nút vuông để dừng ghi âm và gửi.
            </p>
          )}

          {/* Error */}
          {(error || recorderError) && (
            <div className="w-full rounded-lg bg-red-50 px-4 py-2 text-center text-sm text-red-600">
              {error || recorderError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
