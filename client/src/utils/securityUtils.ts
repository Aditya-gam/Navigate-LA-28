/**
 * Security utility functions for input sanitization and validation
 */

/**
 * Sanitizes user input to prevent XSS attacks
 * @param input - The input string to sanitize
 * @returns Sanitized string safe for display
 */
export const sanitizeInput = (input: string | null | undefined): string => {
  if (!input) return '';
  
  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove javascript: and vbscript: protocols
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/vbscript:/gi, '');
  
  // Remove on* event handlers
  sanitized = sanitized.replace(/\son\w+\s*=\s*"[^"]*"/gi, '');
  sanitized = sanitized.replace(/\son\w+\s*=\s*'[^']*'/gi, '');
  
  // Remove other potentially dangerous tags
  sanitized = sanitized.replace(/<(iframe|object|embed|form|input)\b[^>]*>/gi, '');
  
  return sanitized.trim();
};

/**
 * Validates if a URL is safe to use
 * @param url - The URL to validate
 * @returns True if URL is safe, false otherwise
 */
export const validateUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    
    // Block dangerous protocols
    const dangerousProtocols = ['javascript:', 'vbscript:', 'data:', 'file:'];
    const lowerUrl = url.toLowerCase();
    if (dangerousProtocols.some(protocol => lowerUrl.startsWith(protocol))) {
      return false;
    }
    
    // In production, only allow HTTPS (except for localhost in development)
    if (process.env.NODE_ENV === 'production') {
      if (urlObj.protocol !== 'https:') {
        return false;
      }
    } else {
      // In development, allow HTTP for localhost/127.0.0.1
      const allowedHosts = ['localhost', '127.0.0.1', '0.0.0.0'];
      if (urlObj.protocol === 'http:' && !allowedHosts.includes(urlObj.hostname)) {
        return false;
      }
    }
    
    return true;
  } catch {
    return false;
  }
};

/**
 * Escapes HTML entities in a string
 * @param html - The HTML string to escape
 * @returns Escaped HTML string
 */
export const escapeHtml = (html: string | null | undefined): string => {
  if (!html) return '';
  
  const entityMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };
  
  return html.replace(/[&<>"'/]/g, char => entityMap[char] || char);
};

/**
 * Validates and sanitizes an email address
 * @param email - The email to validate
 * @returns Sanitized email if valid, empty string if invalid
 */
export const validateEmail = (email: string | null | undefined): string => {
  if (!email) return '';
  
  const sanitized = sanitizeInput(email);
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  return emailRegex.test(sanitized) ? sanitized : '';
};

/**
 * Validates if a string contains only safe characters for file names
 * @param filename - The filename to validate
 * @returns True if filename is safe, false otherwise
 */
export const validateFilename = (filename: string | null | undefined): boolean => {
  if (!filename) return false;
  
  // Block dangerous patterns and characters
  const dangerousPatterns = [
    /\.\./,    // Directory traversal
    /[<>:"|?*]/,    // Windows reserved characters
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\..*)?$/i,    // Windows reserved names
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(filename));
};

/**
 * Creates a Content Security Policy (CSP) header value
 * @returns CSP header value string
 */
export const createCSPHeader = (): string => {
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://apis.google.com https://maps.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.example.com http://localhost:8001",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ];
  
  return cspDirectives.join('; ');
};

/**
 * Generates a random nonce for CSP
 * @returns Random nonce string
 */
export const generateNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}; 