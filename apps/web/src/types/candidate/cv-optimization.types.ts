export type CvOptimizationImpact = 'high' | 'medium' | 'low';

export type CvOptimizationTagType = 'skill' | 'keyword' | 'achievement' | 'structure' | 'ats';

export interface CvOptimizationSuggestion {
  title: string;
  impact: CvOptimizationImpact;
  description: string;
  tagType: CvOptimizationTagType;
}

export interface CvOptimizationAnalysis {
  score: number;
  suggestions: CvOptimizationSuggestion[];
}
