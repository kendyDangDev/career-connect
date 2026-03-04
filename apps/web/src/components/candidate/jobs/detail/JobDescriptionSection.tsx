'use client';

import { FileText, ListChecks, Gift } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  HTML helpers (same logic as mobile htmlParser)                     */
/* ------------------------------------------------------------------ */
function isHtml(text: string) {
  return /<[^>]+>/.test(text);
}

function sanitize(html: string) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/\s*(onclick|onload|onerror|onmouseover)[^>]*/gi, '')
    .replace(/javascript:/gi, '');
}

interface ParsedSections {
  description?: string;
  requirements?: string;
  benefits?: string;
}

function parseFullContent(content: string): ParsedSections {
  const sectionKeywords: Record<keyof ParsedSections, string[]> = {
    description: [
      'job description',
      'mô tả công việc',
      'about the role',
      'responsibilities',
      'nhiệm vụ',
    ],
    requirements: ['requirements', 'yêu cầu', 'qualifications', 'skills', 'kỹ năng', 'kinh nghiệm'],
    benefits: ['benefits', 'quyền lợi', 'compensation', 'what we offer', 'phúc lợi'],
  };

  const lines = content.split('\n');
  let current: keyof ParsedSections | null = null;
  const buckets: Record<string, string[]> = { description: [], requirements: [], benefits: [] };

  for (const line of lines) {
    const lower = line.toLowerCase().trim();
    for (const [section, keywords] of Object.entries(sectionKeywords)) {
      if (keywords.some((kw) => lower.includes(kw))) {
        current = section as keyof ParsedSections;
        break;
      }
    }
    if (current) buckets[current].push(line);
  }

  return {
    description: buckets.description.join('\n') || undefined,
    requirements: buckets.requirements.join('\n') || undefined,
    benefits: buckets.benefits.join('\n') || undefined,
  };
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                    */
/* ------------------------------------------------------------------ */
function SectionBlock({
  icon,
  title,
  content,
}: {
  icon: React.ReactNode;
  title: string;
  content?: string | null;
}) {
  if (!content) return null;

  const html = isHtml(content);

  return (
    <div className="mt-6 first:mt-0">
      <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900">
        {icon}
        {title}
      </h3>
      {html ? (
        <div
          className="prose prose-gray prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-800 prose-a:text-purple-600 max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitize(content) }}
        />
      ) : (
        <div className="text-sm leading-relaxed whitespace-pre-line text-gray-600">{content}</div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main export                                                       */
/* ------------------------------------------------------------------ */
interface Props {
  description?: string | null;
  requirements?: string | null;
  benefits?: string | null;
  fullContent?: string | null;
}

export default function JobDescriptionSection({
  description,
  requirements,
  benefits,
  fullContent,
}: Props) {
  let desc = description;
  let reqs = requirements;
  let bens = benefits;

  if (fullContent && !description && !requirements && !benefits) {
    const parsed = parseFullContent(fullContent);
    desc = parsed.description ?? null;
    reqs = parsed.requirements ?? null;
    bens = parsed.benefits ?? null;
  }

  if (!desc && !reqs && !bens) return null;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-lg font-bold text-gray-900">Chi tiết công việc</h2>

      <div className="mt-4 divide-y divide-gray-100">
        <SectionBlock
          icon={<FileText className="h-4 w-4 text-purple-500" />}
          title="Mô tả công việc"
          content={desc}
        />
        <SectionBlock
          icon={<ListChecks className="h-4 w-4 text-blue-500" />}
          title="Yêu cầu ứng viên"
          content={reqs}
        />
        <SectionBlock
          icon={<Gift className="h-4 w-4 text-green-500" />}
          title="Quyền lợi"
          content={bens}
        />
      </div>
    </div>
  );
}
