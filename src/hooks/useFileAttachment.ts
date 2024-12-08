import { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  compressed_size: number;
  mime_type: string;
  created_at: number;
  project_id: string;
  chat_id?: string;
  is_compressed: boolean;
}

export interface AttachmentError {
  kind: string;
  message: string;
}

export function useFileAttachment(projectId: string, chatId?: string) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async () => {
    try {
      setIsUploading(true);
      setError(null);

      const selected = await open({
        multiple: false,
        filters: [{
          name: 'Allowed Files',
          extensions: ['txt', 'md', 'pdf', 'jpg', 'jpeg', 'png', 'gif']
        }]
      });

      if (!selected || Array.isArray(selected)) {
        return null;
      }

      // Get file mime type
      const fileName = selected.toLowerCase();
      let mimeType = 'application/octet-stream';
      if (fileName.endsWith('.txt')) mimeType = 'text/plain';
      if (fileName.endsWith('.md')) mimeType = 'text/markdown';
      if (fileName.endsWith('.pdf')) mimeType = 'application/pdf';
      if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) mimeType = 'image/jpeg';
      if (fileName.endsWith('.png')) mimeType = 'image/png';
      if (fileName.endsWith('.gif')) mimeType = 'image/gif';

      const metadata = await invoke<FileMetadata>('save_attachment', {
        projectId,
        chatId,
        filePath: selected,
        mimeType,
      });

      return metadata;
    } catch (err) {
      const error = err as AttachmentError;
      setError(error.message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const downloadFile = async (fileId: string) => {
    try {
      setIsDownloading(true);
      setError(null);

      const content = await invoke<number[]>('get_attachment', {
        projectId,
        fileId,
      });

      return new Uint8Array(content);
    } catch (err) {
      const error = err as AttachmentError;
      setError(error.message);
      return null;
    } finally {
      setIsDownloading(false);
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      setError(null);
      await invoke('delete_attachment', {
        projectId,
        fileId,
      });
      return true;
    } catch (err) {
      const error = err as AttachmentError;
      setError(error.message);
      return false;
    }
  };

  return {
    uploadFile,
    downloadFile,
    deleteFile,
    isUploading,
    isDownloading,
    error,
  };
}
