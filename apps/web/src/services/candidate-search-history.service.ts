import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { withCandidateSearchHistoryFallback } from './candidate-search-history.fallback';

const DEFAULT_RECENT_SEARCH_LIMIT = 5;
const MAX_RECENT_SEARCH_LIMIT = 10;
const MIN_TRACKABLE_KEYWORD_LENGTH = 3;

interface RecentSearchRow {
  id: string;
  keyword: string;
  normalized_keyword: string;
  searched_at: Date;
}

export interface CandidateSearchHistoryItem {
  id: string;
  keyword: string;
  normalizedKeyword: string;
  searchedAt: string;
}

export class CandidateSearchHistoryService {
  static sanitizeKeyword(keyword: string) {
    return keyword.trim().replace(/\s+/g, ' ');
  }

  static normalizeKeyword(keyword: string) {
    return this.sanitizeKeyword(keyword).toLocaleLowerCase();
  }

  static isTrackableKeyword(keyword: string) {
    return this.normalizeKeyword(keyword).length >= MIN_TRACKABLE_KEYWORD_LENGTH;
  }

  static async recordSearch(candidateId: string, keyword: string) {
    const sanitizedKeyword = this.sanitizeKeyword(keyword);
    const normalizedKeyword = this.normalizeKeyword(keyword);

    if (normalizedKeyword.length < MIN_TRACKABLE_KEYWORD_LENGTH) {
      return { recorded: false as const, search: null };
    }

    const search = await withCandidateSearchHistoryFallback(
      'record candidate search history',
      async () =>
        prisma.candidateSearchHistory.create({
          data: {
            candidateId,
            keyword: sanitizedKeyword,
            normalizedKeyword,
          },
        }),
      null
    );

    if (!search) {
      return { recorded: false as const, search: null };
    }

    return {
      recorded: true as const,
      search: this.mapSearch(search),
    };
  }

  static async getRecentSearches(candidateId: string, limit = DEFAULT_RECENT_SEARCH_LIMIT) {
    const safeLimit = Math.min(Math.max(limit, 1), MAX_RECENT_SEARCH_LIMIT);

    const rows = await withCandidateSearchHistoryFallback(
      'read candidate search history',
      () =>
        prisma.$queryRaw<RecentSearchRow[]>(Prisma.sql`
          WITH distinct_searches AS (
            SELECT DISTINCT ON ("normalized_keyword")
              "id",
              "keyword",
              "normalized_keyword",
              "searched_at"
            FROM "candidate_search_history"
            WHERE "candidate_id" = ${candidateId}
            ORDER BY "normalized_keyword" ASC, "searched_at" DESC
          )
          SELECT
            id,
            keyword,
            normalized_keyword,
            searched_at
          FROM distinct_searches
          ORDER BY searched_at DESC
          LIMIT ${safeLimit}
        `),
      [] as RecentSearchRow[]
    );

    return rows.map((row) => ({
      id: row.id,
      keyword: row.keyword,
      normalizedKeyword: row.normalized_keyword,
      searchedAt: row.searched_at.toISOString(),
    }));
  }

  private static mapSearch(search: {
    id: string;
    keyword: string;
    normalizedKeyword: string;
    searchedAt: Date;
  }): CandidateSearchHistoryItem {
    return {
      id: search.id,
      keyword: search.keyword,
      normalizedKeyword: search.normalizedKeyword,
      searchedAt: search.searchedAt.toISOString(),
    };
  }
}
