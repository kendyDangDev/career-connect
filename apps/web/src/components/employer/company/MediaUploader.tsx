import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaUploaderProps {
  type: 'logo' | 'cover' | 'gallery';
  currentImage?: string;
  onUpload: (file: File) => void;
  onRemove?: () => void;
  maxSize?: number; // in MB
}

export function MediaUploader({ type, currentImage, onUpload, onRemove, maxSize = 5 }: MediaUploaderProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File quá lớn. Kích thước tối đa là ${maxSize}MB`);
        return;
      }
      onUpload(file);
    }
  };

  const config = {
    logo: {
      title: 'Logo công ty',
      description: 'Tải lên logo của công ty (PNG, JPG)',
      aspectRatio: 'aspect-square',
      size: 'h-32 w-32',
    },
    cover: {
      title: 'Ảnh bìa',
      description: 'Ảnh bìa cho trang công ty (1200x400px)',
      aspectRatio: 'aspect-[3/1]',
      size: 'h-48 w-full',
    },
    gallery: {
      title: 'Thêm ảnh',
      description: 'Thêm ảnh vào thư viện',
      aspectRatio: 'aspect-video',
      size: 'h-48 w-full',
    },
  }[type];

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{config.title}</h3>
        <p className="text-xs text-gray-500 mt-1">{config.description}</p>
      </div>

      <div className={cn('relative group', config.size)}>
        {currentImage ? (
          <>
            <img
              src={currentImage}
              alt={config.title}
              className={cn('h-full w-full object-cover rounded-xl border-2 border-gray-200', config.aspectRatio)}
            />
            {onRemove && (
              <button
                onClick={onRemove}
                className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <label
              htmlFor={`upload-${type}`}
              className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-white mb-2" />
                <span className="text-sm font-medium text-white">Thay đổi</span>
              </div>
            </label>
          </>
        ) : (
          <label
            htmlFor={`upload-${type}`}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-purple-300 bg-purple-50/50 transition-all hover:border-purple-400 hover:bg-purple-50',
              config.aspectRatio,
              config.size
            )}
          >
            <ImageIcon className="h-10 w-10 text-purple-400 mb-3" />
            <span className="text-sm font-medium text-purple-700">Tải lên {config.title.toLowerCase()}</span>
            <span className="text-xs text-gray-500 mt-1">PNG, JPG tối đa {maxSize}MB</span>
          </label>
        )}

        <input
          id={`upload-${type}`}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
