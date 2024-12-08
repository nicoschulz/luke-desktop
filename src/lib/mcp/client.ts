import { MCPServer, MCPResponse, MCPError, MCPConnectionStatus } from './types';

export class MCPClient {
  private server: MCPServer;
  private status: MCPConnectionStatus;

  constructor(server: MCPServer) {
    this.server = server;
    this.status = {
      connected: false,
      lastChecked: new Date().toISOString()
    };
  }

  async connect(): Promise<MCPConnectionStatus> {
    try {
      const response = await fetch(`${this.server.url}/health`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      this.status = {
        connected: true,
        lastChecked: new Date().toISOString()
      };

      return this.status;
    } catch (error) {
      this.status = {
        connected: false,
        error: {
          code: 'CONNECTION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        },
        lastChecked: new Date().toISOString()
      };
      return this.status;
    }
  }

  private getHeaders(): Headers {
    const headers = new Headers({
      'Content-Type': 'application/json',
    });

    if (this.server.token) {
      headers.set('Authorization', `Bearer ${this.server.token}`);
    }

    return headers;
  }

  async sendRequest(endpoint: string, method: string = 'GET', body?: any): Promise<MCPResponse> {
    try {
      const response = await fetch(`${this.server.url}${endpoint}`, {
        method,
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });

      const responseBody = await response.json();

      return {
        status: response.status,
        body: responseBody,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error) {
      throw {
        code: 'REQUEST_ERROR',
        message: error instanceof Error ? error.message : 'Failed to send request',
      } as MCPError;
    }
  }

  getStatus(): MCPConnectionStatus {
    return this.status;
  }

  getServer(): MCPServer {
    return this.server;
  }
}