export interface CodeBlockConfig {
  // Display options
  showLineNumbers: boolean;
  showCopyButton: boolean;
  showLanguageBadge: boolean;
  maxHeight?: number;
  maxWidth?: number;
  theme?: string;

  // Highlighting options
  highlightLines?: number[];
  errorLines?: number[];
  warningLines?: number[];
  diffView?: boolean;

  // Behavior options
  enableCollapse?: boolean;
  enableWordWrap?: boolean;
  enableSearch?: boolean;
  
  // Language detection options
  enableAutoDetection?: boolean;
  preferredLanguage?: string;
  fallbackLanguage?: string;
}

export const defaultConfig: CodeBlockConfig = {
  showLineNumbers: true,
  showCopyButton: true,
  showLanguageBadge: true,
  maxHeight: 500,
  enableCollapse: true,
  enableWordWrap: false,
  enableSearch: false,
  enableAutoDetection: true,
  fallbackLanguage: 'text',
};

export type LineHighlight = {
  line: number;
  type: 'normal' | 'highlight' | 'error' | 'warning' | 'diff-added' | 'diff-removed';
  message?: string;
};

export type HighlightInfo = {
  lineHighlights: LineHighlight[];
  startLine?: number;
  endLine?: number;
};

export function parseHighlightInfo(highlights?: string): HighlightInfo {
  if (!highlights) return { lineHighlights: [] };

  const lineHighlights: LineHighlight[] = [];
  let startLine: number | undefined;
  let endLine: number | undefined;

  const parts = highlights.split(',').map(part => part.trim());

  for (const part of parts) {
    // Parse line ranges (e.g., "1-5")
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      if (!isNaN(start) && !isNaN(end)) {
        startLine = Math.min(start, startLine ?? start);
        endLine = Math.max(end, endLine ?? end);
        for (let i = start; i <= end; i++) {
          lineHighlights.push({ line: i, type: 'highlight' });
        }
      }
      continue;
    }

    // Parse error lines (e.g., "e5" for error on line 5)
    if (part.startsWith('e')) {
      const line = Number(part.slice(1));
      if (!isNaN(line)) {
        lineHighlights.push({ line, type: 'error' });
      }
      continue;
    }

    // Parse warning lines (e.g., "w5" for warning on line 5)
    if (part.startsWith('w')) {
      const line = Number(part.slice(1));
      if (!isNaN(line)) {
        lineHighlights.push({ line, type: 'warning' });
      }
      continue;
    }

    // Parse diff lines (e.g., "+5" for added line, "-5" for removed line)
    if (part.startsWith('+') || part.startsWith('-')) {
      const line = Number(part.slice(1));
      if (!isNaN(line)) {
        lineHighlights.push({
          line,
          type: part.startsWith('+') ? 'diff-added' : 'diff-removed'
        });
      }
      continue;
    }

    // Parse single line highlights (e.g., "5")
    const line = Number(part);
    if (!isNaN(line)) {
      lineHighlights.push({ line, type: 'highlight' });
    }
  }

  return {
    lineHighlights,
    startLine,
    endLine,
  };
}