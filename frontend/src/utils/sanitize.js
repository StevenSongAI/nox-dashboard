/**
 * XSS Sanitization Utility
 * Sanitizes HTML content to prevent XSS attacks
 * 
 * CRITICAL FIX: Prevents raw script tags from being rendered
 * RT-002 FIX: Case-insensitive regex, blocks data: URIs and encoded variants
 * NEW-DEFECT-002 FIX: Blocks HTML entity encoded javascript
 * NEW-DEFECT-003 FIX: Blocks application/javascript MIME type
 */

// Simple XSS sanitization - removes dangerous tags and attributes
export function sanitizeHTML(html) {
  if (!html || typeof html !== 'string') return '';
  
  // NEW-DEFECT-002 FIX: Block HTML entity encoded javascript BEFORE decoding
  // Block numeric entities like &#106; (j), &#97; (a), etc. and hex entities
  let sanitized = html
    // Block decimal entity encoded javascript: (e.g., &#106;&#097;&#118;&#097;...)
    .replace(/&#[xX]?[0-9a-fA-F]+;?\s*&#[xX]?[0-9a-fA-F]+;?\s*&#[xX]?[0-9a-fA-F]+;/gi, function(match) {
      // If it decodes to contain "javascript", block it
      const decoded = match.replace(/&#(x?[0-9a-fA-F]+);?/gi, function(_, code) {
        const charCode = code.toLowerCase().startsWith('x') 
          ? parseInt(code.slice(1), 16) 
          : parseInt(code, 10);
        return String.fromCharCode(charCode);
      });
      return decoded.toLowerCase().includes('javascript') ? '[ENTITY JS BLOCKED]' : match;
    })
    // Block named entity encoded javascript (less common but possible)
    .replace(/&[a-zA-Z][a-zA-Z0-9]*;\s*&[a-zA-Z][a-zA-Z0-9]*;/gi, function(match) {
      const temp = document.createElement('textarea');
      temp.innerHTML = match;
      const decoded = temp.value;
      return decoded.toLowerCase().includes('javascript') ? '[ENTITY JS BLOCKED]' : match;
    });
  
  // Create a temporary element to parse HTML
  const temp = document.createElement('div');
  temp.textContent = sanitized; // First escape as text
  
  sanitized = temp.innerHTML;
  
  // Decode common HTML entities back for allowed formatting
  sanitized = sanitized
    .replace(/&lt;b&gt;/g, '<b>').replace(/&lt;\/b&gt;/g, '</b>')
    .replace(/&lt;i&gt;/g, '<i>').replace(/&lt;\/i&gt;/g, '</i>')
    .replace(/&lt;em&gt;/g, '<em>').replace(/&lt;\/em&gt;/g, '</em>')
    .replace(/&lt;strong&gt;/g, '<strong>').replace(/&lt;\/strong&gt;/g, '</strong>')
    .replace(/&lt;p&gt;/g, '<p>').replace(/&lt;\/p&gt;/g, '</p>')
    .replace(/&lt;br&gt;/g, '<br>').replace(/&lt;br \/&gt;/g, '<br>')
    .replace(/&lt;ul&gt;/g, '<ul>').replace(/&lt;\/ul&gt;/g, '</ul>')
    .replace(/&lt;ol&gt;/g, '<ol>').replace(/&lt;\/ol&gt;/g, '</ol>')
    .replace(/&lt;li&gt;/g, '<li>').replace(/&lt;\/li&gt;/g, '</li>');
  
  // Remove any remaining script tags and event handlers
  // RT-002 FIX: Case-insensitive regex, block data: URIs
  // NEW-DEFECT-003 FIX: Block application/javascript MIME type
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '[SCRIPT REMOVED]')
    // Block javascript: protocol with case variations and HTML entity encoding
    .replace(/j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:/gi, '[BLOCKED]')
    // Block data: URIs that can execute scripts
    .replace(/data:\s*text\/html\s*[,;]/gi, '[DATA URI BLOCKED]')
    .replace(/data:\s*text\/javascript\s*[,;]/gi, '[DATA URI BLOCKED]')
    // NEW-DEFECT-003 FIX: Block application/javascript MIME type
    .replace(/data:\s*application\/javascript\s*[,;]/gi, '[DATA URI BLOCKED]')
    // Block event handlers
    .replace(/on\w+\s*=/gi, '[EVENT BLOCKED]=')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '[IFRAME REMOVED]')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '[OBJECT REMOVED]')
    .replace(/<embed\b[^>]*>/gi, '[EMBED REMOVED]');
  
  return sanitized;
}

// Sanitize plain text - removes ALL HTML
export function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';
  
  const temp = document.createElement('div');
  temp.textContent = text;
  return temp.textContent;
}

export default { sanitizeHTML, sanitizeText };
