// src/utils/sanitize-html.ts
// Centralized HTML sanitization using DOMPurify to prevent XSS attacks

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content — removes all dangerous tags/attributes.
 * Use for user-generated content (blog posts, messages, highlights).
 */
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'b',
      'i',
      'em',
      'strong',
      'a',
      'p',
      'br',
      'ul',
      'ol',
      'li',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'blockquote',
      'code',
      'pre',
      'span',
      'div',
      'img',
      'figure',
      'figcaption',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'mark',
      'sub',
      'sup',
      'hr',
    ],
    ALLOWED_ATTR: [
      'href',
      'target',
      'rel',
      'src',
      'alt',
      'width',
      'height',
      'class',
      'style',
      'title',
      'id',
    ],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],
  });
}

/**
 * Sanitize search highlight markup — only allows <mark> for highlighting.
 */
export function sanitizeHighlight(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['mark', 'em', 'strong', 'b', 'i'],
    ALLOWED_ATTR: ['class'],
  });
}
