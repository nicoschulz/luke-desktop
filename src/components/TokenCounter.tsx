import React from 'react';
import { useTokenEstimation, useUsageTracking } from '../hooks/useTokenEstimation';
import { ClaudeMessage } from '../lib/claude/types';

interface TokenCounterProps {
  messages: ClaudeMessage[];
  model: string;
}

export function TokenCounter({ messages, model }: TokenCounterProps) {
  const estimation = useTokenEstimation(messages, model);
  const { usage } = useUsageTracking(model);

  return (
    <div className="text-sm text-gray-500 space-y-1">
      <div className="flex justify-between">
        <span>Current Session:</span>
        <span>{estimation.inputTokens + estimation.outputTokens} tokens (${estimation.totalCost.toFixed(4)})</span>
      </div>
      <div className="flex justify-between">
        <span>Total Usage:</span>
        <span>{usage.tokens.total} tokens (${usage.cost.toFixed(4)})</span>
      </div>
      <div className="flex justify-between text-xs">
        <span>Input: {estimation.inputTokens}</span>
        <span>Output: {estimation.outputTokens}</span>
      </div>
    </div>
  );
}