'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { getSupabaseBrowserClient } from '../lib/supabase/client';

interface AvatarUploadProps {
  readonly userId: string;
  readonly currentAvatarUrl: string | null;
  readonly fallbackInitial: string;
  readonly onUploadSuccess: (newUrl: string) => void;
}

export default function AvatarUpload({
  userId,
  currentAvatarUrl,
  fallbackInitial,
  onUploadSuccess,
}: AvatarUploadProps): JSX.Element {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    setErrorMessage(null);

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('File harus berupa gambar');
      return;
    }

    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrorMessage('Ukuran file maksimal 5MB');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async (): Promise<void> => {
    if (!selectedFile) return;

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('userId', userId);

      const response = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error ?? 'Gagal mengupload foto');
        setIsUploading(false);
        return;
      }

      const supabase = getSupabaseBrowserClient();
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: result.url })
        .eq('id', userId);

      if (updateError) {
        setErrorMessage('Foto terupload tapi gagal disimpan ke profil');
        setIsUploading(false);
        return;
      }

      onUploadSuccess(result.url);
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      setErrorMessage('Terjadi kesalahan, coba lagi');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = (): void => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayUrl = previewUrl ?? currentAvatarUrl;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-lg font-semibold text-base-surface">
          {displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={displayUrl} alt="Foto profil" className="h-full w-full object-cover" />
          ) : (
            fallbackInitial
          )}
        </div>

        <label
          htmlFor="avatar-file-input"
          className="absolute -bottom-1 -right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-base-surface shadow-floating-sm"
        >
          <i className="ti ti-camera text-[10px] text-text-secondary" aria-hidden="true" />
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="avatar-file-input"
        />
      </div>

      {selectedFile && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void handleUpload()}
            disabled={isUploading}
            className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-base-surface disabled:opacity-60"
          >
            {isUploading ? '...' : 'Simpan'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isUploading}
            className="rounded-full bg-base-bg px-3 py-1 text-xs font-medium text-text-secondary disabled:opacity-60"
          >
            Batal
          </button>
        </div>
      )}

      {errorMessage && <p className="text-xs text-status-incorrect">{errorMessage}</p>}
    </div>
  );
}
