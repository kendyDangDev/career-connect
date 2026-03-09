'use client';

import React from 'react';

interface JDInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function JDInput({ value, onChange }: JDInputProps) {
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Dán mô tả công việc (Job Description) vào đây...

Ví dụ:
- Vị trí: Frontend Developer
- Yêu cầu: React, TypeScript, 3+ năm kinh nghiệm
- Mô tả công việc chi tiết..."
        rows={8}
        className="w-full px-4 py-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl
          text-slate-800 dark:text-slate-200 placeholder:text-slate-400
          focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none transition-all resize-none"
      />
      <div className="flex justify-between mt-2">
        <p className="text-xs text-slate-400">
          Nhập càng chi tiết, bộ câu hỏi càng chính xác
        </p>
        <p className={`text-xs font-medium ${value.length > 50 ? 'text-green-500' : 'text-slate-400'}`}>
          {value.length} ký tự
        </p>
      </div>
    </div>
  );
}
