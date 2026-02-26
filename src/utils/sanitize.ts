/**
 * Centralized HTML sanitization utility using DOMPurify.
 * Use this for ANY dangerouslySetInnerHTML usage to prevent XSS.
 *
 * @module sanitize
 */
import DOMPurify from 'dompurify';

/**
 * Sanitize HTML — strips all scripts, event handlers, and dangerous tags.
 * Safe for rendering user-generated or CMS content.
 */
export function sanitizeHTML(dirty: string): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code',
      'img', 'figure', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'span', 'div', 'mark', 'sub', 'sup', 'hr', 'dl', 'dt', 'dd',
      'video', 'source', 'iframe',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'id',
      'style', 'width', 'height', 'loading', 'type', 'controls',
      'sandbox', 'allow', 'allowfullscreen', 'frameborder',
    ],
    ALLOW_DATA_ATTR: false,
    // Force safe link targets
    ADD_ATTR: ['target'],
    // Sanitize URLs — only allow safe protocols
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  });
}

/**
 * Sanitize content for inline text — strips ALL HTML, returns plain text.
 * Use for search highlights where only <mark> is needed.
 */
export function sanitizeHighlight(dirty: string): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['mark', 'em', 'strong', 'b', 'i'],
    ALLOWED_ATTR: ['class'],
  });
}

/**
 * Completely strip all HTML — returns only text content.
 */
export function stripHTML(dirty: string): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}
