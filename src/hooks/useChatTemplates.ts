import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import type { ChatTemplate } from '../lib/types/chat';

export function useChatTemplates() {
  const [templates, setTemplates] = useState<ChatTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        const data = await invoke<ChatTemplate[]>('get_chat_templates');
        setTemplates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load templates');
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const createTemplate = useCallback(async (
    name: string,
    description: string,
    initialMessage: string
  ) => {
    try {
      const templateId = await invoke<string>('create_chat_template', {
        name,
        description,
        initialMessage
      });

      const newTemplate: ChatTemplate = {
        id: templateId,
        name,
        description,
        initialMessage,
        createdAt: new Date().toISOString()
      };

      setTemplates(prev => [...prev, newTemplate]);
      return templateId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
      throw err;
    }
  }, []);

  const useTemplate = useCallback(async (templateId: string, projectId: string) => {
    try {
      const chatId = await invoke<string>('use_chat_template', {
        templateId,
        projectId
      });
      return chatId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to use template');
      throw err;
    }
  }, []);

  const deleteTemplate = useCallback(async (templateId: string) => {
    try {
      await invoke('delete_chat_template', { templateId });
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
      throw err;
    }
  }, []);

  const updateTemplate = useCallback(async (
    templateId: string,
    updates: Partial<Omit<ChatTemplate, 'id' | 'createdAt'>>
  ) => {
    try {
      await invoke('update_chat_template', { templateId, updates });
      setTemplates(prev => prev.map(t =>
        t.id === templateId ? { ...t, ...updates } : t
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update template');
      throw err;
    }
  }, []);

  return {
    templates,
    loading,
    error,
    createTemplate,
    useTemplate,
    deleteTemplate,
    updateTemplate
  };
}
