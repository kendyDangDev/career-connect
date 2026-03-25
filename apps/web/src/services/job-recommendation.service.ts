import { prisma } from '@/lib/prisma';
import { JobStatus, Prisma } from '@/generated/prisma';

const DEFAULT_RECOMMENDATION_LIMIT = 10;
const DEFAULT_SEED_LIMIT = 5;
const DEFAULT_SIMILAR_LIMIT = 5;
const DEFAULT_SIMILARITY_TARGETS_PER_JOB = 50;
const TIME_DECAY_HALF_LIFE_DAYS = 30;

const recommendationJobSelect = {
  id: true,
  title: true,
  slug: true,
  jobType: true,
  workLocationType: true,
  experienceLevel: true,
  salaryMin: true,
  salaryMax: true,
  currency: true,
  salaryNegotiable: true,
  address: true,
  locationCity: true,
  locationProvince: true,
  applicationDeadline: true,
  status: true,
  viewCount: true,
  applicationCount: true,
  featured: true,
  urgent: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  company: {
    select: {
      id: true,
      companyName: true,
      companySlug: true,
      logoUrl: true,
      verificationStatus: true,
    },
  },
  jobSkills: {
    select: {
      skillId: true,
      skill: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} satisfies Prisma.JobSelect;

type RecommendationJobRecord = Prisma.JobGetPayload<{
  select: typeof recommendationJobSelect;
}>;

interface RankedRecommendationRow {
  job_id: string;
  final_score: number | string;
}

interface RankedProfileRecommendationRow {
  job_id: string;
}

interface CandidatePreferenceSignals {
  candidateId: string;
  skillIds: string[];
  preferredWorkType: string | null;
  preferredLocationType: string | null;
  expectedSalaryMin: number | null;
  expectedSalaryMax: number | null;
}

export interface RecommendationJobCard {
  id: string;
  title: string;
  slug: string;
  jobType: string;
  workLocationType: string;
  experienceLevel: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  salaryNegotiable: boolean;
  address: string | null;
  locationCity: string | null;
  locationProvince: string | null;
  applicationDeadline: string | null;
  status: string;
  viewCount: number;
  applicationCount: number;
  featured: boolean;
  urgent: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  company: {
    id: string;
    companyName: string;
    companySlug?: string;
    logoUrl?: string | null;
    verificationStatus?: string;
  };
  jobSkills: Array<{
    skill: {
      id: string;
      name: string | null;
    };
  }>;
  skills: string[];
  recommendationScore?: number;
  similarityScore?: number;
}

export type RecommendationStrategy = 'behavioral' | 'profile';

export interface CandidateRecommendationResult {
  strategy: RecommendationStrategy;
  title: string;
  description: string;
  jobs: RecommendationJobCard[];
}

export type CandidateRecommendationItem = RecommendationJobCard;
export type SimilarJobItem = RecommendationJobCard;

const recommendationCopy: Record<
  RecommendationStrategy,
  { title: string; description: string }
> = {
  behavioral: {
    title: 'Đề xuất dựa trên hoạt động ứng tuyển của bạn',
    description:
      'Hệ thống ưu tiên các vị trí gần với những công việc bạn đã xem, lưu và ứng tuyển gần đây.',
  },
  profile: {
    title: 'Công việc phù hợp với profile của bạn',
    description:
      'Khi chưa đủ dữ liệu hành vi, hệ thống ưu tiên vị trí khớp với kỹ năng, hình thức làm việc và kỳ vọng hiện tại của bạn.',
  },
};

const interactionCtes = Prisma.sql`
  WITH unified_interactions AS (
    SELECT
      jv.user_id,
      jv.job_id,
      1 AS view_flag,
      0 AS save_flag,
      0 AS apply_flag,
      jv.viewed_at AS viewed_at,
      NULL::timestamp AS saved_at,
      NULL::timestamp AS applied_at
    FROM "job_views" jv
    WHERE jv.user_id IS NOT NULL

    UNION ALL

    SELECT
      c.user_id,
      sj.job_id,
      0 AS view_flag,
      1 AS save_flag,
      0 AS apply_flag,
      NULL::timestamp AS viewed_at,
      sj.created_at AS saved_at,
      NULL::timestamp AS applied_at
    FROM "saved_jobs" sj
    INNER JOIN "candidates" c
      ON c.id = sj.candidate_id
    WHERE c.user_id IS NOT NULL

    UNION ALL

    SELECT
      a.user_id,
      a.job_id,
      0 AS view_flag,
      0 AS save_flag,
      1 AS apply_flag,
      NULL::timestamp AS viewed_at,
      NULL::timestamp AS saved_at,
      a.applied_at AS applied_at
    FROM "applications" a
    WHERE a.user_id IS NOT NULL
  ),
  normalized_interactions AS (
    SELECT
      user_id,
      job_id,
      MAX(view_flag) AS has_view,
      MAX(save_flag) AS has_save,
      MAX(apply_flag) AS has_apply,
      MAX(viewed_at) AS latest_viewed_at,
      MAX(saved_at) AS latest_saved_at,
      MAX(applied_at) AS latest_applied_at,
      GREATEST(
        COALESCE(MAX(viewed_at), TIMESTAMP 'epoch'),
        COALESCE(MAX(saved_at), TIMESTAMP 'epoch'),
        COALESCE(MAX(applied_at), TIMESTAMP 'epoch')
      ) AS latest_interaction_at
    FROM unified_interactions
    GROUP BY user_id, job_id
  ),
  weighted_interactions AS (
    SELECT
      user_id,
      job_id,
      (
        CASE
          WHEN has_view = 1 AND latest_viewed_at IS NOT NULL THEN
            EXP(
              (-LN(2) / ${TIME_DECAY_HALF_LIFE_DAYS}) *
              GREATEST(EXTRACT(EPOCH FROM (NOW() - latest_viewed_at)) / 86400.0, 0)
            )
          ELSE 0
        END
        +
        CASE
          WHEN has_save = 1 AND latest_saved_at IS NOT NULL THEN
            3 * EXP(
              (-LN(2) / ${TIME_DECAY_HALF_LIFE_DAYS}) *
              GREATEST(EXTRACT(EPOCH FROM (NOW() - latest_saved_at)) / 86400.0, 0)
            )
          ELSE 0
        END
        +
        CASE
          WHEN has_apply = 1 AND latest_applied_at IS NOT NULL THEN
            5 * EXP(
              (-LN(2) / ${TIME_DECAY_HALF_LIFE_DAYS}) *
              GREATEST(EXTRACT(EPOCH FROM (NOW() - latest_applied_at)) / 86400.0, 0)
            )
          ELSE 0
        END
      )::double precision AS total_weight,
      latest_interaction_at
    FROM normalized_interactions
  )
`;

function clampLimit(limit: number, min: number, max: number) {
  return Math.min(Math.max(limit, min), max);
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function buildOpenActiveJobWhere(now: Date = new Date()): Prisma.JobWhereInput {
  return {
    status: JobStatus.ACTIVE,
    OR: [{ applicationDeadline: null }, { applicationDeadline: { gte: now } }],
  };
}

function mapJobToRecommendationCard(
  job: RecommendationJobRecord,
  extras?: { recommendationScore?: number; similarityScore?: number }
): RecommendationJobCard {
  const skills = job.jobSkills
    .map((jobSkill) => jobSkill.skill.name)
    .filter((skillName): skillName is string => Boolean(skillName));

  return {
    id: job.id,
    title: job.title,
    slug: job.slug,
    jobType: job.jobType,
    workLocationType: job.workLocationType,
    experienceLevel: job.experienceLevel,
    salaryMin: toNullableNumber(job.salaryMin),
    salaryMax: toNullableNumber(job.salaryMax),
    currency: job.currency ?? null,
    salaryNegotiable: job.salaryNegotiable,
    address: job.address ?? null,
    locationCity: job.locationCity ?? null,
    locationProvince: job.locationProvince ?? null,
    applicationDeadline: job.applicationDeadline?.toISOString() ?? null,
    status: job.status,
    viewCount: job.viewCount,
    applicationCount: job.applicationCount,
    featured: job.featured,
    urgent: job.urgent,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
    publishedAt: job.publishedAt?.toISOString() ?? null,
    company: {
      id: job.company.id,
      companyName: job.company.companyName,
      ...(job.company.companySlug ? { companySlug: job.company.companySlug } : {}),
      ...(job.company.logoUrl ? { logoUrl: job.company.logoUrl } : {}),
      ...(job.company.verificationStatus
        ? { verificationStatus: job.company.verificationStatus }
        : {}),
    },
    jobSkills: job.jobSkills.map((jobSkill) => ({
      skill: {
        id: jobSkill.skill.id,
        name: jobSkill.skill.name,
      },
    })),
    skills,
    ...(extras?.recommendationScore !== undefined
      ? { recommendationScore: extras.recommendationScore }
      : {}),
    ...(extras?.similarityScore !== undefined ? { similarityScore: extras.similarityScore } : {}),
  };
}

function buildSalaryOverlapSql(
  expectedSalaryMin: number | null,
  expectedSalaryMax: number | null
) {
  if (expectedSalaryMin !== null && expectedSalaryMax !== null) {
    return Prisma.sql`
      CASE
        WHEN j."salary_min" IS NULL OR j."salary_max" IS NULL THEN 0
        WHEN j."salary_min" <= ${expectedSalaryMax} AND j."salary_max" >= ${expectedSalaryMin} THEN 1
        ELSE 0
      END
    `;
  }

  if (expectedSalaryMin !== null) {
    return Prisma.sql`
      CASE
        WHEN j."salary_max" IS NULL THEN 0
        WHEN j."salary_max" >= ${expectedSalaryMin} THEN 1
        ELSE 0
      END
    `;
  }

  if (expectedSalaryMax !== null) {
    return Prisma.sql`
      CASE
        WHEN j."salary_min" IS NULL THEN 0
        WHEN j."salary_min" <= ${expectedSalaryMax} THEN 1
        ELSE 0
      END
    `;
  }

  return Prisma.sql`0`;
}

async function loadRecommendationJobs(
  orderedJobIds: string[],
  scoresByJobId?: Map<string, number>,
  scoreType: 'recommendationScore' | 'similarityScore' = 'recommendationScore'
) {
  if (orderedJobIds.length === 0) {
    return [];
  }

  const jobs = await prisma.job.findMany({
    where: {
      id: { in: orderedJobIds },
      ...buildOpenActiveJobWhere(),
    },
    select: recommendationJobSelect,
  });

  const jobsById = new Map(jobs.map((job) => [job.id, job]));

  return orderedJobIds
    .map((jobId) => {
      const job = jobsById.get(jobId);
      if (!job) {
        return null;
      }

      const numericScore = scoresByJobId?.get(jobId);
      const scoreExtras =
        numericScore === undefined
          ? undefined
          : scoreType === 'similarityScore'
            ? { similarityScore: numericScore }
            : { recommendationScore: numericScore };

      return mapJobToRecommendationCard(job, scoreExtras);
    })
    .filter((job): job is RecommendationJobCard => Boolean(job));
}

export class JobRecommendationService {
  static async refreshJobSimilarities() {
    const similarityLimit = DEFAULT_SIMILARITY_TARGETS_PER_JOB;

    const [, insertedCount] = await prisma.$transaction([
      prisma.$executeRaw(Prisma.sql`TRUNCATE TABLE "job_similarities"`),
      prisma.$executeRaw(Prisma.sql`
        ${interactionCtes},
        job_norms AS (
          SELECT
            job_id,
            SQRT(SUM(total_weight * total_weight)) AS vector_norm
          FROM weighted_interactions
          GROUP BY job_id
        ),
        pair_scores AS (
          SELECT
            wi1.job_id AS source_job_id,
            wi2.job_id AS target_job_id,
            SUM(wi1.total_weight * wi2.total_weight) AS dot_product,
            COUNT(*) AS common_users
          FROM weighted_interactions wi1
          INNER JOIN weighted_interactions wi2
            ON wi1.user_id = wi2.user_id
           AND wi1.job_id < wi2.job_id
          GROUP BY wi1.job_id, wi2.job_id
          HAVING COUNT(*) >= 2
        ),
        filtered_pairs AS (
          SELECT
            ps.source_job_id,
            ps.target_job_id,
            CASE
              WHEN jn1.vector_norm = 0 OR jn2.vector_norm = 0 THEN NULL
              ELSE (ps.dot_product / (jn1.vector_norm * jn2.vector_norm))::double precision
            END AS similarity_score
          FROM pair_scores ps
          INNER JOIN job_norms jn1
            ON jn1.job_id = ps.source_job_id
          INNER JOIN job_norms jn2
            ON jn2.job_id = ps.target_job_id
          INNER JOIN "jobs" source_job
            ON source_job.id = ps.source_job_id
          INNER JOIN "jobs" target_job
            ON target_job.id = ps.target_job_id
          WHERE source_job.status = 'ACTIVE'
            AND target_job.status = 'ACTIVE'
            AND (source_job.application_deadline IS NULL OR source_job.application_deadline >= NOW())
            AND (target_job.application_deadline IS NULL OR target_job.application_deadline >= NOW())
        ),
        bidirectional_pairs AS (
          SELECT source_job_id, target_job_id, similarity_score
          FROM filtered_pairs

          UNION ALL

          SELECT target_job_id AS source_job_id, source_job_id AS target_job_id, similarity_score
          FROM filtered_pairs
        ),
        ranked_pairs AS (
          SELECT
            source_job_id,
            target_job_id,
            similarity_score,
            ROW_NUMBER() OVER (
              PARTITION BY source_job_id
              ORDER BY similarity_score DESC, target_job_id ASC
            ) AS rank_position
          FROM bidirectional_pairs
          WHERE similarity_score IS NOT NULL
            AND similarity_score > 0
        )
        INSERT INTO "job_similarities" (
          "id",
          "source_job_id",
          "target_job_id",
          "similarity_score",
          "created_at"
        )
        SELECT
          md5(source_job_id || ':' || target_job_id),
          source_job_id,
          target_job_id,
          similarity_score,
          NOW()
        FROM ranked_pairs
        WHERE rank_position <= ${similarityLimit}
      `),
    ]);

    return {
      insertedCount: Number(insertedCount),
      calculatedAt: new Date().toISOString(),
      similarityTargetLimit: similarityLimit,
      halfLifeDays: TIME_DECAY_HALF_LIFE_DAYS,
    };
  }

  static async getCandidateRecommendations(
    userId: string,
    options: { limit?: number; seedLimit?: number } = {}
  ): Promise<CandidateRecommendationResult> {
    const limit = clampLimit(options.limit ?? DEFAULT_RECOMMENDATION_LIMIT, 1, 20);
    const seedLimit = clampLimit(options.seedLimit ?? DEFAULT_SEED_LIMIT, 1, 10);

    const behavioralRows = await prisma.$queryRaw<RankedRecommendationRow[]>(Prisma.sql`
      ${interactionCtes},
      recent_seed_jobs AS (
        SELECT
          job_id,
          total_weight,
          latest_interaction_at
        FROM weighted_interactions
        WHERE user_id = ${userId}
        ORDER BY latest_interaction_at DESC, job_id ASC
        LIMIT ${seedLimit}
      ),
      interacted_jobs AS (
        SELECT job_id
        FROM weighted_interactions
        WHERE user_id = ${userId}
      )
      SELECT
        js.target_job_id AS job_id,
        SUM(js.similarity_score * seed.total_weight)::double precision AS final_score
      FROM recent_seed_jobs seed
      INNER JOIN "job_similarities" js
        ON js.source_job_id = seed.job_id
      INNER JOIN "jobs" target_job
        ON target_job.id = js.target_job_id
      WHERE NOT EXISTS (
        SELECT 1
        FROM interacted_jobs interacted_job
        WHERE interacted_job.job_id = js.target_job_id
      )
        AND target_job.status = 'ACTIVE'
        AND (target_job.application_deadline IS NULL OR target_job.application_deadline >= NOW())
      GROUP BY js.target_job_id
      ORDER BY final_score DESC, js.target_job_id ASC
      LIMIT ${limit}
    `);

    if (behavioralRows.length > 0) {
      const orderedJobIds = behavioralRows.map((row) => row.job_id);
      const scoresByJobId = new Map(
        behavioralRows.map((row) => [row.job_id, Number(row.final_score)])
      );

      return {
        strategy: 'behavioral',
        ...recommendationCopy.behavioral,
        jobs: await loadRecommendationJobs(orderedJobIds, scoresByJobId, 'recommendationScore'),
      };
    }

    const profileJobs = await this.getProfileFallbackRecommendations(userId, limit);

    return {
      strategy: 'profile',
      ...recommendationCopy.profile,
      jobs: profileJobs,
    };
  }

  static async getSimilarJobs(
    sourceJobId: string,
    options: { limit?: number } = {}
  ): Promise<SimilarJobItem[]> {
    const limit = clampLimit(options.limit ?? DEFAULT_SIMILAR_LIMIT, 1, 20);
    const now = new Date();

    const similarJobs = await prisma.jobSimilarity.findMany({
      where: {
        sourceJobId,
        targetJob: {
          is: buildOpenActiveJobWhere(now),
        },
      },
      orderBy: [{ similarityScore: 'desc' }, { targetJobId: 'asc' }],
      take: limit,
      include: {
        targetJob: {
          select: recommendationJobSelect,
        },
      },
    });

    return similarJobs.map((jobSimilarity) =>
      mapJobToRecommendationCard(jobSimilarity.targetJob, {
        similarityScore: jobSimilarity.similarityScore,
      })
    );
  }

  private static async getProfileFallbackRecommendations(
    userId: string,
    limit: number
  ): Promise<CandidateRecommendationItem[]> {
    const candidateSignals = await prisma.candidate.findUnique({
      where: { userId },
      select: {
        id: true,
        preferredWorkType: true,
        preferredLocationType: true,
        expectedSalaryMin: true,
        expectedSalaryMax: true,
        skills: {
          select: {
            skillId: true,
          },
        },
      },
    });

    if (!candidateSignals) {
      return [];
    }

    const preferences: CandidatePreferenceSignals = {
      candidateId: candidateSignals.id,
      skillIds: candidateSignals.skills.map((skill) => skill.skillId),
      preferredWorkType: candidateSignals.preferredWorkType ?? null,
      preferredLocationType: candidateSignals.preferredLocationType ?? null,
      expectedSalaryMin: toNullableNumber(candidateSignals.expectedSalaryMin),
      expectedSalaryMax: toNullableNumber(candidateSignals.expectedSalaryMax),
    };

    const hasAnySignal =
      preferences.skillIds.length > 0 ||
      preferences.preferredWorkType !== null ||
      preferences.preferredLocationType !== null ||
      preferences.expectedSalaryMin !== null ||
      preferences.expectedSalaryMax !== null;

    if (!hasAnySignal) {
      return [];
    }

    const skillOverlapSql =
      preferences.skillIds.length > 0
        ? Prisma.sql`
            (
              SELECT COUNT(*)
              FROM "job_skills" js
              WHERE js."job_id" = j."id"
                AND js."skill_id" IN (${Prisma.join(preferences.skillIds)})
            )
          `
        : Prisma.sql`0`;

    const workTypeMatchSql =
      preferences.preferredWorkType !== null
        ? Prisma.sql`
            CASE
              WHEN j."job_type"::text = ${preferences.preferredWorkType} THEN 1
              ELSE 0
            END
          `
        : Prisma.sql`0`;

    const locationTypeMatchSql =
      preferences.preferredLocationType !== null
        ? Prisma.sql`
            CASE
              WHEN j."work_location_type"::text = ${preferences.preferredLocationType} THEN 1
              ELSE 0
            END
          `
        : Prisma.sql`0`;

    const salaryOverlapSql = buildSalaryOverlapSql(
      preferences.expectedSalaryMin,
      preferences.expectedSalaryMax
    );

    const rankedRows = await prisma.$queryRaw<RankedProfileRecommendationRow[]>(Prisma.sql`
      ${interactionCtes},
      interacted_jobs AS (
        SELECT job_id
        FROM weighted_interactions
        WHERE user_id = ${userId}
      ),
      ranked_jobs AS (
        SELECT
          j."id" AS job_id,
          ${skillOverlapSql}::int AS skill_overlap_count,
          ${workTypeMatchSql}::int AS work_type_match,
          ${locationTypeMatchSql}::int AS location_type_match,
          ${salaryOverlapSql}::int AS salary_overlap,
          j."published_at" AS published_at
        FROM "jobs" j
        WHERE j."status" = 'ACTIVE'
          AND (j."application_deadline" IS NULL OR j."application_deadline" >= NOW())
          AND NOT EXISTS (
            SELECT 1
            FROM interacted_jobs interacted_job
            WHERE interacted_job.job_id = j."id"
          )
      )
      SELECT job_id
      FROM ranked_jobs
      WHERE skill_overlap_count > 0
         OR work_type_match = 1
         OR location_type_match = 1
         OR salary_overlap = 1
      ORDER BY
        skill_overlap_count DESC,
        work_type_match DESC,
        location_type_match DESC,
        salary_overlap DESC,
        published_at DESC NULLS LAST,
        job_id ASC
      LIMIT ${limit}
    `);

    return loadRecommendationJobs(rankedRows.map((row) => row.job_id));
  }
}
