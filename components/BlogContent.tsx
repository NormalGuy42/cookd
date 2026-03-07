'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface BlogContentProps {
  content: string;
}

export default function BlogContent({ content }: BlogContentProps) {
  return (
    <div className="prose prose-lg max-w-none
      prose-headings:font-bold prose-headings:text-[var(--text-primary)] prose-headings:font-display
      prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4
      prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-[var(--cookd-orange)]
      prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
      prose-p:text-[var(--text-secondary)] prose-p:leading-relaxed prose-p:mb-4
      prose-a:text-[var(--cookd-orange)] prose-a:no-underline hover:prose-a:underline
      prose-strong:text-[var(--text-primary)] prose-strong:font-semibold
      prose-code:text-[var(--cookd-orange)] prose-code:bg-[var(--surface-cream)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-lg prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-[var(--surface-cream)] prose-pre:border prose-pre:border-[var(--border-light)] prose-pre:rounded-xl prose-pre:overflow-x-auto
      prose-blockquote:border-l-[var(--cookd-orange)] prose-blockquote:bg-[var(--surface-cream)]/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-xl prose-blockquote:italic prose-blockquote:text-[var(--text-muted)]
      prose-ul:text-[var(--text-secondary)] prose-ol:text-[var(--text-secondary)]
      prose-li:marker:text-[var(--cookd-orange)]
      prose-hr:border-[var(--border-light)]
      prose-img:rounded-xl prose-img:border prose-img:border-[var(--border-light)]
      prose-table:border-collapse
      prose-th:bg-[var(--surface-cream)] prose-th:px-4 prose-th:py-2 prose-th:border prose-th:border-[var(--border-light)] prose-th:text-left prose-th:text-[var(--text-primary)]
      prose-td:px-4 prose-td:py-2 prose-td:border prose-td:border-[var(--border-light)] prose-td:text-[var(--text-secondary)]
    ">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, href, children, ...props }) => {
            const isExternal = href?.startsWith('http');
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                {...props}
              >
                {children}
              </a>
            );
          },
          img: ({ node, src, alt, ...props }) => (
            <img
              src={src}
              alt={alt || ''}
              className="w-full rounded-xl border border-[var(--border-light)]"
              loading="lazy"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

