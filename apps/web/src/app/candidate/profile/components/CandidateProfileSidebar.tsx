import { Candidate } from '../../../admin/candidates/types';

interface CandidateProfileSidebarProps {
  candidate: Candidate;
}

function calcProfileCompletion(candidate: Candidate): number {
  const checks = [
    !!candidate.firstName,
    !!candidate.lastName,
    !!candidate.email,
    !!candidate.phone,
    !!candidate.avatarUrl,
    !!candidate.profile?.bio,
    !!candidate.profile?.city,
    !!candidate.profile?.websiteUrl,
    !!candidate.profile?.linkedinUrl,
    !!candidate.profile?.githubUrl,
    !!candidate.candidateInfo?.currentPosition,
    !!candidate.candidateInfo?.expectedSalaryMin,
    !!candidate.candidateInfo?.preferredWorkType,
    !!candidate.candidateInfo?.preferredLocationType,
    (candidate.candidateInfo?.skills?.length ?? 0) > 0,
    (candidate.candidateInfo?.experience?.length ?? 0) > 0,
    (candidate.candidateInfo?.education?.length ?? 0) > 0,
    (candidate.candidateInfo?.certifications?.length ?? 0) > 0,
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

const socialLinks = [
  { key: 'websiteUrl', label: 'Website', icon: 'language' },
  { key: 'linkedinUrl', label: 'LinkedIn', icon: 'share' },
  { key: 'githubUrl', label: 'GitHub', icon: 'code' },
  { key: 'portfolioUrl', label: 'Portfolio', icon: 'palette' },
] as const;

export function CandidateProfileSidebar({ candidate }: CandidateProfileSidebarProps) {
  const completion = calcProfileCompletion(candidate);
  const profile = candidate.profile;
  const cvUrl = candidate.candidateInfo?.cvFileUrl;

  return (
    <aside className="hidden w-80 flex-col space-y-8 overflow-y-auto border-r border-slate-100 p-8 lg:flex">
      {/* Profile Completion */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold tracking-widest text-slate-400 uppercase">
            Hoàn thiện hồ sơ
          </h4>
          <span className="text-primary text-sm font-bold">{completion}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-violet-100">
          <div
            className="bg-primary h-full rounded-full transition-all"
            style={{ width: `${completion}%` }}
          />
        </div>
        {completion < 100 && (
          <p className="text-[11px] leading-relaxed text-slate-500 italic">
            Hoàn thiện thêm thông tin để đạt 100%.
          </p>
        )}
      </div>

      <hr className="border-slate-100" />

      {/* Contact Details */}
      <div className="space-y-5">
        <h4 className="text-xs font-bold tracking-widest text-slate-400 uppercase">
          Thông tin liên hệ
        </h4>
        <div className="space-y-4">
          <div className="group flex items-center gap-4">
            <div className="text-primary group-hover:bg-primary flex size-10 items-center justify-center rounded-xl bg-violet-50 transition-colors group-hover:text-white">
              <span className="material-symbols-outlined text-xl">mail</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
              <p className="text-sm font-semibold text-slate-700">{candidate.email}</p>
            </div>
          </div>

          {candidate.phone && (
            <div className="group flex items-center gap-4">
              <div className="text-primary group-hover:bg-primary flex size-10 items-center justify-center rounded-xl bg-violet-50 transition-colors group-hover:text-white">
                <span className="material-symbols-outlined text-xl">phone_iphone</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Điện thoại</p>
                <p className="text-sm font-semibold text-slate-700">{candidate.phone}</p>
              </div>
            </div>
          )}

          {(profile?.city || profile?.province) && (
            <div className="group flex items-center gap-4">
              <div className="text-primary group-hover:bg-primary flex size-10 items-center justify-center rounded-xl bg-violet-50 transition-colors group-hover:text-white">
                <span className="material-symbols-outlined text-xl">location_on</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Địa chỉ</p>
                <p className="text-sm font-semibold text-slate-700">
                  {[profile.city, profile.province].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Social Presence */}
      <div className="space-y-5">
        <h4 className="text-xs font-bold tracking-widest text-slate-400 uppercase">Mạng xã hội</h4>
        <div className="grid grid-cols-2 gap-3">
          {socialLinks.map(({ key, label, icon }) => {
            const url = profile?.[key];
            return url ? (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group hover:border-primary/30 flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-4 transition-all hover:shadow-md"
              >
                <span className="material-symbols-outlined text-primary mb-2">{icon}</span>
                <span className="text-[10px] font-bold text-slate-600">{label}</span>
              </a>
            ) : (
              <div
                key={key}
                className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4"
              >
                <span className="material-symbols-outlined mb-2 text-slate-300">{icon}</span>
                <span className="text-[10px] font-bold text-slate-300">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Download CV */}
      <div className="mt-auto rounded-[2rem] bg-gradient-to-br from-violet-600 to-purple-700 p-5 text-white">
        <p className="mb-2 text-xs font-bold tracking-widest uppercase opacity-80">Hành động</p>
        <p className="mb-4 text-sm leading-relaxed font-medium">
          Tải xuống CV của ứng viên về máy.
        </p>
        {cvUrl ? (
          <a
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/20 py-3 text-xs font-bold text-white transition-all hover:bg-white/30"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Tải CV
          </a>
        ) : (
          <div className="w-full cursor-not-allowed rounded-xl bg-white/10 py-3 text-center text-xs font-bold text-white/50">
            Chưa có CV
          </div>
        )}
      </div>
    </aside>
  );
}
