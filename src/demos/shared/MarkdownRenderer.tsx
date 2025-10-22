/**
 * @fileoverview Markdown renderer component for demo applications
 * @author Next.js Dify Firebase Starter
 * @version 1.0.0
 */

import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  components?: Record<string, React.ComponentType<any>>;
}

/**
 * A reusable markdown renderer component for demo applications
 *
 * @param content - The markdown content to render
 * @param className - Optional CSS classes to apply to the container
 * @param components - Optional custom component overrides for markdown elements
 * @returns JSX element containing the rendered markdown
 */
export function MarkdownRenderer({ content, className, components }: MarkdownRendererProps) {
  return (
    <div className={cn('prose prose-sm max-w-none', className)}>
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}

/**
 * Default markdown components with custom styling
 * These can be overridden by passing custom components to MarkdownRenderer
 */
export const defaultMarkdownComponents: Record<string, React.ComponentType<any>> = {
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="mb-4 text-2xl font-bold text-gray-900" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="mb-3 text-xl font-semibold text-gray-800" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="mb-2 text-lg font-medium text-gray-700" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-4 leading-relaxed text-gray-600" {...props}>
      {children}
    </p>
  ),
  code: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-gray-800" {...props}>
      {children}
    </code>
  ),
  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-gray-100" {...props}>
      {children}
    </pre>
  ),
  blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="mb-4 border-l-4 border-blue-500 pl-4 text-gray-600 italic" {...props}>
      {children}
    </blockquote>
  ),
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="mb-4 list-inside list-disc text-gray-600" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="mb-4 list-inside list-decimal text-gray-600" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="mb-1" {...props}>
      {children}
    </li>
  ),
  a: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      href={href}
      className="text-blue-600 underline hover:text-blue-800"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
  strong: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-gray-900" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <em className="text-gray-700 italic" {...props}>
      {children}
    </em>
  ),
};
