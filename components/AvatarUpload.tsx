'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { supabase } from '@/lib/supabase';

interface AvatarUploadProps {
  readonly currentAvatarUrl: string | null;
  readonly onUploadSuccess: (newUrl: string) => void;
}

export default function AvatarUpload({
  currentAvatarUrl,
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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrorMessage('Kamu harus login untuk mengganti foto profil');
        setIsUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('userId', user.id);

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

      // Simpan URL baru ke tabel profiles
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: result.url })
        .eq('id', user.id);

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
    <div className="flex flex-col items-center gap-3">
      <div className="h-24 w-24 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayUrl}
            alt="Foto profil"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            ?
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id="avatar-file-input"
      />

      {!selectedFile ? (
        <label
          htmlFor="avatar-file-input"
          className="cursor-pointer rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Pilih Foto
        </label>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isUploading ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isUploading}
            className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
          >
            Batal
          </button>
        </div>
      )}

      {errorMessage && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}
    </div>
  );
      }
