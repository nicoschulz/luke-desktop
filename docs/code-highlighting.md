# Code Highlighting and Markdown System

## Overview
The code highlighting and markdown system in Luke Desktop provides rich text rendering capabilities with advanced features like automatic language detection, syntax highlighting, and enhanced markdown rendering.

## Components

### CodeBlock Component
The main component for code highlighting:

```typescript
interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  highlights?: string;
  showLineNumbers?: boolean;
  maxHeight?: number;
  enableSearch?: boolean;
  enableWordWrap?: boolean;
}
```

Features:
- Automatic language detection
- Syntax highlighting with theme support
- Line numbers and highlighting
- Code search functionality
- Word wrap toggle
- Copy to clipboard
- Error and warning indicators

### Language Detection System

The language detection system uses a multi-layered approach:

1. Code Fence Detection:
```typescript
function detectFromFence(className?: string): string | null {
  if (!className) return null;
  const match = /language-(\w+)/.exec(className);
  return match ? match[1] : null;
}
```

2. Content Analysis:
```typescript
async function analyzeContent(code: string): Promise<string | null> {
  try {
    const linguistResult = await detect(code);
    return linguistResult?.toLowerCase() || null;
  } catch (error) {
    console.warn('Linguist detection failed:', error);
    return null;
  }
}
```

3. Pattern Matching:
```typescript
const languagePatterns = {
  javascript: /(?:function|const|let|var|return|if|for|while|class)\b/,
  python: /(?:def|class|import|from|if|for|while|try|except)\b/,
  rust: /(?:fn|let|mut|impl|struct|enum|trait|pub|use|mod)\b/,
  // ... more patterns
};
```

### Theme System

Themes are fully customizable and support both light and dark modes:

```typescript
interface SyntaxTheme {
  name: string;
  colors: {
    background: string;
    text: string;
    comment: string;
    keyword: string;
    string: string;
    number: string;
    function: string;
    operator: string;
    variable: string;
  };
  fonts: {
    mono: string;
    sizes: {
      code: string;
      small: string;
    };
  };
}
```

### Search Features

The search system includes:

1. Real-time Search:
```typescript
function useCodeSearch(code: string, query: string) {
  const [matches, setMatches] = useState<SearchMatch[]>([]);
  const [currentMatch, setCurrentMatch] = useState(0);

  useEffect(() => {
    if (!query) {
      setMatches([]);
      return;
    }
    const results = findMatches(code, query);
    setMatches(results);
    setCurrentMatch(0);
  }, [code, query]);

  return { matches, currentMatch, setCurrentMatch };
}
```

2. Match Navigation:
```typescript
function navigateMatches(direction: 'next' | 'prev') {
  setCurrentMatch(current => {
    if (direction === 'next') {
      return (current + 1) % matches.length;
    }
    return (current - 1 + matches.length) % matches.length;
  });
}
```

## Performance Optimizations

### Caching System

1. Language Detection Cache:
```typescript
const languageCache = new Map<string, {
  language: string;
  timestamp: number;
  confidence: number;
}>();

function getCachedLanguage(code: string): string | null {
  const cacheKey = generateCacheKey(code);
  const cached = languageCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.language;
  }
  
  return null;
}
```

2. Theme Caching:
```typescript
const themeCache = new Map<string, ThemeOption>();
const styleCache = new Map<string, string>();

function getCachedTheme(themeName: string): ThemeOption {
  if (!themeCache.has(themeName)) {
    themeCache.set(themeName, generateTheme(themeName));
  }
  return themeCache.get(themeName)!;
}
```

### Memory Management

1. Virtual Scrolling:
```typescript
function useVirtualScroll(items: string[], itemHeight: number) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateVisibleRange = () => {
      const container = containerRef.current;
      if (!container) return;

      const scrollTop = container.scrollTop;
      const viewportHeight = container.clientHeight;

      const start = Math.floor(scrollTop / itemHeight);
      const end = Math.min(
        items.length,
        Math.ceil((scrollTop + viewportHeight) / itemHeight)
      );

      setVisibleRange({ start, end });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', updateVisibleRange);
      return () => container.removeEventListener('scroll', updateVisibleRange);
    }
  }, [items.length, itemHeight]);

  return { visibleRange, containerRef };
}
```

## Accessibility Features

### Keyboard Navigation

```typescript
function useKeyboardNavigation() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        toggleSearch();
      }
      if (e.key === 'F3') {
        e.preventDefault();
        navigateMatches(e.shiftKey ? 'prev' : 'next');
      }
      // ... more shortcuts
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
```

### Screen Reader Support

```typescript
function LiveSearchAnnouncer({ matches, currentMatch }: Props) {
  return (
    <div 
      role="status" 
      aria-live="polite" 
      className="sr-only"
    >
      {matches.length > 0 ? (
        `Match ${currentMatch + 1} of ${matches.length}`
      ) : (
        'No matches found'
      )}
    </div>
  );
}
```

## Best Practices

### Error Handling

1. Language Detection:
```typescript
try {
  const language = await detectLanguage(code);
  if (!language) {
    throw new Error('Language detection failed');
  }
} catch (error) {
  console.error('Language detection error:', error);
  return 'plaintext';
}
```

2. Syntax Highlighting:
```typescript
function highlightSafely(code: string, language: string) {
  try {
    return highlight(code, language);
  } catch (error) {
    console.error('Highlighting error:', error);
    return escapeHtml(code);
  }
}
```

### Security Considerations

1. Input Sanitization:
```typescript
function sanitizeCode(code: string): string {
  // Remove potentially harmful content
  return code.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}
```

2. Content Security:
```typescript
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline';",
  'X-XSS-Protection': '1; mode=block',
};
```

## Contributing Guidelines

1. Adding New Languages:
```typescript
function registerLanguage(name: string, config: LanguageConfig) {
  validateLanguageConfig(config);
  languageRegistry.set(name, config);
}
```

2. Creating Themes:
```typescript
function registerTheme(theme: ThemeOption) {
  validateTheme(theme);
  themeRegistry.set(theme.name, theme);
}
```

## Future Improvements

### Planned Features
1. More language support
2. Additional themes
3. Code folding
4. Minimap
5. Multiple selections
6. Code actions

### Performance Optimizations
1. Web worker for highlighting
2. Improved caching
3. Better virtual scrolling
4. Reduced bundle size