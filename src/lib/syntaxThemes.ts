import { PrismTheme } from 'react-syntax-highlighter';

export interface ThemeOption {
  name: string;
  theme: PrismTheme;
  background: string;
  foreground: string;
}

// Custom Claude theme based on oneDark
export const claudeTheme: PrismTheme = {
  'code[class*="language-"]': {
    color: '#abb2bf',
    background: 'none',
    textShadow: 'none',
    fontFamily: 'var(--font-mono), Monaco, Consolas, "Andale Mono", "Ubuntu Mono", monospace',
    fontSize: '1em',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    lineHeight: '1.5',
    MozTabSize: '4',
    OTabSize: '4',
    tabSize: '4',
    WebkitHyphens: 'none',
    MozHyphens: 'none',
    msHyphens: 'none',
    hyphens: 'none'
  },
  'pre[class*="language-"]': {
    color: '#abb2bf',
    background: '#282c34',
    textShadow: 'none',
    fontFamily: 'var(--font-mono), Monaco, Consolas, "Andale Mono", "Ubuntu Mono", monospace',
    fontSize: '1em',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    lineHeight: '1.5',
    MozTabSize: '4',
    OTabSize: '4',
    tabSize: '4',
    WebkitHyphens: 'none',
    MozHyphens: 'none',
    msHyphens: 'none',
    hyphens: 'none',
    padding: '1em',
    margin: '.5em 0',
    overflow: 'auto'
  },
  'comment': {
    color: '#7f848e',
    fontStyle: 'italic'
  },
  'prolog': {
    color: '#7f848e',
    fontStyle: 'italic'
  },
  'doctype': {
    color: '#7f848e',
    fontStyle: 'italic'
  },
  'cdata': {
    color: '#7f848e',
    fontStyle: 'italic'
  },
  'punctuation': {
    color: '#abb2bf'
  },
  '.namespace': {
    opacity: '.7'
  },
  'property': {
    color: '#d19a66'
  },
  'keyword': {
    color: '#c678dd'
  },
  'tag': {
    color: '#e06c75'
  },
  'class-name': {
    color: '#e5c07b'
  },
  'boolean': {
    color: '#d19a66'
  },
  'constant': {
    color: '#d19a66'
  },
  'symbol': {
    color: '#61afef'
  },
  'deleted': {
    color: '#e06c75'
  },
  'number': {
    color: '#d19a66'
  },
  'selector': {
    color: '#98c379'
  },
  'attr-name': {
    color: '#d19a66'
  },
  'string': {
    color: '#98c379'
  },
  'char': {
    color: '#98c379'
  },
  'builtin': {
    color: '#e5c07b'
  },
  'inserted': {
    color: '#98c379'
  },
  'variable': {
    color: '#e06c75'
  },
  'operator': {
    color: '#abb2bf'
  },
  'entity': {
    color: '#e5c07b',
    cursor: 'help'
  },
  'url': {
    color: '#e06c75'
  },
  '.language-css .token.string': {
    color: '#98c379'
  },
  '.style .token.string': {
    color: '#98c379'
  },
  'atrule': {
    color: '#c678dd'
  },
  'attr-value': {
    color: '#98c379'
  },
  'function': {
    color: '#61afef'
  },
  'regex': {
    color: '#c678dd'
  },
  'important': {
    color: '#c678dd',
    fontWeight: 'bold'
  },
  'bold': {
    fontWeight: 'bold'
  },
  'italic': {
    fontStyle: 'italic'
  }
};

// Theme options for the application
export const themeOptions: ThemeOption[] = [
  {
    name: 'Claude',
    theme: claudeTheme,
    background: '#282c34',
    foreground: '#abb2bf'
  },
  // Add more themes as needed
];

// Default theme
export const defaultTheme = themeOptions[0];