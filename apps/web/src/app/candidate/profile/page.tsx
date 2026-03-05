'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Candidate } from '../../admin/candidates/types';
import { CandidateProfileHeader } from './components/CandidateProfileHeader';
import { CandidateProfileSidebar } from './components/CandidateProfileSidebar';
import { ProfessionalSummarySection } from './components/ProfessionalSummarySection';
import { WorkExperienceSection } from './components/WorkExperienceSection';
import { EducationSection } from './components/EducationSection';
import { CertificationsSection } from './components/CertificationsSection';
import { SkillsSection } from './components/SkillsSection';
import { CareerPreferencesSection } from './components/CareerPreferencesSection';

export default function CandidateProfilePage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStatus === 'loading') return;
    if (sessionStatus === 'unauthenticated' || !session?.user?.id) {
      router.replace('/auth/signin');
      return;
    }

    async function fetchCandidate() {
      try {
        const res = await fetch(`/api/candidates/${session!.user.id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('not_found');
          } else {
            setError('error');
          }
          return;
        }
        const json = await res.json();
        if (json.success && json.data) {
          setCandidate(json.data);
        } else {
          setError('not_found');
        }
      } catch {
        setError('error');
      } finally {
        setLoading(false);
      }
    }

    fetchCandidate();
  }, [sessionStatus, session, router]);

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="space-y-4 text-center">
          <div className="border-primary mx-auto h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-sm text-slate-500">Đang tải hồ sơ ứng viên…</p>
        </div>
      </div>
    );
  }

  if (error === 'not_found' || !candidate) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50">
        <span className="material-symbols-outlined text-7xl text-slate-300">person_off</span>
        <div className="space-y-1 text-center">
          <h2 className="text-xl font-bold text-slate-700">Không tìm thấy ứng viên</h2>
          <p className="text-sm text-slate-400">
            Ứng viên này không tồn tại hoặc đã bị xóa khỏi hệ thống.
          </p>
        </div>
        <Link
          href="/candidate/dashboard"
          className="bg-primary hover:bg-primary/90 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  if (error === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50">
        <span className="material-symbols-outlined text-7xl text-red-300">error</span>
        <div className="space-y-1 text-center">
          <h2 className="text-xl font-bold text-slate-700">Đã xảy ra lỗi</h2>
          <p className="text-sm text-slate-400">Không thể tải hồ sơ ứng viên. Vui lòng thử lại.</p>
        </div>
        <button
          onClick={() => router.refresh()}
          className="bg-primary hover:bg-primary/90 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition"
        >
          <span className="material-symbols-outlined text-base">refresh</span>
          Thử lại
        </button>
      </div>
    );
  }

  const info = candidate.candidateInfo;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-slate-50">
      {/* Breadcrumb */}
      {/* <div className="border-b border-slate-100 bg-white/60 px-6 py-3 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-7xl items-center gap-2 text-xs text-slate-500">
          <Link href="/candidate/dashboard" className="hover:text-primary transition">
            Tổng quan
          </Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="font-medium text-slate-700">Hồ sơ của tôi</span>
        </nav>
      </div> */}

      {/* Body: sidebar + main */}
      <div className="mx-auto max-w-7xl px-6 py-10 pt-20">
        <div className="flex gap-10">
          {/* Sidebar */}
          <aside className="w-72 flex-shrink-0">
            <div className="sticky top-24">
              <CandidateProfileSidebar candidate={candidate} />
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0 flex-1 space-y-12">
            {candidate.profile?.bio && <ProfessionalSummarySection bio={candidate.profile.bio} />}

            {info?.experience && info.experience.length > 0 && (
              <WorkExperienceSection experience={info.experience} />
            )}

            {info?.education && info.education.length > 0 && (
              <EducationSection education={info.education} />
            )}

            {info?.certifications && info.certifications.length > 0 && (
              <CertificationsSection certifications={info.certifications} />
            )}

            {info?.skills && info.skills.length > 0 && <SkillsSection skills={info.skills} />}

            {info && <CareerPreferencesSection candidateInfo={info} />}
          </main>
        </div>
      </div>
    </div>
  );
}
