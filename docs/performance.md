# Performance Optimization Guide

## Overview
This guide covers performance optimization techniques used in Luke Desktop, focusing on code highlighting, file handling, and UI responsiveness.

## Code Highlighting Performance

### Memory Management

1. Virtual Scrolling Implementation:
```typescript
const VirtualCodeBlock: React.FC<Props> = ({
  code,
  itemHeight = 24,
  overscanCount = 5
}) => {
  const lines = code.split('\n');
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const container = containerRef.current;
    if (!container) return { start: 0, end: 10 };
    
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.ceil((scrollTop + container.clientHeight) / itemHeight);
    
    return {
      start: Math.max(0, visibleStart - overscanCount),
      end: Math.min(lines.length, visibleEnd + overscanCount)
    };
  }, [scrollTop, itemHeight, lines.length, overscanCount]);

  return (
    <div 
      ref={containerRef}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      style={{ height: '500px', overflow: 'auto' }}
    >
      <div style={{ height: lines.length * itemHeight }}>
        <div style={{ transform: `translateY(${visibleRange.start * itemHeight}px)` }}>
          {lines.slice(visibleRange.start, visibleRange.end).map((line, idx) => (
            <Line 
              key={visibleRange.start + idx}
              content={line}
              lineNumber={visibleRange.start + idx + 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
```

### Worker-based Processing

1. Syntax Highlighting Worker:
```typescript
// highlightWorker.ts
import { highlight } from 'prism-js';

self.onmessage = async (e: MessageEvent) => {
  const { code, language } = e.data;
  
  try {
    const highlighted = highlight(code, language);
    self.postMessage({ type: 'success', result: highlighted });
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message });
  }
};

// Usage in component
const useHighlightWorker = (code: string, language: string) => {
  const [result, setResult] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker('highlightWorker.ts');
    
    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'success') {
        setResult(e.data.result);
      }
    };

    return () => workerRef.current?.terminate();
  }, []);

  useEffect(() => {
    workerRef.current?.postMessage({ code, language });
  }, [code, language]);

  return result;
};
```

2. Language Detection Worker:
```typescript
// detectionWorker.ts
import { detect } from 'linguist-js';

self.onmessage = async (e: MessageEvent) => {
  const { code } = e.data;
  
  try {
    const language = await detect(code);
    self.postMessage({ type: 'success', language });
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message });
  }
};
```

### Memory Pool System

```typescript
class MemoryPool<T> {
  private pool: T[] = [];
  private inUse = new Set<T>();
  private factory: () => T;
  private maxSize: number;

  constructor(factory: () => T, initialSize: number, maxSize: number) {
    this.factory = factory;
    this.maxSize = maxSize;
    
    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.factory());
    }
  }

  acquire(): T {
    let item: T;
    
    if (this.pool.length > 0) {
      item = this.pool.pop()!;
    } else if (this.size() < this.maxSize) {
      item = this.factory();
    } else {
      throw new Error('Memory pool exhausted');
    }

    this.inUse.add(item);
    return item;
  }

  release(item: T): void {
    if (!this.inUse.has(item)) {
      throw new Error('Attempting to release an item not from this pool');
    }

    this.inUse.delete(item);
    this.pool.push(item);
  }

  size(): number {
    return this.pool.length + this.inUse.size;
  }
}

// Usage example for array buffers
const bufferPool = new MemoryPool<ArrayBuffer>(
  () => new ArrayBuffer(1024 * 64), // 64KB buffers
  10, // Initial size
  100 // Max size
);
```

## UI Performance Optimizations

### Component Rendering

1. Memo and Callback Usage:
```typescript
const MemoizedCodeLine = memo(({ line, number }: CodeLineProps) => {
  return (
    <div className="code-line">
      <span className="line-number">{number}</span>
      <span className="line-content">{line}</span>
    </div>
  );
}, (prev, next) => {
  // Custom comparison function
  return prev.line === next.line && prev.number === next.number;
});

const CodeBlock: React.FC<Props> = ({ code }) => {
  const handleScroll = useCallback((event: UIEvent) => {
    // Scroll handling logic
  }, []);

  return (
    <div onScroll={handleScroll}>
      {lines.map((line, index) => (
        <MemoizedCodeLine 
          key={index}
          line={line}
          number={index + 1}
        />
      ))}
    </div>
  );
};
```

2. State Management Optimization:
```typescript
const useCodeBlockState = (initialCode: string) => {
  const [state, dispatch] = useReducer(reducer, {
    code: initialCode,
    language: null,
    highlightedCode: null,
    visibleRange: { start: 0, end: 0 },
    isDetecting: false,
    error: null
  });

  // Batch updates
  const updateState = useCallback((updates: Partial<State>) => {
    dispatch({ type: 'BATCH_UPDATE', payload: updates });
  }, []);

  return [state, updateState] as const;
};
```

### DOM Optimization

1. RAF for Scroll Updates:
```typescript
const useRAFScroll = (callback: (scrollTop: number) => void) => {
  const rafIdRef = useRef<number>();
  const lastScrollTop = useRef<number>(0);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const scrollTop = (e.target as HTMLElement).scrollTop;
      
      if (scrollTop !== lastScrollTop.current) {
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
        }

        rafIdRef.current = requestAnimationFrame(() => {
          callback(scrollTop);
          lastScrollTop.current = scrollTop;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [callback]);
};
```

2. Intersection Observer for Virtualization:
```typescript
const useIntersectionObserver = (callback: IntersectionObserverCallback) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(callback, {
      root: null,
      rootMargin: '100px',
      threshold: 0
    });

    return () => observerRef.current?.disconnect();
  }, [callback]);

  const observe = useCallback((element: Element) => {
    observerRef.current?.observe(element);
  }, []);

  const unobserve = useCallback((element: Element) => {
    observerRef.current?.unobserve(element);
  }, []);

  return { observe, unobserve };
};
```

## Monitoring and Profiling

### Performance Metrics

1. Component Performance Monitor:
```typescript
const withPerformanceTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) => {
  return function PerformanceTrackedComponent(props: P) {
    useEffect(() => {
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`${componentName} render duration:`, duration);
        
        // Send metrics to monitoring service
        if (duration > 16) { // Longer than one frame
          reportPerformanceIssue({
            component: componentName,
            duration,
            props: JSON.stringify(props)
          });
        }
      };
    });

    return <WrappedComponent {...props} />;
  };
};
```

2. Memory Usage Tracking:
```typescript
const useMemoryTracking = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      if (performance.memory) {
        const { usedJSHeapSize, totalJSHeapSize } = performance.memory;
        
        if (usedJSHeapSize / totalJSHeapSize > 0.9) {
          console.warn('High memory usage detected');
          // Trigger cleanup
          cleanupMemory();
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);
};

const cleanupMemory = () => {
  // Clear caches
  languageCache.clear();
  themeCache.clear();
  
  // Clear pools
  bufferPool.clear();
  
  // Force garbage collection if possible
  if (global.gc) {
    global.gc();
  }
};
```

## Best Practices

1. Component Optimization Checklist:
- Use memo() for expensive renders
- Implement shouldComponentUpdate carefully
- Use proper key props
- Avoid inline functions
- Debounce event handlers
- Use virtualization for long lists

2. Memory Management Checklist:
- Implement cleanup in useEffect
- Use WeakMap/WeakSet when appropriate
- Clear intervals and timeouts
- Dispose workers and subscriptions
- Use memory pools for frequent allocations
- Monitor memory usage

3. Event Handler Optimization:
- Use event delegation
- Implement debouncing/throttling
- Use passive event listeners
- Remove listeners on cleanup