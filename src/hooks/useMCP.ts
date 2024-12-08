import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api';
import { MCPServer } from '../lib/mcp/types';

interface UseMCPReturn {
  // Server management
  servers: MCPServer[];
  defaultServer: MCPServer | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  addServer: (server: Omit<MCPServer, 'id' | 'isActive'>) => Promise<MCPServer>;
  updateServer: (server: MCPServer) => Promise<void>;
  removeServer: (id: string) => Promise<void>;
  setDefaultServer: (id: string) => Promise<void>;
  refreshServers: () => Promise<void>;
}

export function useMCP(): UseMCPReturn {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [defaultServer, setDefaultServerState] = useState<MCPServer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshServers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [serverList, defaultServerData] = await Promise.all([
        invoke<MCPServer[]>('get_mcp_servers'),
        invoke<MCPServer | null>('get_default_mcp_server')
      ]);

      setServers(serverList);
      setDefaultServerState(defaultServerData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load MCP servers');
    } finally {
      setLoading(false);
    }
  }, []);

  const addServer = useCallback(async (serverData: Omit<MCPServer, 'id' | 'isActive'>) => {
    try {
      const newServer = await invoke<MCPServer>('add_mcp_server', {
        server: {
          ...serverData,
          id: '', // Will be set by backend
          isActive: false
        }
      });
      
      await refreshServers();
      return newServer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add server';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [refreshServers]);

  const updateServer = useCallback(async (server: MCPServer) => {
    try {
      await invoke('update_mcp_server', { server });
      await refreshServers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update server';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [refreshServers]);

  const removeServer = useCallback(async (id: string) => {
    try {
      await invoke('remove_mcp_server', { id });
      await refreshServers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove server';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [refreshServers]);

  const setDefaultServer = useCallback(async (id: string) => {
    try {
      await invoke('set_default_mcp_server', { id });
      await refreshServers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set default server';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [refreshServers]);

  // Load initial data
  useEffect(() => {
    refreshServers();
  }, [refreshServers]);

  return {
    servers,
    defaultServer,
    loading,
    error,
    addServer,
    updateServer,
    removeServer,
    setDefaultServer,
    refreshServers,
  };
}