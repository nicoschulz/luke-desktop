import { useState, useEffect, useCallback } from 'react';
import { detectLanguage } from '@/lib/languageDetection';

// Cache for detected languages to avoid re-detection
const languageCache = new Map<string, string>();

export function useLanguageDetection(code: string, initialLanguage?: string, className?: string) {
  const [language, setLanguage] = useState<string>(initialLanguage || 'text');
  const [isDetecting, setIsDetecting] = useState(!initialLanguage);
  const [error, setError] = useState<string | null>(null);

  // Generate a cache key from the code
  const getCacheKey = useCallback((code: string) => {
    // Use first 100 chars + length as cache key to balance uniqueness and memory
    return `${code.slice(0, 100)}_${code.length}`;
  }, []);

  useEffect(() => {
    if (initialLanguage) {
      setLanguage(initialLanguage);
      setIsDetecting(false);
      return;
    }

    const cacheKey = getCacheKey(code);
    const cachedLanguage = languageCache.get(cacheKey);

    if (cachedLanguage) {
      setLanguage(cachedLanguage);
      setIsDetecting(false);
      return;
    }

    setIsDetecting(true);
    setError(null);

    detectLanguage(code, className)
      .then(detected => {
        setLanguage(detected);
        languageCache.set(cacheKey, detected);
        setIsDetecting(false);
      })
      .catch(err => {
        console.error('Language detection failed:', err);
        setError(err.message);
        setLanguage('text');
        setIsDetecting(false);
      });
  }, [code, initialLanguage, className, getCacheKey]);

  // Clean up old cache entries when they exceed 100
  useEffect(() => {
    if (languageCache.size > 100) {
      // Convert to array, sort by insertion order, and keep last 50
      const entries = Array.from(languageCache.entries());
      const keepEntries = entries.slice(-50);
      languageCache.clear();
      keepEntries.forEach(([key, value]) => languageCache.set(key, value));
    }
  }, []);

  return {
    language,
    isDetecting,
    error,
    clearCache: useCallback(() => languageCache.clear(), [])
  };
}