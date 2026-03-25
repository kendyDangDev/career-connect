const CANDIDATE_SEARCH_HISTORY_TABLE = 'candidate_search_history';
const warnedOperations = new Set<string>();

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function includesHistoryTableName(value: unknown): boolean {
  return (
    typeof value === 'string' &&
    value.toLowerCase().includes(CANDIDATE_SEARCH_HISTORY_TABLE)
  );
}

export function isCandidateSearchHistoryTableMissingError(error: unknown): boolean {
  if (!isObject(error)) {
    return false;
  }

  const code = error.code;
  const message = error.message;
  const meta = isObject(error.meta) ? error.meta : null;

  if (code === 'P2021') {
    return includesHistoryTableName(meta?.table) || includesHistoryTableName(message);
  }

  if (code === 'P2010') {
    return (
      meta?.code === '42P01' &&
      (includesHistoryTableName(meta?.message) || includesHistoryTableName(message))
    );
  }

  return false;
}

function warnMissingCandidateSearchHistoryTable(operation: string) {
  if (warnedOperations.has(operation)) {
    return;
  }

  warnedOperations.add(operation);

  console.warn(
    `[CandidateSearchHistory] Skipping ${operation} because the ${CANDIDATE_SEARCH_HISTORY_TABLE} table is missing. Apply the pending Prisma migration to enable this feature.`
  );
}

export async function withCandidateSearchHistoryFallback<T>(
  operation: string,
  action: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (!isCandidateSearchHistoryTableMissingError(error)) {
      throw error;
    }

    warnMissingCandidateSearchHistoryTable(operation);
    return fallback;
  }
}
