'use client';

import { Code2 } from 'lucide-react';
import type { JobSkill } from './JobDetailPage';

const levelLabel: Record<string, string> = {
  REQUIRED: 'Bắt buộc',
  PREFERRED: 'Ưu tiên',
  OPTIONAL: 'Không bắt buộc',
};

const levelColor: Record<string, string> = {
  REQUIRED: 'bg-red-50 text-red-600 ring-red-100',
  PREFERRED: 'bg-yellow-50 text-yellow-700 ring-yellow-100',
  OPTIONAL: 'bg-gray-50 text-gray-500 ring-gray-200',
};

export default function JobSkillsSection({ skills }: { skills: JobSkill[] }) {
  if (!skills.length) return null;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
        <Code2 className="h-4 w-4 text-purple-500" />
        Kỹ năng yêu cầu
      </h3>

      <div className="space-y-3">
        {skills.map((js) => (
          <div
            key={js.id}
            className="flex items-center justify-between rounded-xl bg-gray-50/60 px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">{js.skill.name}</p>
              <p className="mt-0.5 text-xs text-gray-500">
                {js.minYearsExperience != null && js.minYearsExperience > 0
                  ? `${js.minYearsExperience}+ năm kinh nghiệm`
                  : ''}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${
                levelColor[js.requiredLevel] ?? levelColor.OPTIONAL
              }`}
            >
              {levelLabel[js.requiredLevel] ?? js.requiredLevel}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
