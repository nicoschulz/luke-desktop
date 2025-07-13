import { useState, useEffect } from 'react';
import { FileMetadata } from './useFileAttachment';

export function useConversationAttachments(conversationId: string) {
  const [attachments, setAttachments] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAttachments = async () => {
      setLoading(true);
      try {
        // const result = await invoke<FileMetadata[]>('get_conversation_attachments', {
        const result = await Promise.resolve([] as FileMetadata[]);
        //   conversationId
        // });
        setAttachments(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load attachments');
      } finally {
        setLoading(false);
      }
    };

    if (conversationId) {
      loadAttachments();
    }
  }, [conversationId]);

  return {
    attachments,
    loading,
    error
  };
}
