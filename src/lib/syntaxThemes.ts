export interface ThemeOption {
  value: string;
  label: string;
}

export const claudeTheme = {
  'code[class*="language-"]': {
    color: '#000000',
    background: 'none',
    fontFamily: 'monospace',
    fontSize: '1em',
    textAlign: 'left' as const,
    whiteSpace: 'pre' as const,
    wordSpacing: 'normal',
    wordBreak: 'normal' as const,
    wordWrap: 'normal' as const,
    lineHeight: '1.5',
    tabSize: '4',
  },
  'pre[class*="language-"]': {
    color: '#000000',
    background: '#ffffff',
    fontFamily: 'monospace',
    fontSize: '1em',
    textAlign: 'left' as const,
    whiteSpace: 'pre' as const,
    wordSpacing: 'normal',
    wordBreak: 'normal' as const,
    wordWrap: 'normal' as const,
    lineHeight: '1.5',
    tabSize: '4',
    padding: '1em',
    margin: '.5em 0',
    overflow: 'auto' as const,
  },
};

export const themeOptions: ThemeOption[] = [
  { value: 'claude', label: 'Claude Theme' },
  { value: 'github', label: 'GitHub' },
  { value: 'vs', label: 'Visual Studio' },
];