import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { FileMetadata } from './useFileAttachment';

export function useConversationAttachments(conversationId: string) {
  const [attachments, setAttachments] = useState<FileMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAttachments();
  }, [conversationId]);

  const loadAttachments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await invoke<FileMetadata[]>('get_conversation_attachments', {
        conversationId,
      });
      setAttachments(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const addAttachment = async (attachment: FileMetadata) => {
    try {
      setError(null);
      await invoke('add_conversation_attachment', {
        conversationId,
        attachmentId: attachment.id,
      });
      setAttachments([...attachments, attachment]);
      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    }
  };

  const removeAttachment = async (attachmentId: string) => {
    try {
      setError(null);
      await invoke('remove_conversation_attachment', {
        conversationId,
        attachmentId,
      });
      setAttachments(attachments.filter(a => a.id !== attachmentId));
      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    }
  };

  return {
    attachments,
    isLoading,
    error,
    addAttachment,
    removeAttachment,
    refresh: loadAttachments,
  };
}
