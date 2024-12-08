import { useMemo } from 'react';
import { ClaudeMessage } from '../lib/claude/types';

const CLAUDE_MODELS_PRICING = {
  'claude-3-opus-20240229': {
    input: 0.015,   // per 1K tokens
    output: 0.075,  // per 1K tokens
  },
  'claude-3-sonnet-20240229': {
    input: 0.003,   // per 1K tokens
    output: 0.015,  // per 1K tokens
  },
  'claude-3-haiku-20240229': {
    input: 0.0005,  // per 1K tokens
    output: 0.0025, // per 1K tokens
  },
};

// Rough estimation: average English word is about 4 characters
// Plus space between words, so ~5 characters per word
// GPT models average about ~4 characters per token
// So we can roughly estimate 1.25 words per token
function estimateTokenCount(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / 1.25);
}

interface TokenEstimation {
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
}

export function useTokenEstimation(messages: ClaudeMessage[], model: string) {
  return useMemo(() => {
    const pricing = CLAUDE_MODELS_PRICING[model as keyof typeof CLAUDE_MODELS_PRICING];
    if (!pricing) {
      throw new Error(`Unknown model: ${model}`);
    }

    const estimation: TokenEstimation = {
      inputTokens: 0,
      outputTokens: 0,
      totalCost: 0,
    };

    for (const message of messages) {
      const tokenCount = estimateTokenCount(message.content);
      
      if (message.role === 'assistant') {
        estimation.outputTokens += tokenCount;
      } else {
        estimation.inputTokens += tokenCount;
      }
    }

    estimation.totalCost = (
      (estimation.inputTokens * pricing.input) +
      (estimation.outputTokens * pricing.output)
    ) / 1000; // Convert to cost per 1K tokens

    return estimation;
  }, [messages, model]);
}

interface UsageTracking {
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  cost: number;
}

export function useUsageTracking(model: string) {
  const usage = useMemo(() => {
    const storedUsage = localStorage.getItem('claude_usage');
    return storedUsage ? JSON.parse(storedUsage) : {
      tokens: {
        input: 0,
        output: 0,
        total: 0,
      },
      cost: 0,
    };
  }, []);

  const trackUsage = (messages: ClaudeMessage[]) => {
    const estimation = useTokenEstimation(messages, model);
    const newUsage: UsageTracking = {
      tokens: {
        input: usage.tokens.input + estimation.inputTokens,
        output: usage.tokens.output + estimation.outputTokens,
        total: usage.tokens.total + estimation.inputTokens + estimation.outputTokens,
      },
      cost: usage.cost + estimation.totalCost,
    };

    localStorage.setItem('claude_usage', JSON.stringify(newUsage));
    return newUsage;
  };

  return {
    usage,
    trackUsage,
  };
}