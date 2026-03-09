import React from 'react';

export default function PageHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Bộ câu hỏi phỏng vấn</h1>
        <p className="text-slate-500 mt-1">
          1,284 bộ câu hỏi đang hoạt động trong hệ thống
        </p>
      </div>
      <button className="px-5 py-2.5 bg-purple-100 text-purple-700 font-bold rounded-lg hover:bg-purple-200 transition-all dark:bg-purple-900/30 dark:text-purple-400">
        Tất cả bộ đề
      </button>
    </div>
  );
}
