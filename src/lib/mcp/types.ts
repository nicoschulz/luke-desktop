export interface MCPServer {
  id: string;
  name: string;
  url: string;
  token?: string;
  isActive: boolean;
  lastConnected?: string;
}

export interface MCPConfig {
  version: string;
  defaultServer: string | null;
  servers: MCPServer[];
}

export interface MCPResponse {
  status: number;
  body: any;
  headers: Record<string, string>;
}

export interface MCPError {
  code: string;
  message: string;
  details?: any;
}

export interface MCPConnectionStatus {
  connected: boolean;
  error?: MCPError;
  lastChecked: string;
}