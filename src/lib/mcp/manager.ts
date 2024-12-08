import { MCPServer, MCPConfig } from './types';
import { MCPClient } from './client';

export class MCPManager {
  private config: MCPConfig;
  private clients: Map<string, MCPClient>;
  private activeClient: MCPClient | null;

  constructor() {
    this.config = {
      version: '1.0',
      defaultServer: null,
      servers: []
    };
    this.clients = new Map();
    this.activeClient = null;
  }

  async loadConfig(): Promise<void> {
    try {
      // In a real implementation, this would load from the config file
      // For now, we'll use the default empty config
      this.initializeClients();
    } catch (error) {
      console.error('Failed to load MCP configuration:', error);
      throw error;
    }
  }

  private initializeClients(): void {
    this.clients.clear();
    this.config.servers.forEach(server => {
      this.clients.set(server.id, new MCPClient(server));
    });

    if (this.config.defaultServer) {
      this.activeClient = this.clients.get(this.config.defaultServer) || null;
    }
  }

  async addServer(server: Omit<MCPServer, 'id' | 'isActive'>): Promise<MCPServer> {
    const newServer: MCPServer = {
      ...server,
      id: crypto.randomUUID(),
      isActive: false,
    };

    this.config.servers.push(newServer);
    const client = new MCPClient(newServer);
    this.clients.set(newServer.id, client);

    // Test connection
    const status = await client.connect();
    newServer.isActive = status.connected;

    if (!this.config.defaultServer) {
      this.config.defaultServer = newServer.id;
      this.activeClient = client;
    }

    await this.saveConfig();
    return newServer;
  }

  async removeServer(id: string): Promise<void> {
    const index = this.config.servers.findIndex(s => s.id === id);
    if (index === -1) return;

    this.config.servers.splice(index, 1);
    this.clients.delete(id);

    if (this.config.defaultServer === id) {
      this.config.defaultServer = this.config.servers[0]?.id || null;
      this.activeClient = this.config.defaultServer 
        ? this.clients.get(this.config.defaultServer) || null 
        : null;
    }

    await this.saveConfig();
  }

  private async saveConfig(): Promise<void> {
    // In a real implementation, this would save to the config file
    console.log('Saving config:', this.config);
  }

  getActiveClient(): MCPClient | null {
    return this.activeClient;
  }

  getAllServers(): MCPServer[] {
    return this.config.servers;
  }

  getClient(id: string): MCPClient | null {
    return this.clients.get(id) || null;
  }
}