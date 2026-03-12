import ModernCompanyCard, { CompanyCardData } from './ModernCompanyCard';
import { Building2 } from 'lucide-react';

interface CompanyGridProps {
  companies: CompanyCardData[];
}

export default function CompanyGrid({ companies }: CompanyGridProps) {
  if (companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 dark:bg-purple-900/20">
          <Building2 className="h-8 w-8 text-purple-300" />
        </div>
        <h3 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">
          Không tìm thấy công ty
        </h3>
        <p className="max-w-xs text-sm text-slate-500 dark:text-slate-400">
          Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem thêm kết quả.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {companies.map((company) => (
        <ModernCompanyCard key={company.id} company={company} />
      ))}
    </div>
  );
}
