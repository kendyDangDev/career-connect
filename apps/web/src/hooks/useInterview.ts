'use client';

import { useState, useCallback, useRef } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────
interface ConversationMessage {
  role: 'ai' | 'user';
  content: string;
}

interface FeedbackCategory {
  name: string;
  score: number;
  comment: string;
}

interface InterviewFeedback {
  overallScore: number;
  categories: FeedbackCategory[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  summary: string;
}

type InterviewPhase =
  | 'idle'
  | 'starting'
  | 'ai_speaking'
  | 'user_recording'
  | 'processing'
  | 'generating_feedback'
  | 'feedback';

interface UseInterviewReturn {
  phase: InterviewPhase;
  conversationHistory: ConversationMessage[];
  currentQuestion: string;
  questionNumber: number;
  feedback: InterviewFeedback | null;
  error: string | null;
  isLoading: boolean;
  startInterview: (jd: string, cv: string, lang?: string) => Promise<void>;
  submitAnswer: (audioBlob: Blob) => Promise<void>;
  endInterview: () => Promise<void>;
  setPhase: (phase: InterviewPhase) => void;
  resetInterview: () => void;
}

// ─── Hook ───────────────────────────────────────────────────────────────────
export function useInterview(): UseInterviewReturn {
  const [phase, setPhase] = useState<InterviewPhase>('idle');
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionNumber, setQuestionNumber] = useState(0);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Store context for the duration of the interview
  const contextRef = useRef<{ jd: string; cv: string; lang: string }>({
    jd: '',
    cv: '',
    lang: 'vi',
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /**
   * Play audio from base64 and resolve when finished.
   */
  const playAudio = useCallback((audioBase64: string, mimeType: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!audioBase64) {
        resolve();
        return;
      }

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(`data:${mimeType};base64,${audioBase64}`);
      audioRef.current = audio;

      audio.onended = () => {
        audioRef.current = null;
        resolve();
      };
      audio.onerror = () => {
        audioRef.current = null;
        reject(new Error('Audio playback failed'));
      };
      audio.play().catch(reject);
    });
  }, []);

  /**
   * Start a new interview session
   */
  const startInterview = useCallback(
    async (jd: string, cv: string, lang: string = 'vi') => {
      try {
        setError(null);
        setPhase('starting');
        setIsLoading(true);
        setFeedback(null);
        setConversationHistory([]);
        setQuestionNumber(0);

        contextRef.current = { jd, cv, lang };

        const res = await fetch('/api/interview/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobDescription: jd,
            candidateCV: cv,
            language: lang,
          }),
        });

        const json = await res.json();
        if (!json.success) {
          throw new Error(json.error || 'Failed to start interview');
        }

        const { firstQuestion, audioBase64, mimeType, conversationHistory: history } = json.data;

        setCurrentQuestion(firstQuestion);
        setConversationHistory(history);
        setQuestionNumber(1);
        setPhase('ai_speaking');
        setIsLoading(false);

        // Play AI question audio
        try {
          await playAudio(audioBase64, mimeType);
        } catch {
          // Audio playback failed — user can still read the question
        }

        setPhase('user_recording');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to start interview';
        setError(message);
        setPhase('idle');
        setIsLoading(false);
      }
    },
    [playAudio]
  );

  /**
   * Submit a recorded answer for processing
   */
  const submitAnswer = useCallback(
    async (audioBlob: Blob) => {
      try {
        setError(null);
        setPhase('processing');
        setIsLoading(true);

        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('conversationHistory', JSON.stringify(conversationHistory));
        formData.append('jobDescription', contextRef.current.jd);
        formData.append('candidateCV', contextRef.current.cv);
        formData.append('language', contextRef.current.lang);

        const res = await fetch('/api/interview/process', {
          method: 'POST',
          body: formData,
        });

        const json = await res.json();
        if (!json.success) {
          throw new Error(json.error || 'Failed to process answer');
        }

        const data = json.data;

        setConversationHistory(data.conversationHistory);

        if (data.shouldEnd) {
          // Interview has ended — generate feedback
          setIsLoading(false);
          await endInterviewWithHistory(data.conversationHistory);
          return;
        }

        setCurrentQuestion(data.nextQuestion);
        setQuestionNumber(data.questionNumber);
        setPhase('ai_speaking');
        setIsLoading(false);

        // Play AI next question audio
        try {
          await playAudio(data.audioBase64, data.mimeType);
        } catch {
          // Audio playback failed
        }

        setPhase('user_recording');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to process answer';
        setError(message);
        setPhase('user_recording'); // Allow retry
        setIsLoading(false);
      }
    },
    [conversationHistory, playAudio]
  );

  /**
   * End the interview and generate feedback (internal helper accepting history)
   */
  const endInterviewWithHistory = useCallback(
    async (history: ConversationMessage[]) => {
      try {
        setPhase('generating_feedback');
        setIsLoading(true);

        const res = await fetch('/api/interview/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationHistory: history,
            jobDescription: contextRef.current.jd,
            candidateCV: contextRef.current.cv,
            language: contextRef.current.lang,
          }),
        });

        const json = await res.json();
        if (!json.success) {
          throw new Error(json.error || 'Failed to generate feedback');
        }

        setFeedback(json.data);
        setPhase('feedback');
        setIsLoading(false);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to generate feedback';
        setError(message);
        setPhase('feedback');
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Manually end the interview and generate feedback
   */
  const endInterview = useCallback(async () => {
    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    await endInterviewWithHistory(conversationHistory);
  }, [conversationHistory, endInterviewWithHistory]);

  /**
   * Reset everything to start fresh
   */
  const resetInterview = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPhase('idle');
    setConversationHistory([]);
    setCurrentQuestion('');
    setQuestionNumber(0);
    setFeedback(null);
    setError(null);
    setIsLoading(false);
    contextRef.current = { jd: '', cv: '', lang: 'vi' };
  }, []);

  return {
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
    setPhase,
    resetInterview,
  };
}
