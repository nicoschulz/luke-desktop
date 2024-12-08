import { useState, useEffect, useCallback } from 'react';
import { MCPServer, MCPConnectionStatus } from '../lib/mcp/types';
import { MCPClient } from '../lib/mcp/client';

interface UseMCPServerReturn {
  client: MCPClient | null;
  status: MCPConnectionStatus | null;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendRequest: (endpoint: string, method?: string, body?: any) => Promise<any>;
}

export function useMCPServer(server: MCPServer | null): UseMCPServerReturn {
  const [client, setClient] = useState<MCPClient | null>(null);
  const [status, setStatus] = useState<MCPConnectionStatus | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clean up client when server changes
  useEffect(() => {
    if (client) {
      disconnect();
    }
    if (server) {
      setClient(new MCPClient(server));
    }
  }, [server?.id]);

  const connect = useCallback(async () => {
    if (!client) {
      setError('No server configured');
      return;
    }

    try {
      setConnecting(true);
      setError(null);
      const newStatus = await client.connect();
      setStatus(newStatus);
      
      if (!newStatus.connected) {
        throw new Error(newStatus.error?.message || 'Failed to connect to server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to server');
      throw err;
    } finally {
      setConnecting(false);
    }
  }, [client]);

  const disconnect = useCallback(() => {
    setClient(null);
    setStatus(null);
    setError(null);
  }, []);

  const sendRequest = useCallback(async (endpoint: string, method: string = 'GET', body?: any) => {
    if (!client) {
      throw new Error('No active server connection');
    }

    if (!status?.connected) {
      throw new Error('Server not connected');
    }

    try {
      const response = await client.sendRequest(endpoint, method, body);
      return response.body;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Request failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [client, status]);

  // Attempt to connect when client is first created
  useEffect(() => {
    if (client && !status && !connecting && !error) {
      connect();
    }
  }, [client, status, connecting, error, connect]);

  return {
    client,
    status,
    connecting,
    error,
    connect,
    disconnect,
    sendRequest,
  };
}