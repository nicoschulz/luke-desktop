import React, { useState } from 'react';
import { useMCP, useMCPServer } from '../hooks';
import { MCPServer } from '../lib/mcp/types';

export function MCPTest() {
  const { 
    servers, 
    defaultServer, 
    loading, 
    error: mcpError,
    addServer,
    removeServer,
    setDefaultServer 
  } = useMCP();

  const {
    status,
    connecting,
    error: serverError,
    sendRequest
  } = useMCPServer(defaultServer);

  const [newServerUrl, setNewServerUrl] = useState('');
  const [newServerName, setNewServerName] = useState('');

  const handleAddServer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addServer({
        name: newServerName,
        url: newServerUrl,
        token: null,
        last_connected: null
      });
      setNewServerUrl('');
      setNewServerName('');
    } catch (err) {
      console.error('Failed to add server:', err);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">MCP Servers</h2>
      
      {(mcpError || serverError) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {mcpError || serverError}
        </div>
      )}

      <form onSubmit={handleAddServer} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newServerName}
            onChange={(e) => setNewServerName(e.target.value)}
            placeholder="Server Name"
            className="border p-2 rounded"
          />
          <input
            type="text"
            value={newServerUrl}
            onChange={(e) => setNewServerUrl(e.target.value)}
            placeholder="Server URL"
            className="border p-2 rounded"
          />
          <button 
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Server
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {servers.map((server) => (
          <div 
            key={server.id}
            className="border p-4 rounded flex items-center justify-between"
          >
            <div>
              <h3 className="font-bold">{server.name}</h3>
              <p className="text-gray-600">{server.url}</p>
              {defaultServer?.id === server.id && (
                <span className="text-green-600 text-sm">Default Server</span>
              )}
            </div>
            <div className="space-x-2">
              <button
                onClick={() => setDefaultServer(server.id)}
                className="bg-green-500 text-white px-3 py-1 rounded"
                disabled={defaultServer?.id === server.id}
              >
                Set Default
              </button>
              <button
                onClick={() => removeServer(server.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {status && (
        <div className="mt-4 p-4 border rounded">
          <h3 className="font-bold">Connection Status</h3>
          <p>Connected: {status.connected ? 'Yes' : 'No'}</p>
          <p>Last Checked: {status.lastChecked}</p>
          {status.error && (
            <p className="text-red-600">Error: {status.error.message}</p>
          )}
        </div>
      )}
    </div>
  );
}