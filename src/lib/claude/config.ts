export interface ClaudeConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  organization?: string;
  maxTokens: number;
  temperature: number;
}

export const DEFAULT_CONFIG: Partial<ClaudeConfig> = {
  baseUrl: 'https://api.anthropic.com',
  model: 'claude-3-opus-20240229',
  maxTokens: 4096,
  temperature: 0.7,
};

export function loadConfig(): Partial<ClaudeConfig> {
  const savedConfig = localStorage.getItem('claude_config');
  if (!savedConfig) {
    return DEFAULT_CONFIG;
  }

  try {
    const parsedConfig = JSON.parse(savedConfig);
    return { ...DEFAULT_CONFIG, ...parsedConfig };
  } catch (error) {
    console.error('Error parsing saved config:', error);
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config: Partial<ClaudeConfig>): void {
  const currentConfig = loadConfig();
  const newConfig = { ...currentConfig, ...config };
  localStorage.setItem('claude_config', JSON.stringify(newConfig));
}

export function clearConfig(): void {
  localStorage.removeItem('claude_config');
}

// Rate limiting settings
export const RATE_LIMITS = {
  requestsPerMinute: 50,
  tokensPerMinute: 100000,
  maxRetries: 3,
  retryDelay: 1000, // ms
};

// Token limits per model
export const MODEL_LIMITS = {
  'claude-3-opus-20240229': {
    maxInputTokens: 200000,
    maxOutputTokens: 4096,
  },
  'claude-3-sonnet-20240229': {
    maxInputTokens: 200000,
    maxOutputTokens: 4096,
  },
  'claude-3-haiku-20240229': {
    maxInputTokens: 200000,
    maxOutputTokens: 4096,
  },
};

// Error messages
export const ERROR_MESSAGES = {
  invalidApiKey: 'Invalid API key. Please check your configuration.',
  rateLimitExceeded: 'Rate limit exceeded. Please try again later.',
  networkError: 'Network error. Please check your connection.',
  serverError: 'Server error. Please try again later.',
  tokenLimitExceeded: 'Token limit exceeded for this model.',
  invalidModel: 'Invalid model selected.',
};