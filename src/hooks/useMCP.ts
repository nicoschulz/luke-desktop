import { useState, useEffect, useCallback } from 'react';
import { MCPServer } from '../lib/mcp/types';

interface UseMCPReturn {
  servers: MCPServer[];
  defaultServer: MCPServer | null;
  loading: boolean;
  error: string | null;
  addServer: (server: Omit<MCPServer, 'id' | 'isActive'>) => Promise<void>;
  removeServer: (serverId: string) => Promise<void>;
  setDefaultServer: (serverId: string) => Promise<void>;
  refreshServers: () => Promise<void>;
}

export function useMCP(): UseMCPReturn {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [defaultServer, setDefaultServer] = useState<MCPServer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadServers = useCallback(async () => {
    setLoading(true);
    try {
      const [serverList, defaultServerData] = await Promise.all([
        // invoke<MCPServer[]>('get_mcp_servers'),
        Promise.resolve([] as MCPServer[]),
        // invoke<MCPServer | null>('get_default_mcp_server')
        Promise.resolve(null as MCPServer | null)
      ]);

      setServers(serverList);
      setDefaultServer(defaultServerData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load servers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServers();
  }, [loadServers]);

  const addServer = useCallback(async (server: Omit<MCPServer, 'id' | 'isActive'>) => {
    try {
      setError(null);
      // const newServer = await invoke<MCPServer>('add_mcp_server', {
      const newServer = await Promise.resolve({
        id: 'dummy-server-id',
        isActive: false,
        ...server
      } as MCPServer);
      //   name: server.name,
      //   description: server.description,
      //   command: server.command,
      //   args: server.args,
      //   env: server.env,
      //   cwd: server.cwd,
      //   token: server.token
      // });

      setServers(prev => [...prev, newServer]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add server');
      throw err;
    }
  }, []);

  const removeServer = useCallback(async (serverId: string) => {
    try {
      setError(null);
      // await invoke('remove_mcp_server', { serverId });
      await Promise.resolve();
      setServers(prev => prev.filter(s => s.id !== serverId));
      if (defaultServer?.id === serverId) {
        setDefaultServer(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove server');
      throw err;
    }
  }, [defaultServer]);

  const setDefaultServerCallback = useCallback(async (serverId: string) => {
    try {
      setError(null);
      // await invoke('set_default_mcp_server', { serverId });
      await Promise.resolve();
      const server = servers.find(s => s.id === serverId);
      if (server) {
        setDefaultServer(server);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set default server');
      throw err;
    }
  }, [servers]);

  return {
    servers,
    defaultServer,
    loading,
    error,
    addServer,
    removeServer,
    setDefaultServer: setDefaultServerCallback,
    refreshServers: loadServers
  };
}