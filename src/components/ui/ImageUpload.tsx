import { useRef, useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn, isValidImageType, isValidFileSize } from '@/lib/utils';
import { Spinner } from './Spinner';

interface ImageUploadProps {
  currentUrl?: string | null;
  onUpload: (file: File) => Promise<string | null>;
  onRemove?: () => Promise<void>;
  className?: string;
}

export function ImageUpload({ currentUrl, onUpload, onRemove, className }: ImageUploadProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!isValidImageType(file)) {
        setError('Please upload a JPG, PNG, or WebP image');
        return;
      }

      if (!isValidFileSize(file)) {
        setError('File size must be under 5MB');
        return;
      }

      // Show preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      setUploading(true);
      try {
        const url = await onUpload(file);
        if (url) {
          setPreview(url);
        }
      } catch {
        setError('Upload failed. Please try again.');
        setPreview(currentUrl ?? null);
      } finally {
        setUploading(false);
      }
    },
    [onUpload, currentUrl]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) void handleFile(file);
    },
    [handleFile]
  );

  const handleRemove = useCallback(async () => {
    if (onRemove) {
      await onRemove();
    }
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  }, [onRemove]);

  return (
    <div className={cn('space-y-2', className)}>
      {preview ? (
        <div className="relative group rounded-brand overflow-hidden border border-brand-cream-300">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Spinner className="text-white" size={32} />
            </div>
          )}
          <div className="absolute top-2 end-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="p-1.5 bg-white/90 rounded-full shadow-brand-sm hover:bg-white transition-colors"
              title={t('common.uploadImage')}
            >
              <Upload size={14} className="text-brand-olive" />
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={() => void handleRemove()}
                className="p-1.5 bg-white/90 rounded-full shadow-brand-sm hover:bg-red-50 transition-colors"
                title={t('common.removeImage')}
              >
                <X size={14} className="text-red-600" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          className={cn(
            'flex flex-col items-center justify-center gap-3 h-48',
            'rounded-brand border-2 border-dashed cursor-pointer',
            'transition-all duration-200',
            dragOver
              ? 'border-brand-olive bg-brand-olive-50'
              : 'border-brand-cream-300 bg-brand-cream-50 hover:border-brand-olive-300 hover:bg-brand-cream-100'
          )}
        >
          {uploading ? (
            <Spinner size={32} />
          ) : (
            <>
              <ImageIcon size={32} className="text-brand-olive-300" />
              <div className="text-center">
                <p className="text-sm font-medium text-brand-olive-500">
                  {t('common.dragOrClick')}
                </p>
                <p className="text-xs text-brand-olive-300 mt-1">
                  {t('common.supportedFormats')} · {t('common.maxFileSize')}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      {error && (
        <p className="text-xs text-red-600 animate-fade-in">{error}</p>
      )}
    </div>
  );
}
