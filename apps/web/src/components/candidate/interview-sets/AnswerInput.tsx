import React, { useState, useRef, useCallback } from 'react';
import { Send, Loader2, Mic, MicOff, Square } from 'lucide-react';

interface AnswerInputProps {
  onSubmit: (answer: string) => Promise<void>;
  disabled?: boolean;
  language?: string;
}

type RecordingState = 'idle' | 'recording' | 'transcribing';

export default function AnswerInput({ onSubmit, disabled, language = 'vi' }: AnswerInputProps) {
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    setRecordingError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordingState('transcribing');

        try {
          const formData = new FormData();
          formData.append('audio', blob, 'recording.webm');
          formData.append('language', language);

          const res = await fetch('/api/interview/transcribe', {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();

          if (data.success && data.data?.transcript) {
            setAnswer((prev) =>
              prev.trim() ? `${prev.trim()} ${data.data.transcript}` : data.data.transcript
            );
          } else {
            setRecordingError(data.message || 'Không thể nhận dạng giọng nói. Vui lòng thử lại.');
          }
        } catch {
          setRecordingError('Lỗi kết nối khi xử lý giọng nói. Vui lòng thử lại.');
        } finally {
          setRecordingState('idle');
        }
      };

      recorder.start(250);
      setRecordingState('recording');
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') {
        setRecordingError(
          'Quyền truy cập microphone bị từ chối. Vui lòng cho phép trong cài đặt trình duyệt.'
        );
      } else {
        setRecordingError('Không thể khởi động microphone. Vui lòng kiểm tra thiết bị.');
      }
      setRecordingState('idle');
    }
  }, [language]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
  }, []);

  const handleSubmit = async () => {
    if (!answer.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit(answer);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRecording = recordingState === 'recording';
  const isTranscribing = recordingState === 'transcribing';
  const isBusy = disabled || isSubmitting || isTranscribing;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Câu trả lời của bạn</h3>
        {/* Voice input button */}
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isBusy}
          title={isRecording ? 'Dừng ghi âm' : 'Trả lời bằng giọng nói'}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
            isRecording
              ? 'animate-pulse bg-red-500 text-white hover:bg-red-600'
              : 'bg-slate-100 text-slate-700 hover:bg-purple-100 hover:text-purple-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-purple-900/40 dark:hover:text-purple-300'
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {isTranscribing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang xử lý...
            </>
          ) : isRecording ? (
            <>
              <Square className="h-4 w-4 fill-current" />
              Dừng ghi âm
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              Ghi âm
            </>
          )}
        </button>
      </div>

      {/* Recording indicator */}
      {isRecording && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>
          Đang ghi âm... Nhấn &quot;Dừng ghi âm&quot; khi nói xong.
        </div>
      )}

      {/* Error message */}
      {recordingError && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
          <MicOff className="mt-0.5 h-4 w-4 shrink-0" />
          {recordingError}
        </div>
      )}

      <textarea
        className="h-40 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-900 transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500/50 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-600"
        placeholder='Gõ câu trả lời hoặc nhấn "Ghi âm" để trả lời bằng giọng nói...'
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={isBusy || isRecording}
      />

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">{answer.length} ký tự</span>
        <button
          onClick={handleSubmit}
          disabled={!answer.trim() || isBusy || isRecording}
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 font-bold text-white transition-all hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-800"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang gửi...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Gửi chấm điểm
            </>
          )}
        </button>
      </div>
    </div>
  );
}
