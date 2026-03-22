'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { candidateProfileApi } from '@/api/candidate/profile.api';
import { handleApiError } from '@/lib/axios';

interface UseAvatarUploadOptions {
  userId: string;
  initialAvatarUrl?: string | null;
  onUploaded?: (avatarUrl: string) => void;
  onRemoved?: () => void;
}

export function useAvatarUpload({
  userId,
  initialAvatarUrl = null,
  onUploaded,
  onRemoved,
}: UseAvatarUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialAvatarUrl);
  const [error, setError] = useState<string | null>(null);
  const objectPreviewRef = useRef<string | null>(null);

  const revokeObjectPreview = useCallback(() => {
    if (objectPreviewRef.current) {
      URL.revokeObjectURL(objectPreviewRef.current);
      objectPreviewRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isUploading) {
      revokeObjectPreview();
      setPreviewUrl(initialAvatarUrl);
    }
  }, [initialAvatarUrl, isUploading, revokeObjectPreview]);

  useEffect(() => {
    return () => {
      revokeObjectPreview();
    };
  }, [revokeObjectPreview]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const uploadAvatar = useCallback(
    async (file: File) => {
      const previousPreview = previewUrl;

      setError(null);
      setIsUploading(true);
      revokeObjectPreview();

      const localPreviewUrl = URL.createObjectURL(file);
      objectPreviewRef.current = localPreviewUrl;
      setPreviewUrl(localPreviewUrl);

      try {
        const avatarUrl = await candidateProfileApi.uploadAvatar(userId, file);

        revokeObjectPreview();
        setPreviewUrl(avatarUrl);
        onUploaded?.(avatarUrl);

        return avatarUrl;
      } catch (uploadError) {
        revokeObjectPreview();
        setPreviewUrl(previousPreview);
        setError(handleApiError(uploadError));
        throw uploadError;
      } finally {
        setIsUploading(false);
      }
    },
    [onUploaded, previewUrl, revokeObjectPreview, userId]
  );

  const removeAvatar = useCallback(async () => {
    const previousPreview = previewUrl;

    setError(null);
    setIsUploading(true);
    revokeObjectPreview();
    setPreviewUrl(null);

    try {
      await candidateProfileApi.deleteAvatar(userId);
      onRemoved?.();
    } catch (removeError) {
      setPreviewUrl(previousPreview);
      setError(handleApiError(removeError));
      throw removeError;
    } finally {
      setIsUploading(false);
    }
  }, [onRemoved, previewUrl, revokeObjectPreview, userId]);

  return {
    clearError,
    error,
    isUploading,
    previewUrl,
    removeAvatar,
    uploadAvatar,
  };
}
