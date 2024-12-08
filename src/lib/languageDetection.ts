import { detect } from 'linguist-js';

// Common language patterns
const patterns = {
  html: /<\/?[a-z][\s\S]*>/i,
  css: /[{}\s;:][a-z-]+:\s*[^;\s}]+;?/i,
  javascript: /(?:function|const|let|var|return|if|for|while|class)\b/,
  typescript: /(?:interface|type|namespace|declare|abstract|public|private)\b/,
  python: /(?:def|class|import|from|if|for|while|try|except)\b/,
  rust: /(?:fn|let|mut|impl|struct|enum|trait|pub|use|mod)\b/,
  sql: /(?:SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN)\b/i,
  json: /^[\s\n]*[{\[]/,
  markdown: /(?:^#|\*\*|__|\[.*\]\(.*\))/m,
  yaml: /^---[\s\S]*?---/m,
  dockerfile: /^FROM\s+\w+/m,
  shell: /(?:^#!\s*\/.*\/(?:bash|sh)|(?:^|\n)\s*(?:npm|yarn|cargo|apt-get|brew)\s+\w+)/m,
};

// Common file extensions mapping
const extensionMap: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  rs: 'rust',
  sql: 'sql',
  json: 'json',
  md: 'markdown',
  yml: 'yaml',
  yaml: 'yaml',
  html: 'html',
  css: 'css',
  scss: 'scss',
  sh: 'shell',
  bash: 'shell',
  dockerfile: 'dockerfile',
};

interface DetectionResult {
  language: string;
  confidence: number;
}

/**
 * Check if code matches a specific language pattern
 */
function matchesPattern(code: string, language: string): boolean {
  const pattern = patterns[language as keyof typeof patterns];
  return pattern?.test(code) || false;
}

/**
 * Get probable languages based on content patterns
 */
function getProbableLanguages(code: string): DetectionResult[] {
  const matches: DetectionResult[] = [];
  
  for (const [language, pattern] of Object.entries(patterns)) {
    if (pattern.test(code)) {
      // Calculate rough confidence based on number of matches
      const matchCount = (code.match(pattern) || []).length;
      const confidence = Math.min(matchCount / 5, 1); // Cap at 1
      matches.push({ language, confidence });
    }
  }

  return matches.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Try to detect language from file extension in code fence
 */
function detectFromCodeFence(className?: string): string | null {
  if (!className) return null;
  
  const match = /language-(\w+)/.exec(className);
  if (!match) return null;

  const ext = match[1].toLowerCase();
  return extensionMap[ext] || ext;
}

/**
 * Detect code language using multiple strategies
 */
export async function detectLanguage(
  code: string,
  className?: string
): Promise<string> {
  // 1. Try from code fence first
  const fenceLanguage = detectFromCodeFence(className);
  if (fenceLanguage) return fenceLanguage;

  // 2. Use linguist-js for initial detection
  try {
    const linguistResult = await detect(code);
    if (linguistResult) return linguistResult.toLowerCase();
  } catch (error) {
    console.warn('Language detection with linguist-js failed:', error);
  }

  // 3. Fall back to pattern matching
  const probableLanguages = getProbableLanguages(code);
  if (probableLanguages.length > 0) {
    return probableLanguages[0].language;
  }

  // 4. Default fallback
  return 'text';
}

/**
 * Get appropriate display name for a language
 */
export function getLanguageDisplayName(language: string): string {
  const displayNames: Record<string, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    rust: 'Rust',
    sql: 'SQL',
    json: 'JSON',
    markdown: 'Markdown',
    yaml: 'YAML',
    html: 'HTML',
    css: 'CSS',
    scss: 'SCSS',
    shell: 'Shell',
    dockerfile: 'Dockerfile',
    text: 'Plain Text',
  };

  return displayNames[language] || language.charAt(0).toUpperCase() + language.slice(1);
}