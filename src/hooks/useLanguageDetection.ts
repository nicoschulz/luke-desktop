import { useState, useEffect } from 'react';

export function useLanguageDetection(code: string, initialLanguage?: string, _className?: string) {
  const [detectedLanguage, setDetectedLanguage] = useState<string>(initialLanguage || 'text');
  const [error] = useState<string | null>(null);

  useEffect(() => {
    // Simple language detection logic
    if (code.includes('function') || code.includes('const') || code.includes('let')) {
      setDetectedLanguage('javascript');
    } else if (code.includes('def ') || code.includes('import ')) {
      setDetectedLanguage('python');
    } else if (code.includes('fn ') || code.includes('let ')) {
      setDetectedLanguage('rust');
    } else {
      setDetectedLanguage('text');
    }
  }, [code]);

  return { detectedLanguage, error };
}