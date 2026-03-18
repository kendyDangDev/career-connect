'use client';

import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';
import {
  AlertCircle,
  FileText,
  Loader2,
  Mail,
  SendHorizontal,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { JobData } from './JobDetailPage';
import { useJobApplicationModal } from './useJobApplicationModal';

interface JobApplicationModalProps {
  open: boolean;
  onClose: () => void;
  job: Pick<JobData, 'id' | 'title' | 'company'>;
}

const MIN_COVER_LETTER_LENGTH = 50;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Updated today';
  if (diffDays === 1) return 'Updated 1 day ago';
  if (diffDays < 30) return `Updated ${diffDays} days ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return 'Updated 1 month ago';
  return `Updated ${diffMonths} months ago`;
}

function getFullName(firstName?: string | null, lastName?: string | null): string {
  return [firstName, lastName].filter(Boolean).join(' ').trim();
}

export default function JobApplicationModal({ open, onClose, job }: JobApplicationModalProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAuthenticated = status === 'authenticated';
  const isCandidate = session?.user?.userType === 'CANDIDATE';
  const candidateName = getFullName(session?.user?.firstName, session?.user?.lastName);
  const companyName = job.company?.companyName || 'this company';

  const {
    coverLetter,
    candidateEmail,
    candidatePhone,
    cvs,
    errorMessage,
    isLoadingInitialData,
    isSubmittingApplication,
    isUploadingCv,
    selectedCvId,
    setCoverLetter,
    setErrorMessage,
    setSelectedCvId,
    enhanceCoverLetter,
    submitApplication,
    uploadNewCv,
  } = useJobApplicationModal({
    enabled: open && isAuthenticated && isCandidate,
    jobId: job.id,
    userId: session?.user?.id ?? null,
  });

  const isSubmitDisabled = useMemo(() => {
    return (
      isSubmittingApplication ||
      isLoadingInitialData ||
      !selectedCvId ||
      coverLetter.trim().length < MIN_COVER_LETTER_LENGTH
    );
  }, [coverLetter, isLoadingInitialData, isSubmittingApplication, selectedCvId]);

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmittingApplication) {
        onClose();
      }
    };

    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [isSubmittingApplication, onClose, open]);

  if (!open) return null;

  const handleAuthRedirect = () => {
    const callbackUrl = typeof window !== 'undefined' ? window.location.href : '/candidate/jobs';
    router.push(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  };

  const handleUploadNewCv = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = '';

    if (!selectedFile) return;

    const result = await uploadNewCv(selectedFile);
    if (result.success) {
      toast.success(result.message);
      return;
    }

    toast.error(result.message);
  };

  const handleSubmitApplication = async () => {
    const result = await submitApplication();

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    onClose();
  };

  const closeModalSafely = () => {
    if (isSubmittingApplication) return;
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={closeModalSafely} aria-hidden="true" />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-primary/10 bg-primary/5">
              {job.company?.logoUrl ? (
                <Image
                  src={job.company.logoUrl}
                  alt={companyName}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <FileText className="text-primary h-5 w-5" />
              )}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold text-slate-900 dark:text-white">
                Apply for {job.title}
              </h2>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{companyName}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeModalSafely}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close application modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {status === 'loading' ? (
          <div className="flex min-h-48 items-center justify-center p-6">
            <Loader2 className="text-primary h-6 w-6 animate-spin" />
          </div>
        ) : !isAuthenticated ? (
          <div className="space-y-4 p-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center dark:border-slate-800 dark:bg-slate-900/40">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Sign in to continue
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                You need to sign in as a candidate to apply for this role.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModalSafely}
                className="rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAuthRedirect}
                className="rounded-lg bg-gradient-to-r from-primary to-purple-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90"
              >
                Sign In
              </button>
            </div>
          </div>
        ) : !isCandidate ? (
          <div className="space-y-4 p-6">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-center dark:border-amber-900/40 dark:bg-amber-900/15">
              <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-300">
                Candidate account required
              </h3>
              <p className="mt-2 text-sm text-amber-800 dark:text-amber-400">
                This action is only available for candidate accounts.
              </p>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={closeModalSafely}
                className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="custom-scrollbar flex-1 space-y-7 overflow-y-auto p-6">
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <Mail className="text-primary h-4 w-4" />
                  <h3 className="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                    Personal Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/40">
                    <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">Email Address</p>
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                      {candidateEmail || session?.user?.email}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/40">
                    <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">Phone Number</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {candidatePhone || 'Not provided'}
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FileText className="text-primary h-4 w-4" />
                    <h3 className="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                      Select Resume
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleUploadNewCv}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingCv}
                      className="text-primary inline-flex items-center gap-1 text-sm font-semibold transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isUploadingCv ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      Upload New
                    </button>
                  </div>
                </div>

                {isLoadingInitialData ? (
                  <div className="flex h-24 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40">
                    <Loader2 className="text-primary h-5 w-5 animate-spin" />
                  </div>
                ) : cvs.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-900/40">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      You do not have any CV yet. Please upload one to continue.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cvs.map((cv) => {
                      const isSelected = cv.id === selectedCvId;
                      return (
                        <label
                          key={cv.id}
                          className={cn(
                            'relative flex cursor-pointer items-center rounded-xl border p-4 transition',
                            isSelected
                              ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                              : 'border-slate-200 hover:border-primary/50 dark:border-slate-800 dark:hover:border-primary/40'
                          )}
                        >
                          <input
                            type="radio"
                            name="job-application-cv"
                            className="sr-only"
                            checked={isSelected}
                            onChange={() => setSelectedCvId(cv.id)}
                          />

                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-slate-800">
                              <FileText
                                className={cn(
                                  'h-5 w-5',
                                  cv.mimeType.includes('pdf') ? 'text-rose-500' : 'text-blue-500'
                                )}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                                {cv.cvName}
                              </p>
                              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                {formatRelativeDate(cv.updatedAt)} - {formatFileSize(cv.fileSize)}
                              </p>
                            </div>
                          </div>

                          <div
                            className={cn(
                              'ml-3 h-5 w-5 rounded-full border',
                              isSelected
                                ? 'border-primary bg-primary'
                                : 'border-slate-300 dark:border-slate-600'
                            )}
                          />
                        </label>
                      );
                    })}
                  </div>
                )}
              </section>

              <section>
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="text-primary h-4 w-4" />
                  <h3 className="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                    Cover Letter
                  </h3>
                </div>

                <div className="relative">
                  <textarea
                    value={coverLetter}
                    onChange={(event) => setCoverLetter(event.target.value)}
                    rows={6}
                    placeholder="Write a brief introduction about your experience and why you're a great fit for this role..."
                    className="focus:ring-primary/30 focus:border-primary w-full resize-none rounded-xl border border-slate-200 bg-white p-4 pr-28 text-sm text-slate-900 transition placeholder:text-slate-400 focus:ring-2 focus:outline-none dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100"
                  />

                  <button
                    type="button"
                    onClick={() => enhanceCoverLetter(candidateName, companyName, job.title)}
                    className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold tracking-wide text-slate-600 uppercase transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <Sparkles className="h-3 w-3" />
                    AI Enhance
                  </button>
                </div>

                <p
                  className={cn(
                    'mt-2 text-xs',
                    coverLetter.trim().length >= MIN_COVER_LETTER_LENGTH
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-500 dark:text-slate-400'
                  )}
                >
                  {coverLetter.trim().length}/{MIN_COVER_LETTER_LENGTH}+ characters required
                </p>
              </section>

              {errorMessage && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/30 dark:bg-rose-900/15 dark:text-rose-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 p-6 dark:border-slate-800 dark:bg-slate-900/20">
              <button
                type="button"
                onClick={closeModalSafely}
                className="rounded-lg px-6 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitApplication}
                disabled={isSubmitDisabled}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-purple-500 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmittingApplication ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SendHorizontal className="h-4 w-4" />
                )}
                Submit Application
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
