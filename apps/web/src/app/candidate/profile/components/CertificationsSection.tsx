import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CandidateCertification } from '../../../admin/candidates/types';
import { SectionHeading } from './SectionHeading';

interface CertificationsSectionProps {
  certifications: CandidateCertification[];
}

export function CertificationsSection({ certifications }: CertificationsSectionProps) {
  if (!certifications.length) return null;

  return (
    <section className="space-y-6">
      <SectionHeading title="Chứng chỉ" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {certifications.map((cert) => (
          <div
            key={cert.id}
            className="rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm"
          >
            <div className="text-primary mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-violet-50">
              <span className="material-symbols-outlined">verified_user</span>
            </div>
            <h5 className="mb-1 text-sm font-bold text-slate-900">{cert.certificationName}</h5>
            <p className="mb-2 text-xs font-medium text-slate-500">{cert.issuingOrganization}</p>
            <p className="text-[10px] font-medium text-slate-400">
              Cấp: {format(new Date(cert.issueDate), 'MMM yyyy', { locale: vi })}
              {cert.expiryDate &&
                ` · Hết hạn: ${format(new Date(cert.expiryDate), 'MMM yyyy', { locale: vi })}`}
            </p>
            {cert.credentialUrl && (
              <a
                href={cert.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary mt-3 inline-flex items-center gap-1 text-[10px] font-bold hover:underline"
              >
                <span className="material-symbols-outlined text-sm">open_in_new</span>
                Xem chứng chỉ
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
