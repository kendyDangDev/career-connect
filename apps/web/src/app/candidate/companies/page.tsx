import type { Metadata } from 'next';
import { Suspense } from 'react';
import type { CompanySize, Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import CompanyHeroSection from '@/components/candidate/companies/CompanyHeroSection';
import FeaturedCompanies from '@/components/candidate/companies/FeaturedCompanies';
import CompanyFiltersBar from '@/components/candidate/companies/CompanyFiltersBar';
import CompanyGrid from '@/components/candidate/companies/CompanyGrid';
import CompanyPagination from '@/components/candidate/companies/CompanyPagination';
import type { CompanyCardData } from '@/components/candidate/companies/ModernCompanyCard';

export const metadata: Metadata = {
  title: 'Danh sách công ty | CareerConnect',
  description:
    'Khám phá danh sách công ty hàng đầu trên CareerConnect với bộ lọc ngành nghề, quy mô và từ khóa tìm kiếm.',
  keywords: 'danh sách công ty, tìm công ty, tuyển dụng, careerconnect',
};

interface CompaniesPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function normalizeParam(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function CompaniesPage({ searchParams }: CompaniesPageProps) {
  const resolvedParams = await searchParams;
  const pageParam = normalizeParam(resolvedParams?.page);
  const search = normalizeParam(resolvedParams?.search);
  const industryId = normalizeParam(resolvedParams?.industryId);
  const companySize = normalizeParam(resolvedParams?.companySize);
  const sortBy = normalizeParam(resolvedParams?.sortBy) || 'newest';

  const limit = 9;
  const requestedPage = Math.max(1, Number(pageParam || 1));

  const where: Prisma.CompanyWhereInput = {
    verificationStatus: 'VERIFIED',
    ...(industryId ? { industryId } : {}),
    ...(companySize ? { companySize: companySize as CompanySize } : {}),
    ...(search
      ? {
          OR: [
            { companyName: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { industry: { name: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.CompanyOrderByWithRelationInput =
    sortBy === 'oldest'
      ? { createdAt: 'asc' }
      : sortBy === 'name_asc'
        ? { companyName: 'asc' }
        : sortBy === 'name_desc'
          ? { companyName: 'desc' }
          : { createdAt: 'desc' };

  const industries = await prisma.industry.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true },
  });

  const totalCount = await prisma.company.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const currentPage = Math.min(requestedPage, totalPages);

  const companies = await prisma.company.findMany({
    where,
    orderBy,
    skip: (currentPage - 1) * limit,
    take: limit,
    select: {
      id: true,
      companyName: true,
      companySlug: true,
      logoUrl: true,
      coverImageUrl: true,
      description: true,
      companySize: true,
      industry: { select: { name: true } },
      _count: {
        select: {
          jobs: {
            where: {
              status: 'ACTIVE',
            },
          },
        },
      },
    },
  });

  const companyCards: CompanyCardData[] = companies.map((company) => ({
    id: company.id,
    companyName: company.companyName,
    companySlug: company.companySlug,
    logoUrl: company.logoUrl,
    coverImageUrl: company.coverImageUrl,
    description: company.description,
    companySize: company.companySize,
    activeJobsCount: company._count.jobs,
    industry: company.industry,
  }));

  return (
    <div className="min-h-screen bg-white pt-10">
      <div className="mx-auto w-full max-w-7xl px-4 pt-12 pb-20 lg:px-8">
        <CompanyHeroSection />

        <Suspense fallback={<div className="mt-12 h-48 animate-pulse rounded-2xl bg-slate-100" />}>
          <FeaturedCompanies />
        </Suspense>

        <div className="mt-12">
          <CompanyFiltersBar industries={industries} totalCount={totalCount} />
          <CompanyGrid companies={companyCards} />
          <CompanyPagination currentPage={currentPage} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
