export interface CodeBlockConfig {
  enableSearch: boolean;
  enableWordWrap: boolean;
  showLineNumbers: boolean;
  enableCollapse: boolean;
  showCopyButton: boolean;
}

export interface LineHighlight {
  line: number;
  color: string;
  type?: string;
  message?: string;
}

export interface HighlightInfo {
  lineHighlights: LineHighlight[];
}

export const defaultConfig: CodeBlockConfig = {
  enableSearch: true,
  enableWordWrap: true,
  showLineNumbers: true,
  enableCollapse: false,
  showCopyButton: true,
};

export function parseHighlightInfo(): HighlightInfo {
  return {
    lineHighlights: [],
  };
}