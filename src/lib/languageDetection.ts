export interface DetectionResult {
  language: string;
  confidence: number;
}

export async function detectLanguage(code: string): Promise<string> {
  // Simple language detection based on file extensions and code patterns
  const patterns = [
    { language: 'javascript', pattern: /(function|const|let|var|=>|import|export)/ },
    { language: 'typescript', pattern: /(interface|type|enum|namespace|declare)/ },
    { language: 'python', pattern: /(def|import|from|class|if __name__)/ },
    { language: 'java', pattern: /(public|private|class|import|package)/ },
    { language: 'cpp', pattern: /(#include|namespace|std::|cout|cin)/ },
    { language: 'csharp', pattern: /(using|namespace|class|public|private)/ },
    { language: 'php', pattern: /(<?php|function|class|namespace)/ },
    { language: 'ruby', pattern: /(def|class|module|require|include)/ },
    { language: 'go', pattern: /(package|import|func|var|type)/ },
    { language: 'rust', pattern: /(fn|let|mut|struct|enum|impl)/ },
    { language: 'swift', pattern: /(import|func|class|struct|enum)/ },
    { language: 'kotlin', pattern: /(fun|class|import|package|val|var)/ },
    { language: 'scala', pattern: /(def|class|object|import|package)/ },
    { language: 'html', pattern: /(<html|<head|<body|<div|<span)/ },
    { language: 'css', pattern: /({|}|:|;|@media|@import)/ },
    { language: 'sql', pattern: /(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP)/ },
    { language: 'bash', pattern: /(#!\/bin|echo|if|then|fi|for|do|done)/ },
    { language: 'powershell', pattern: /(\$|Get-|Set-|Write-|if|foreach)/ },
    { language: 'yaml', pattern: /(---|:|>|\||-)/ },
    { language: 'json', pattern: /({|}|\[|\]|"|:|,)/ },
    { language: 'xml', pattern: /(<[^>]+>|<\/[^>]+>)/ },
    { language: 'markdown', pattern: /(# |## |### |\*\*|\*|`|\[|\])/ },
  ];

  for (const { language, pattern } of patterns) {
    if (pattern.test(code)) {
      return language;
    }
  }

  return 'text';
}

/**
 * Get appropriate display name for a language
 */
export function getLanguageDisplayName(language: string): string {
  const displayNames: Record<string, string> = {
    javascript: 'JavaScript',
    python: 'Python',
    rust: 'Rust',
    sql: 'SQL',
    html: 'HTML',
    text: 'Text',
  };
  
  return displayNames[language] || language;
}