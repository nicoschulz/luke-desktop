import { useState, useEffect, useCallback } from 'react';
import type { ChatTemplate } from '../lib/types/chat';

export function useChatTemplates() {
  const [templates, setTemplates] = useState<ChatTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      // const data = await invoke<ChatTemplate[]>('get_chat_templates');
      const data = await Promise.resolve([] as ChatTemplate[]);
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const createTemplate = useCallback(async (template: Omit<ChatTemplate, 'id'>) => {
    try {
      setError(null);
      // const templateId = await invoke<string>('create_chat_template', {
      const templateId = await Promise.resolve('dummy-template-id');
      //   name: template.name,
      //   description: template.description,
      //   systemPrompt: template.systemPrompt,
      //   variables: template.variables
      // });
      
      const newTemplate: ChatTemplate = {
        id: templateId,
        ...template
      };
      
      setTemplates(prev => [...prev, newTemplate]);
      return templateId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
      throw err;
    }
  }, []);

  const useTemplate = useCallback(async (_templateId: string, _variables?: Record<string, string>) => {
    try {
      setError(null);
      // const chatId = await invoke<string>('use_chat_template', {
      const chatId = await Promise.resolve('dummy-chat-id');
      //   templateId,
      //   variables
      // });
      return chatId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to use template');
      throw err;
    }
  }, []);

  return {
    templates,
    loading,
    error,
    createTemplate,
    useTemplate,
    refreshTemplates: loadTemplates
  };
}
