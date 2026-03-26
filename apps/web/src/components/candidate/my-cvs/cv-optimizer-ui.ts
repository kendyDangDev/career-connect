import type { LucideIcon } from 'lucide-react';
import { BarChart3, CheckCircle2, FileText, Search, Sparkles } from 'lucide-react';

import type {
  CvOptimizationImpact,
  CvOptimizationSuggestion,
  CvOptimizationTagType,
} from '@/types/candidate/cv-optimization.types';

export interface PriorityConfig {
  badgeLabel: string;
  badgeClassName: string;
  order: number;
}

export interface ScoreConfig {
  badgeClassName: string;
  ringClassName: string;
  label: string;
  textClassName: string;
}

export interface TagMeta {
  actionLabel: string;
  icon: LucideIcon;
  label: string;
  summaryLabel: string;
}

export interface SuggestionDiff {
  after: string;
  before: string;
  why: string;
}

export const SCORE_RING_RADIUS = 42;
export const SCORE_RING_CIRCUMFERENCE = 2 * Math.PI * SCORE_RING_RADIUS;

export function clampScore(score: number | null): number {
  if (score === null) {
    return 0;
  }

  return Math.max(0, Math.min(score, 100));
}

function formatFocusAreas(values: string[]): string {
  if (!values.length) return '';
  if (values.length === 1) return values[0];

  return `${values[0]} và ${values[1]}`;
}

export function getPriorityConfig(impact: CvOptimizationImpact): PriorityConfig {
  switch (impact) {
    case 'high':
      return {
        badgeLabel: 'Ưu tiên cao',
        badgeClassName:
          'bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:ring-rose-900/70',
        order: 0,
      };
    case 'medium':
      return {
        badgeLabel: 'Ưu tiên vừa',
        badgeClassName:
          'bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:ring-amber-900/70',
        order: 1,
      };
    default:
      return {
        badgeLabel: 'Ưu tiên thấp',
        badgeClassName:
          'bg-sky-100 text-sky-700 ring-1 ring-inset ring-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:ring-sky-900/70',
        order: 2,
      };
  }
}

export function getScoreConfig(score: number | null): ScoreConfig {
  if (score === null) {
    return {
      badgeClassName: 'bg-white/8 text-slate-200 ring-1 ring-inset ring-white/10',
      ringClassName: 'stroke-violet-300',
      label: 'Chưa đánh giá',
      textClassName: 'text-white',
    };
  }

  if (score >= 80) {
    return {
      badgeClassName:
        'bg-emerald-400/12 text-emerald-200 ring-1 ring-inset ring-emerald-300/25',
      ringClassName: 'stroke-emerald-300',
      label: 'Rất tốt',
      textClassName: 'text-emerald-50',
    };
  }

  if (score >= 60) {
    return {
      badgeClassName:
        'bg-violet-400/12 text-violet-100 ring-1 ring-inset ring-violet-300/25',
      ringClassName: 'stroke-violet-300',
      label: 'Khá tốt',
      textClassName: 'text-violet-50',
    };
  }

  return {
    badgeClassName: 'bg-rose-400/12 text-rose-100 ring-1 ring-inset ring-rose-300/25',
    ringClassName: 'stroke-rose-300',
    label: 'Cần tối ưu',
    textClassName: 'text-rose-50',
  };
}

export function getTagMeta(tagType: CvOptimizationTagType): TagMeta {
  switch (tagType) {
    case 'skill':
      return {
        actionLabel: 'Bổ sung nhóm kỹ năng cụ thể theo đúng phạm vi công việc.',
        icon: Sparkles,
        label: 'Kỹ năng',
        summaryLabel: 'kỹ năng',
      };
    case 'keyword':
      return {
        actionLabel: 'Thêm từ khóa sát JD để ATS nhận diện đúng hơn.',
        icon: Search,
        label: 'Từ khóa',
        summaryLabel: 'từ khóa ATS',
      };
    case 'achievement':
      return {
        actionLabel: 'Định lượng kết quả để làm rõ giá trị bạn tạo ra.',
        icon: BarChart3,
        label: 'Thành tựu',
        summaryLabel: 'thành tựu',
      };
    case 'ats':
      return {
        actionLabel: 'Chuẩn hóa định dạng để CV dễ đọc và dễ parse.',
        icon: CheckCircle2,
        label: 'Định dạng',
        summaryLabel: 'định dạng ATS',
      };
    default:
      return {
        actionLabel: 'Sắp lại cấu trúc để recruiter đọc lướt nhanh hơn.',
        icon: FileText,
        label: 'Cấu trúc',
        summaryLabel: 'cấu trúc CV',
      };
  }
}

export function getSuggestionDiff(tagType: CvOptimizationTagType): SuggestionDiff {
  switch (tagType) {
    case 'achievement':
      return {
        before: 'Tham gia phát triển chức năng thanh toán cho sản phẩm.',
        after: 'Phát triển chức năng thanh toán giúp giảm 18% thời gian checkout và giảm 12% lỗi giao dịch.',
        why: 'Số liệu giúp nhà tuyển dụng thấy rõ mức tác động thay vì chỉ thấy bạn đã tham gia.',
      };
    case 'skill':
      return {
        before: 'Testing, teamwork, automation.',
        after: 'Playwright, Selenium, API testing, test reporting, CI/CD pipeline.',
        why: 'Tên công cụ và phạm vi kỹ năng cụ thể giúp ATS match tốt hơn và thể hiện kinh nghiệm thực chiến.',
      };
    case 'keyword':
      return {
        before: 'Làm việc với backend và triển khai hệ thống.',
        after: 'REST API, Docker, CI/CD, Microservices, Agile Scrum.',
        why: 'Từ khóa sát JD giúp CV được hệ thống lọc và recruiter tìm thấy nhanh hơn.',
      };
    case 'ats':
      return {
        before: 'Icon nhiều, tiêu đề tùy ý, các mục trình bày không đồng nhất.',
        after: 'Kinh nghiệm làm việc | Kỹ năng | Học vấn | Dự án | Chứng chỉ.',
        why: 'Cấu trúc rõ ràng giúp ATS bóc tách nội dung ổn định và hạn chế mất dữ liệu quan trọng.',
      };
    default:
      return {
        before: 'Một đoạn dài gộp cả bối cảnh, nhiệm vụ, công cụ và kết quả.',
        after: '3 bullet ngắn: bối cảnh, hành động chính, kết quả đạt được.',
        why: 'Cách trình bày theo lớp giúp recruiter quét nhanh và không bỏ sót ý chính.',
      };
  }
}

export function getSuggestionSectionId(tagType: CvOptimizationTagType): string {
  return `optimizer-section-${tagType}`;
}

export function getScoreInsight(
  score: number | null,
  suggestions: CvOptimizationSuggestion[]
): string {
  const prioritizedAreas = Array.from(
    new Set(
      suggestions
        .filter((suggestion) => suggestion.impact === 'high')
        .map((suggestion) => getTagMeta(suggestion.tagType).summaryLabel)
    )
  );
  const fallbackAreas = Array.from(
    new Set(suggestions.map((suggestion) => getTagMeta(suggestion.tagType).summaryLabel))
  );
  const focusAreas = formatFocusAreas(
    (prioritizedAreas.length ? prioritizedAreas : fallbackAreas).slice(0, 2)
  );

  if (score === null) {
    return 'Chọn một CV để AI chấm điểm và chỉ ra những phần cần sửa đầu tiên.';
  }

  if (score >= 80) {
    return focusAreas
      ? `CV đã khá mạnh, chỉ cần trau chuốt thêm ${focusAreas}.`
      : 'CV đã khá mạnh, chỉ cần tinh chỉnh nhẹ trước khi gửi.';
  }

  if (score >= 60) {
    return focusAreas
      ? `CV ổn nhưng vẫn còn thiếu chiều sâu ở ${focusAreas}.`
      : 'CV ổn nhưng vẫn còn vài điểm cần siết lại trước khi nộp.';
  }

  return focusAreas
    ? `Ưu tiên xử lý ${focusAreas} để CV rõ ràng hơn và dễ vượt ATS.`
    : 'Ưu tiên rút gọn, chuẩn hóa và bổ sung chi tiết tác động cho CV.';
}
