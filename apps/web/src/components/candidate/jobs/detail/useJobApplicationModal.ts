'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

interface CandidateCvOption {
  id: string;
  cvName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  isPrimary: boolean;
  updatedAt: string;
}

interface CandidateCvListResponse {
  success: boolean;
  data?: {
    cvs?: CandidateCvOption[];
  };
}

interface CandidateUserResponse {
  data?: {
    email?: string;
    phone?: string | null;
  };
}

interface ActionResult {
  success: boolean;
  message: string;
}

interface UseJobApplicationModalParams {
  enabled: boolean;
  jobId: string;
  userId: string | null;
}

const ACCEPTED_CV_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_CV_SIZE_MB = 10;
const MIN_COVER_LETTER_LENGTH = 50;

function parseActionErrorMessage(
  payload: unknown,
  fallbackMessage: string = 'Something went wrong. Please try again.'
): string {
  if (!payload || typeof payload !== 'object') {
    return fallbackMessage;
  }

  const safePayload = payload as Record<string, unknown>;

  if (typeof safePayload.error === 'string') {
    return safePayload.error;
  }

  if (typeof safePayload.message === 'string') {
    return safePayload.message;
  }

  const details = safePayload.details as
    | {
        fieldErrors?: Record<string, string[]>;
      }
    | undefined;

  const coverLetterError = details?.fieldErrors?.coverLetter?.[0];
  if (coverLetterError) {
    return coverLetterError;
  }

  const cvError = details?.fieldErrors?.cvFileUrl?.[0];
  if (cvError) {
    return cvError;
  }

  return fallbackMessage;
}

export function useJobApplicationModal({ enabled, jobId, userId }: UseJobApplicationModalParams) {
  const [cvs, setCvs] = useState<CandidateCvOption[]>([]);
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePhone, setCandidatePhone] = useState<string | null>(null);
  const [selectedCvId, setSelectedCvId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  const [isLoadingInitialData, setIsLoadingInitialData] = useState(false);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedCv = useMemo(() => {
    if (!selectedCvId) return null;
    return cvs.find((cv) => cv.id === selectedCvId) ?? null;
  }, [cvs, selectedCvId]);

  const loadInitialData = useCallback(async () => {
    if (!enabled || !userId) return;

    setIsLoadingInitialData(true);
    setErrorMessage(null);

    try {
      const [cvResponse, userResponse] = await Promise.all([
        fetch('/api/candidate/cv?limit=5&sortBy=uploadedAt&sortOrder=desc'),
        fetch(`/api/users/${userId}`),
      ]);

      if (!cvResponse.ok) {
        throw new Error('Cannot load your CV list.');
      }

      const cvPayload = (await cvResponse.json()) as CandidateCvListResponse;
      const cvList = cvPayload.data?.cvs ?? [];
      setCvs(cvList);
      setSelectedCvId((previousSelectedId) => {
        if (previousSelectedId && cvList.some((cv) => cv.id === previousSelectedId)) {
          return previousSelectedId;
        }
        const primaryCv = cvList.find((cv) => cv.isPrimary);
        return primaryCv?.id ?? cvList[0]?.id ?? '';
      });

      if (userResponse.ok) {
        const userPayload = (await userResponse.json()) as CandidateUserResponse;
        setCandidateEmail(userPayload.data?.email ?? '');
        setCandidatePhone(userPayload.data?.phone ?? null);
      }
    } catch (error) {
      console.error('Failed to load application modal data:', error);
      setErrorMessage('Cannot load your profile and CV data. Please refresh and try again.');
    } finally {
      setIsLoadingInitialData(false);
    }
  }, [enabled, userId]);

  useEffect(() => {
    if (!enabled) return;
    void loadInitialData();
  }, [enabled, loadInitialData]);

  const uploadNewCv = useCallback(
    async (file: File): Promise<ActionResult> => {
      if (!ACCEPTED_CV_TYPES.includes(file.type)) {
        const message = 'Only PDF, DOC, DOCX files are supported.';
        setErrorMessage(message);
        return { success: false, message };
      }

      if (file.size > MAX_CV_SIZE_MB * 1024 * 1024) {
        const message = `CV size must be less than ${MAX_CV_SIZE_MB}MB.`;
        setErrorMessage(message);
        return { success: false, message };
      }

      setIsUploadingCv(true);
      setErrorMessage(null);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('cvName', file.name.replace(/\.[^/.]+$/, '').trim() || 'My Resume');

        const response = await fetch('/api/candidate/cv', {
          method: 'POST',
          body: formData,
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          const message = parseActionErrorMessage(payload, 'Failed to upload new CV.');
          setErrorMessage(message);
          return { success: false, message };
        }

        const uploadedCvId =
          typeof payload?.data?.cv?.id === 'string' ? (payload.data.cv.id as string) : null;

        await loadInitialData();

        if (uploadedCvId) {
          setSelectedCvId(uploadedCvId);
        }

        return { success: true, message: 'New CV uploaded successfully.' };
      } catch (error) {
        console.error('Failed to upload CV:', error);
        const message = 'Failed to upload CV. Please try again.';
        setErrorMessage(message);
        return { success: false, message };
      } finally {
        setIsUploadingCv(false);
      }
    },
    [loadInitialData]
  );

  const enhanceCoverLetter = useCallback(
    (candidateName: string, companyName: string, jobTitle: string) => {
      setCoverLetter((currentValue) => {
        const trimmedValue = currentValue.trim();
        if (trimmedValue.length > 0) {
          return `${trimmedValue}\n\nI am excited about this role and would love the opportunity to discuss how I can contribute to ${companyName}.`;
        }

        return `Dear Hiring Team at ${companyName},

I am ${candidateName || 'a candidate'} and I am excited to apply for the ${jobTitle} position. With relevant hands-on experience and a strong growth mindset, I am confident I can contribute value to your team from day one.

I am particularly interested in this opportunity because it aligns with my technical strengths and long-term career goals. I would love to discuss how my background can support your team's objectives.

Thank you for your time and consideration.`;
      });
    },
    []
  );

  const submitApplication = useCallback(async (): Promise<ActionResult> => {
    if (!selectedCv) {
      const message = 'Please select a CV before submitting.';
      setErrorMessage(message);
      return { success: false, message };
    }

    if (coverLetter.trim().length < MIN_COVER_LETTER_LENGTH) {
      const message = `Cover letter must be at least ${MIN_COVER_LETTER_LENGTH} characters.`;
      setErrorMessage(message);
      return { success: false, message };
    }

    setIsSubmittingApplication(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/applications/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          coverLetter: coverLetter.trim(),
          cvFileUrl: selectedCv.fileUrl,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message = parseActionErrorMessage(payload, 'Failed to submit your application.');
        setErrorMessage(message);
        return { success: false, message };
      }

      setCoverLetter('');
      return { success: true, message: 'Application submitted successfully.' };
    } catch (error) {
      console.error('Failed to submit application:', error);
      const message = 'Failed to submit application. Please try again.';
      setErrorMessage(message);
      return { success: false, message };
    } finally {
      setIsSubmittingApplication(false);
    }
  }, [coverLetter, jobId, selectedCv]);

  return {
    coverLetter,
    candidateEmail,
    candidatePhone,
    cvs,
    errorMessage,
    isLoadingInitialData,
    isSubmittingApplication,
    isUploadingCv,
    selectedCv,
    selectedCvId,
    setCoverLetter,
    setErrorMessage,
    setSelectedCvId,
    enhanceCoverLetter,
    submitApplication,
    uploadNewCv,
  };
}
