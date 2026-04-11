import {
  CompanyRole,
  CompanySize,
  Prisma,
  UserType,
  VerificationStatus,
} from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { generateCompanySlug } from '@/lib/utils/company-utils';
import { EmployerRequestCompany, EmployerRequestState } from '@/types/employer-request';

interface EmployerRequestMutationInput {
  companyId?: string;
  companyName: string;
  industryId: string;
  companySize: CompanySize;
  websiteUrl?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  businessLicenseUrl?: string | null;
}

const employerRequestCompanyInclude = {
  industry: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.CompanyInclude;

type EmployerRequestCompanyRecord = Prisma.CompanyGetPayload<{
  include: typeof employerRequestCompanyInclude;
}>;

function mapEmployerRequestCompany(company: EmployerRequestCompanyRecord): EmployerRequestCompany {
  return {
    id: company.id,
    companyName: company.companyName,
    companySlug: company.companySlug,
    industryId: company.industryId ?? null,
    industryName: company.industry?.name ?? null,
    companySize: company.companySize ?? null,
    websiteUrl: company.websiteUrl ?? null,
    description: company.description ?? null,
    logoUrl: company.logoUrl ?? null,
    businessLicenseUrl: company.businessLicenseUrl ?? null,
    verificationStatus: company.verificationStatus,
    verificationNotes: company.verificationNotes ?? null,
    createdAt: company.createdAt.toISOString(),
    updatedAt: company.updatedAt.toISOString(),
  };
}

export class CandidateEmployerRequestService {
  private static async getPrimaryCompanyLink(userId: string) {
    return prisma.companyUser.findFirst({
      where: {
        userId,
        role: CompanyRole.ADMIN,
      },
      include: {
        company: {
          include: employerRequestCompanyInclude,
        },
      },
      orderBy: [{ isPrimaryContact: 'desc' }, { createdAt: 'desc' }],
    });
  }

  private static buildRequestState(company: EmployerRequestCompanyRecord | null): EmployerRequestState {
    if (!company) {
      return {
        status: 'NONE',
        company: null,
        canEdit: true,
        requiresSessionRefresh: false,
      };
    }

    const status = company.verificationStatus;

    return {
      status,
      company: mapEmployerRequestCompany(company),
      canEdit: status === VerificationStatus.REJECTED,
      requiresSessionRefresh: status === VerificationStatus.VERIFIED,
    };
  }

  static async getRequestState(userId: string): Promise<EmployerRequestState> {
    const companyLink = await this.getPrimaryCompanyLink(userId);
    return this.buildRequestState(companyLink?.company ?? null);
  }

  static async getRequestCompany(userId: string) {
    const companyLink = await this.getPrimaryCompanyLink(userId);
    return companyLink?.company ?? null;
  }

  static async generateUniqueSlug(companyName: string, excludeCompanyId?: string) {
    const baseSlug = generateCompanySlug(companyName) || 'company';
    let slug = baseSlug;
    let counter = 1;

    while (
      await prisma.company.findFirst({
        where: {
          companySlug: slug,
          ...(excludeCompanyId
            ? {
                id: {
                  not: excludeCompanyId,
                },
              }
            : {}),
        },
        select: { id: true },
      })
    ) {
      counter += 1;
      slug = `${baseSlug}-${counter}`;
    }

    return slug;
  }

  static async createRequest(userId: string, input: EmployerRequestMutationInput) {
    const existingState = await this.getRequestState(userId);
    if (existingState.status !== 'NONE') {
      throw new Error('Employer request already exists for this user');
    }

    const companyId = input.companyId ?? crypto.randomUUID();
    const companySlug = await this.generateUniqueSlug(input.companyName);

    await prisma.$transaction(async (tx) => {
      await tx.company.create({
        data: {
          id: companyId,
          companyName: input.companyName,
          companySlug,
          industryId: input.industryId,
          companySize: input.companySize,
          websiteUrl: input.websiteUrl ?? null,
          description: input.description ?? null,
          logoUrl: input.logoUrl ?? null,
          businessLicenseUrl: input.businessLicenseUrl ?? null,
          verificationStatus: VerificationStatus.PENDING,
          verificationNotes: null,
        },
      });

      await tx.companyUser.create({
        data: {
          companyId,
          userId,
          role: CompanyRole.ADMIN,
          isPrimaryContact: true,
          permissions: {
            canManageJobs: true,
            canManageApplications: true,
            canManageCompany: true,
            canInviteMembers: true,
          },
        },
      });
    });

    return this.getRequestState(userId);
  }

  static async updateRejectedRequest(userId: string, input: EmployerRequestMutationInput) {
    const existingCompany = await this.getRequestCompany(userId);

    if (!existingCompany) {
      throw new Error('Employer request not found');
    }

    if (existingCompany.verificationStatus !== VerificationStatus.REJECTED) {
      throw new Error('Only rejected employer requests can be updated');
    }

    const companySlug =
      existingCompany.companyName === input.companyName
        ? existingCompany.companySlug
        : await this.generateUniqueSlug(input.companyName, existingCompany.id);

    await prisma.company.update({
      where: { id: existingCompany.id },
      data: {
        companyName: input.companyName,
        companySlug,
        industryId: input.industryId,
        companySize: input.companySize,
        websiteUrl: input.websiteUrl ?? null,
        description: input.description ?? null,
        logoUrl: input.logoUrl ?? existingCompany.logoUrl,
        businessLicenseUrl: input.businessLicenseUrl ?? existingCompany.businessLicenseUrl,
        verificationStatus: VerificationStatus.PENDING,
        verificationNotes: null,
        updatedAt: new Date(),
      },
    });

    return this.getRequestState(userId);
  }

  static async getPrimaryContactUser(companyId: string) {
    return prisma.companyUser.findFirst({
      where: {
        companyId,
        role: CompanyRole.ADMIN,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            userType: true,
          },
        },
      },
      orderBy: [{ isPrimaryContact: 'desc' }, { createdAt: 'desc' }],
    });
  }
}
