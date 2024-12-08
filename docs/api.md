# Luke Desktop API Documentation

## Table of Contents
1. [MCP Server Integration](#mcp-server-integration)
2. [File Management API](#file-management-api)
3. [Project Management API](#project-management-api)
4. [Claude AI Integration](#claude-ai-integration)
5. [Settings and Configuration](#settings-and-configuration)
6. [Security and Authentication](#security-and-authentication)

## MCP Server Integration

### Server Configuration
```typescript
interface ServerConfig {
  url: string;
  apiKey?: string;
  name: string;
  capabilities: string[];
  isDefault: boolean;
}

async function configureServer(config: ServerConfig): Promise<void>
async function getServerStatus(url: string): Promise<ServerStatus>
async function listServers(): Promise<ServerConfig[]>
```

### Connection Management
```typescript
interface ConnectionOptions {
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

async function connect(url: string, options?: ConnectionOptions): Promise<Connection>
async function disconnect(connection: Connection): Promise<void>
async function checkHealth(connection: Connection): Promise<HealthStatus>
```

### Request Handling
```typescript
interface RequestOptions {
  priority: 'high' | 'normal' | 'low';
  timeout?: number;
  metadata?: Record<string, unknown>;
}

async function sendRequest(
  connection: Connection,
  payload: unknown,
  options?: RequestOptions
): Promise<Response>
```

## File Management API

### File Operations
```typescript
interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: Date;
  version: number;
}

async function uploadFile(
  path: string,
  options?: UploadOptions
): Promise<FileMetadata>

async function downloadFile(
  fileId: string,
  destination: string
): Promise<void>

async function deleteFile(fileId: string): Promise<void>
```

### File Search
```typescript
interface SearchOptions {
  query: string;
  fileTypes?: string[];
  dateRange?: DateRange;
  limit?: number;
  offset?: number;
}

async function searchFiles(options: SearchOptions): Promise<SearchResult[]>
```

### File Preview
```typescript
interface PreviewOptions {
  size?: 'small' | 'medium' | 'large';
  format?: 'image' | 'text' | 'pdf';
}

async function generatePreview(
  fileId: string,
  options?: PreviewOptions
): Promise<Preview>
```

## Project Management API

### Project Operations
```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  created: Date;
  modified: Date;
  settings: ProjectSettings;
}

async function createProject(
  name: string,
  options?: ProjectOptions
): Promise<Project>

async function updateProject(
  id: string,
  updates: Partial<Project>
): Promise<Project>

async function deleteProject(id: string): Promise<void>
```

### Project Settings
```typescript
interface ProjectSettings {
  theme: string;
  language: string;
  autoSave: boolean;
  collaborators?: string[];
}

async function updateProjectSettings(
  projectId: string,
  settings: Partial<ProjectSettings>
): Promise<ProjectSettings>
```

## Claude AI Integration

### Chat Interface
```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: FileAttachment[];
  metadata?: Record<string, unknown>;
}

async function sendMessage(
  content: string,
  options?: MessageOptions
): Promise<Message>

async function getConversationHistory(
  limit?: number,
  before?: string
): Promise<Message[]>
```

### Model Configuration
```typescript
interface ModelConfig {
  name: string;
  temperature: number;
  maxTokens?: number;
  topP?: number;
}

async function setModelConfig(config: ModelConfig): Promise<void>
async function getAvailableModels(): Promise<ModelInfo[]>
```

### Context Management
```typescript
interface Context {
  systemPrompt?: string;
  relevantFiles?: string[];
  conversationId: string;
}

async function setContext(context: Partial<Context>): Promise<void>
async function clearContext(): Promise<void>
```

## Settings and Configuration

### Application Settings
```typescript
interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  fontSize: number;
  autoUpdate: boolean;
}

async function updateSettings(
  settings: Partial<AppSettings>
): Promise<AppSettings>

async function getSettings(): Promise<AppSettings>
```

### User Preferences
```typescript
interface UserPreferences {
  defaultProject?: string;
  defaultServer?: string;
  shortcuts: Record<string, string>;
}

async function updatePreferences(
  preferences: Partial<UserPreferences>
): Promise<UserPreferences>
```

## Security and Authentication

### API Key Management
```typescript
interface ApiKeyConfig {
  key: string;
  name: string;
  permissions: string[];
  expiresAt?: Date;
}

async function addApiKey(config: ApiKeyConfig): Promise<void>
async function removeApiKey(name: string): Promise<void>
async function listApiKeys(): Promise<ApiKeyInfo[]>
```

### Authorization
```typescript
interface AuthConfig {
  type: 'bearer' | 'basic';
  credentials: string;
  scope?: string[];
}

async function authorize(config: AuthConfig): Promise<AuthToken>
async function deauthorize(): Promise<void>
async function refreshToken(token: AuthToken): Promise<AuthToken>
```

### Error Handling
```typescript
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

function isApiError(error: unknown): error is ApiError
function handleApiError(error: ApiError): void
```

## Event System

### Event Subscription
```typescript
type EventCallback = (data: unknown) => void;

interface EventSubscription {
  unsubscribe(): void;
}

function subscribe(event: string, callback: EventCallback): EventSubscription
function emit(event: string, data?: unknown): void
```

### Available Events
```typescript
const enum AppEvents {
  FILE_UPLOADED = 'file:uploaded',
  FILE_DELETED = 'file:deleted',
  PROJECT_CREATED = 'project:created',
  PROJECT_UPDATED = 'project:updated',
  SERVER_CONNECTED = 'server:connected',
  SERVER_DISCONNECTED = 'server:disconnected',
  MESSAGE_RECEIVED = 'message:received',
  ERROR_OCCURRED = 'error:occurred'
}
```