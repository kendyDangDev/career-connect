'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X, FileText } from 'lucide-react';

interface CVUploaderProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export default function CVUploader({ onFileSelect, selectedFile }: CVUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    if (file.type !== 'application/pdf') {
      setError('Chỉ chấp nhận file PDF');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File không được vượt quá 10MB');
      return false;
    }
    setError(null);
    return true;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && validateFile(file)) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
    }
  };

  const handleRemove = () => {
    onFileSelect(null);
    setError(null);
  };

  if (selectedFile) {
    return (
      <div className="border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <FileText className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 dark:text-white truncate">{selectedFile.name}</p>
            <p className="text-xs text-slate-500">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • PDF
            </p>
          </div>
          <button
            onClick={handleRemove}
            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        className={`
          border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
          ${isDragOver
            ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/10'
            : 'border-slate-200 dark:border-slate-700 hover:border-purple-400 hover:bg-purple-50/30 dark:hover:bg-purple-900/5'
          }
        `}
        onClick={() => document.getElementById('cv-file-input')?.click()}
      >
        <div className="flex flex-col items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
            isDragOver ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-slate-100 dark:bg-slate-800'
          }`}>
            <Upload className={`w-7 h-7 ${isDragOver ? 'text-purple-600' : 'text-slate-400'}`} />
          </div>
          <div>
            <p className="font-bold text-slate-700 dark:text-slate-300">
              Kéo & thả CV vào đây
            </p>
            <p className="text-sm text-slate-400 mt-1">
              hoặc <span className="text-purple-600 font-semibold">chọn file</span> từ máy tính
            </p>
          </div>
          <p className="text-xs text-slate-400">Chỉ chấp nhận file PDF, tối đa 10MB</p>
        </div>
        <input
          id="cv-file-input"
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}
