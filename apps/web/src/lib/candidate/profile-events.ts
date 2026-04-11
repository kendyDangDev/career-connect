export const CANDIDATE_PROFILE_CHANGED_EVENT = 'candidate-profile:changed';

export type CandidateProfileChangedDetail = {
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
};

export function dispatchCandidateProfileChanged(detail: CandidateProfileChangedDetail) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<CandidateProfileChangedDetail>(CANDIDATE_PROFILE_CHANGED_EVENT, {
      detail,
    })
  );
}
