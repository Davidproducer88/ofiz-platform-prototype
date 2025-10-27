/**
 * Input sanitization utilities for security
 * Prevents XSS and injection attacks
 */

/**
 * Sanitize text input by removing potentially dangerous characters
 * while preserving valid text
 */
export const sanitizeText = (input: string): string => {
  if (!input) return '';
  
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Remove script-like content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
};

/**
 * Sanitize HTML to prevent XSS attacks
 * Only allows safe tags and attributes
 */
export const sanitizeHTML = (input: string): string => {
  if (!input) return '';
  
  // List of allowed tags
  const allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'];
  
  // Remove all HTML except allowed tags
  let sanitized = input;
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = sanitized;
  
  // Remove all scripts
  const scripts = tempDiv.getElementsByTagName('script');
  for (let i = scripts.length - 1; i >= 0; i--) {
    scripts[i].remove();
  }
  
  // Remove event handlers
  const allElements = tempDiv.getElementsByTagName('*');
  for (let i = 0; i < allElements.length; i++) {
    const element = allElements[i];
    const attributes = element.attributes;
    
    for (let j = attributes.length - 1; j >= 0; j--) {
      const attrName = attributes[j].name;
      if (attrName.startsWith('on') || attrName === 'href' && element.getAttribute(attrName)?.startsWith('javascript:')) {
        element.removeAttribute(attrName);
      }
    }
    
    // Remove non-allowed tags
    if (!allowedTags.includes(element.tagName.toLowerCase())) {
      element.replaceWith(...Array.from(element.childNodes));
    }
  }
  
  return tempDiv.innerHTML;
};

/**
 * Sanitize email input
 */
export const sanitizeEmail = (email: string): string => {
  if (!email) return '';
  return email.trim().toLowerCase();
};

/**
 * Sanitize phone number
 */
export const sanitizePhone = (phone: string): string => {
  if (!phone) return '';
  // Keep only numbers, +, -, (, ), and spaces
  return phone.replace(/[^0-9+\-\s()]/g, '').trim();
};

/**
 * Sanitize URL
 */
export const sanitizeURL = (url: string): string => {
  if (!url) return '';
  
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
};

/**
 * Encode for URL parameter
 */
export const encodeForURL = (param: string): string => {
  if (!param) return '';
  return encodeURIComponent(param);
};

/**
 * Sanitize search query
 */
export const sanitizeSearchQuery = (query: string): string => {
  if (!query) return '';
  
  // Remove special SQL characters that could be used for injection
  let sanitized = query.replace(/['";\\]/g, '');
  
  // Limit length
  sanitized = sanitized.substring(0, 100);
  
  return sanitized.trim();
};
