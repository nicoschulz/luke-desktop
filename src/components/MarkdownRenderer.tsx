import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './Markdown';
import { cn } from '@/lib/utils';
import { ExternalLink, AlertTriangle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  enableSearch?: boolean;
  enableWordWrap?: boolean;
  showLineNumbers?: boolean;
}

export function MarkdownRenderer({
  content,
  className = '',
  enableSearch = true,
  enableWordWrap = true,
  showLineNumbers = true,
}: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      className={cn('prose prose-invert max-w-none', className)}
      remarkPlugins={[remarkGfm]}
      components={{
        // Enhanced code block handling
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const highlights = (props as any)['data-highlights'] || '';
          
          if (!inline && (match || !className)) {
            return (
              <CodeBlock
                code={String(children).replace(/\\n$/, '')}
                language={match ? match[1] : undefined}
                className={className}
                highlights={highlights}
                enableSearch={enableSearch}
                enableWordWrap={enableWordWrap}
                showLineNumbers={showLineNumbers}
              />
            );
          }

          return (
            <code
              className={cn(
                'px-1.5 py-0.5 rounded',
                'bg-zinc-800 text-zinc-200',
                'font-mono text-sm',
                className
              )}
              {...props}
            >
              {children}
            </code>
          );
        },

        // Enhanced link handling with external indicator and security warning
        a({ node, children, href, ...props }) {
          const isExternal = href?.startsWith('http');
          const isUnsecure = href?.startsWith('http://');

          return (
            <span className="inline-flex items-center gap-1">
              <a
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className={cn(
                  'inline-flex items-center gap-1',
                  'text-blue-400 hover:text-blue-300',
                  'transition-colors duration-200',
                  'underline decoration-blue-400/30 hover:decoration-blue-300/50'
                )}
                {...props}
              >
                {children}
                {isExternal && (
                  <ExternalLink className="h-3 w-3 inline-block" />
                )}
              </a>
              {isUnsecure && (
                <Tooltip>
                  <TooltipTrigger>
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Warning: This is an insecure (HTTP) link</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </span>
          );
        },

        // Enhanced blockquote with custom styling
        blockquote({ node, children, ...props }) {
          return (
            <blockquote
              className={cn(
                'border-l-4 border-zinc-700/50',
                'pl-4 my-4',
                'italic text-zinc-300',
                'bg-zinc-900/30 py-2 rounded-r'
              )}
              {...props}
            >
              {children}
            </blockquote>
          );
        },

        // Enhanced table with responsive design
        table({ node, children, ...props }) {
          return (
            <div className="overflow-x-auto my-4 rounded-lg border border-zinc-800">
              <table 
                className={cn(
                  'min-w-full divide-y divide-zinc-800',
                  'text-sm text-zinc-300'
                )} 
                {...props}
              >
                {children}
              </table>
            </div>
          );
        },

        // Table header enhancement
        th({ node, children, ...props }) {
          return (
            <th
              className={cn(
                'px-4 py-3 text-left text-xs font-medium',
                'text-zinc-400 uppercase tracking-wider',
                'bg-zinc-900'
              )}
              {...props}
            >
              {children}
            </th>
          );
        },

        // Table cell enhancement
        td({ node, children, ...props }) {
          return (
            <td
              className={cn(
                'px-4 py-3 whitespace-nowrap',
                'border-t border-zinc-800'
              )}
              {...props}
            >
              {children}
            </td>
          );
        },

        // List enhancements
        ul({ node, children, ...props }) {
          return (
            <ul
              className={cn(
                'list-disc list-outside',
                'space-y-1 pl-5'
              )}
              {...props}
            >
              {children}
            </ul>
          );
        },

        ol({ node, children, ...props }) {
          return (
            <ol
              className={cn(
                'list-decimal list-outside',
                'space-y-1 pl-5'
              )}
              {...props}
            >
              {children}
            </ol>
          );
        },

        // Enhanced heading styles
        h1({ node, children, ...props }) {
          return (
            <h1
              className={cn(
                'text-3xl font-bold tracking-tight',
                'border-b border-zinc-800 pb-2 mb-4'
              )}
              {...props}
            >
              {children}
            </h1>
          );
        },

        h2({ node, children, ...props }) {
          return (
            <h2
              className={cn(
                'text-2xl font-semibold tracking-tight',
                'border-b border-zinc-800 pb-2 mb-3'
              )}
              {...props}
            >
              {children}
            </h2>
          );
        },

        h3({ node, children, ...props }) {
          return (
            <h3
              className={cn(
                'text-xl font-semibold tracking-tight',
                'mb-2'
              )}
              {...props}
            >
              {children}
            </h3>
          );
        },

        // Enhanced image handling with loading states
        img({ node, alt, src, ...props }) {
          return (
            <span className="relative block">
              <img
                alt={alt}
                src={src}
                className={cn(
                  'rounded-lg',
                  'border border-zinc-800',
                  'max-w-full h-auto'
                )}
                loading="lazy"
                {...props}
              />
              <span className="absolute inset-0 bg-zinc-900/30 animate-pulse" />
            </span>
          );
        },

        // Enhanced paragraph spacing
        p({ node, children, ...props }) {
          return (
            <p
              className={cn(
                'leading-7',
                '[&:not(:first-child)]:mt-6'
              )}
              {...props}
            >
              {children}
            </p>
          );
        },

        // Enhanced strong/bold text
        strong({ node, children, ...props }) {
          return (
            <strong
              className={cn(
                'font-semibold',
                'text-zinc-200'
              )}
              {...props}
            >
              {children}
            </strong>
          );
        },

        // Enhanced emphasis/italic text
        em({ node, children, ...props }) {
          return (
            <em
              className={cn(
                'italic',
                'text-zinc-300'
              )}
              {...props}
            >
              {children}
            </em>
          );
        },

        // Enhanced horizontal rule
        hr({ ...props }) {
          return (
            <hr
              className={cn(
                'my-8 border-none h-px',
                'bg-gradient-to-r from-transparent via-zinc-700 to-transparent'
              )}
              {...props}
            />
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}