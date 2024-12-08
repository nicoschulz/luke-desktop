import React, { FC, useState, useCallback, useRef, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { Copy, Check, AlertCircle, Loader2, WrapText, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getLanguageDisplayName } from '@/lib/languageDetection';
import { useLanguageDetection } from '@/hooks/useLanguageDetection';
import { claudeTheme } from '@/lib/syntaxThemes';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CodeBlockConfig, defaultConfig, parseHighlightInfo, LineHighlight } from '@/lib/codeBlockConfig';

interface CodeBlockProps extends Partial<CodeBlockConfig> {
  code: string;
  language?: string;
  className?: string;
  highlights?: string;
  startLine?: number;
}

const CodeBlock: FC<CodeBlockProps> = ({
  code,
  language,
  className,
  highlights,
  startLine = 1,
  ...configProps
}) => {
  const config: CodeBlockConfig = { ...defaultConfig, ...configProps };
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isWordWrap, setIsWordWrap] = useState(config.enableWordWrap);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMatches, setSearchMatches] = useState<number[]>([]);
  const [currentMatch, setCurrentMatch] = useState(-1);
  const [showSearch, setShowSearch] = useState(false);
  const codeRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    language: detectedLang,
    isDetecting,
    error
  } = useLanguageDetection(code, language, className);

  // Parse line highlights
  const highlightInfo = parseHighlightInfo(highlights);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const toggleWordWrap = useCallback(() => {
    setIsWordWrap(!isWordWrap);
  }, [isWordWrap]);

  const toggleSearch = useCallback(() => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [showSearch]);

  // Search functionality
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (!query) {
      setSearchMatches([]);
      setCurrentMatch(-1);
      return;
    }

    const lines = code.split('\n');
    const matches = lines.reduce((acc: number[], line, index) => {
      if (line.toLowerCase().includes(query.toLowerCase())) {
        acc.push(index + 1);
      }
      return acc;
    }, []);

    setSearchMatches(matches);
    setCurrentMatch(matches.length > 0 ? 0 : -1);
  }, [code]);

  // Navigate between matches
  const navigateMatch = useCallback((direction: 'next' | 'prev') => {
    if (searchMatches.length === 0) return;

    if (direction === 'next') {
      setCurrentMatch((prev) => (prev + 1) % searchMatches.length);
    } else {
      setCurrentMatch((prev) => (prev - 1 + searchMatches.length) % searchMatches.length);
    }
  }, [searchMatches.length]);

  // Custom renderer for line highlighting
  const lineProps = useCallback((lineNumber: number) => {
    const highlight = highlightInfo.lineHighlights.find(h => h.line === lineNumber);
    const isSearchMatch = searchMatches.includes(lineNumber);
    const isCurrentMatch = isSearchMatch && searchMatches[currentMatch] === lineNumber;

    return {
      style: highlight ? getHighlightStyle(highlight.type) : {},
      className: cn(
        'code-line',
        highlight?.type && `line-${highlight.type}`,
        isSearchMatch && 'search-match',
        isCurrentMatch && 'current-match',
        highlight?.message && 'has-message'
      ),
      'data-line-number': lineNumber,
      'data-message': highlight?.message
    };
  }, [highlightInfo.lineHighlights, searchMatches, currentMatch]);

  return (
    <div className={cn(
      'relative group rounded-lg overflow-hidden',
      'bg-zinc-950 dark:bg-zinc-900',
      'border border-zinc-800',
      className
    )}>
      {/* Toolbar */}
      <div className={cn(
        'flex items-center justify-between',
        'px-4 py-2 bg-zinc-900/50',
        'border-b border-zinc-800'
      )}>
        <div className="flex items-center gap-2">
          {isDetecting ? (
            <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
          ) : error ? (
            <Tooltip>
              <TooltipTrigger>
                <AlertCircle className="h-4 w-4 text-amber-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Language detection failed: {error}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <span className="text-xs font-mono text-zinc-400">
              {getLanguageDisplayName(detectedLang)}
            </span>
          )}

          {config.enableSearch && (
            <div className={cn(
              'flex items-center gap-2',
              'transition-all duration-200',
              showSearch ? 'w-64' : 'w-0'
            )}>
              {showSearch && (
                <>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search..."
                    className={cn(
                      'w-full px-2 py-1 text-xs',
                      'bg-zinc-800 rounded border border-zinc-700',
                      'focus:outline-none focus:border-zinc-600',
                      'placeholder-zinc-500'
                    )}
                  />
                  {searchMatches.length > 0 && (
                    <span className="text-xs text-zinc-500">
                      {currentMatch + 1}/{searchMatches.length}
                    </span>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {config.enableSearch && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleSearch}
                  className={cn(
                    'p-1.5 rounded transition-colors',
                    'hover:bg-zinc-800',
                    showSearch && 'bg-zinc-800'
                  )}
                >
                  <Search className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle search</p>
              </TooltipContent>
            </Tooltip>
          )}

          {config.enableWordWrap && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleWordWrap}
                  className={cn(
                    'p-1.5 rounded transition-colors',
                    'hover:bg-zinc-800',
                    isWordWrap && 'bg-zinc-800'
                  )}
                >
                  <WrapText className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle word wrap</p>
              </TooltipContent>
            </Tooltip>
          )}

          {config.showCopyButton && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleCopy}
                  className={cn(
                    'p-1.5 rounded transition-colors',
                    'hover:bg-zinc-800'
                  )}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{copied ? 'Copied!' : 'Copy code'}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
      
      {/* Code content */}
      <div
        ref={codeRef}
        className={cn(
          'relative transition-all duration-200',
          !isExpanded && 'max-h-[500px]',
          'overflow-auto'
        )}
      >
        <SyntaxHighlighter
          language={detectedLang}
          style={claudeTheme}
          showLineNumbers={config.showLineNumbers}
          startingLineNumber={startLine}
          wrapLines={true}
          lineProps={lineProps}
          customStyle={{
            margin: 0,
            padding: '1.5rem 1rem',
            background: 'transparent',
            wordWrap: isWordWrap ? 'break-word' : 'normal',
            whiteSpace: isWordWrap ? 'pre-wrap' : 'pre',
          }}
          PreTag="div"
        >
          {code}
        </SyntaxHighlighter>

        {/* Expand/collapse overlay */}
        {config.enableCollapse && !isExpanded && isOverflowing() && (
          <div className={cn(
            'absolute bottom-0 left-0 right-0',
            'h-20 bg-gradient-to-t from-zinc-950 to-transparent',
            'flex items-end justify-center pb-2'
          )}>
            <button
              onClick={toggleExpand}
              className={cn(
                'px-4 py-1 rounded-full',
                'bg-zinc-800 hover:bg-zinc-700',
                'text-xs text-zinc-300',
                'transition-colors'
              )}
            >
              Show more
            </button>
          </div>
        )}
      </div>

      {/* Collapse button when expanded */}
      {config.enableCollapse && isExpanded && (
        <div className={cn(
          'flex justify-center',
          'py-2 border-t border-zinc-800',
          'bg-zinc-900/50'
        )}>
          <button
            onClick={toggleExpand}
            className={cn(
              'px-4 py-1 rounded-full',
              'bg-zinc-800 hover:bg-zinc-700',
              'text-xs text-zinc-300',
              'transition-colors'
            )}
          >
            Show less
          </button>
        </div>
      )}
    </div>
  );
};

// Helper function to get highlight styles
function getHighlightStyle(type: LineHighlight['type']) {
  switch (type) {
    case 'highlight':
      return { backgroundColor: 'rgba(97, 175, 239, 0.1)' };
    case 'error':
      return { backgroundColor: 'rgba(224, 108, 117, 0.1)' };
    case 'warning':
      return { backgroundColor: 'rgba(229, 192, 123, 0.1)' };
    case 'diff-added':
      return { backgroundColor: 'rgba(152, 195, 121, 0.1)' };
    case 'diff-removed':
      return { backgroundColor: 'rgba(224, 108, 117, 0.1)' };
    default:
      return {};
  }
}

export default CodeBlock;