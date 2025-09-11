// Enhanced input sanitization utilities

interface SanitizationOptions {
  allowHTML?: boolean;
  allowedTags?: string[];
  maxLength?: number;
  trimWhitespace?: boolean;
}

class InputSanitizer {
  // XSS prevention patterns
  private static readonly XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^>]*>/gi,
    /<object\b[^>]*>/gi,
    /<embed\b[^>]*>/gi,
    /<form\b[^>]*>/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /<meta\b[^>]*>/gi,
    /<link\b[^>]*>/gi
  ];

  // SQL injection patterns
  private static readonly SQL_PATTERNS = [
    /(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT( +INTO)?|MERGE|SELECT|UPDATE|UNION( +ALL)?)\b)/gi,
    /(\b(AND|OR)\b.{1,6}?(=|>|<|\s+IS\s+|\s+LIKE\s+|BETWEEN\s+))/gi,
    /\b(HAVING|ORDER\s+BY|GROUP\s+BY)\b/gi,
    /--[^\r\n]*/gi,
    /\/\*[\s\S]*?\*\//gi
  ];

  static sanitizeText(input: string, options: SanitizationOptions = {}): string {
    if (!input || typeof input !== 'string') return '';

    let sanitized = input;

    // Trim whitespace if requested
    if (options.trimWhitespace !== false) {
      sanitized = sanitized.trim();
    }

    // Apply length limit
    if (options.maxLength && sanitized.length > options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength);
    }

    // Remove XSS patterns
    this.XSS_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Remove SQL injection patterns
    this.SQL_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Handle HTML
    if (!options.allowHTML) {
      sanitized = this.escapeHTML(sanitized);
    } else if (options.allowedTags) {
      sanitized = this.sanitizeHTML(sanitized, options.allowedTags);
    }

    // Remove null bytes and control characters
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    return sanitized;
  }

  static sanitizeEmail(email: string): string {
    if (!email) return '';
    
    // Basic email sanitization
    let sanitized = email.toLowerCase().trim();
    
    // Remove potentially dangerous characters
    sanitized = sanitized.replace(/[<>"'&()]/g, '');
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized)) {
      throw new Error('Invalid email format');
    }
    
    return sanitized;
  }

  static sanitizePhone(phone: string): string {
    if (!phone) return '';
    
    // Remove all non-numeric characters except + and -
    let sanitized = phone.replace(/[^\d+\-\s()]/g, '');
    
    // Limit length
    if (sanitized.length > 20) {
      sanitized = sanitized.substring(0, 20);
    }
    
    return sanitized.trim();
  }

  static sanitizeURL(url: string): string {
    if (!url) return '';
    
    try {
      const parsed = new URL(url);
      
      // Only allow safe protocols
      if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
        throw new Error('Invalid protocol');
      }
      
      return parsed.toString();
    } catch {
      return '';
    }
  }

  private static escapeHTML(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private static sanitizeHTML(html: string, allowedTags: string[]): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    
    const walker = document.createTreeWalker(
      div,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node: Element) => {
          if (allowedTags.includes(node.tagName.toLowerCase())) {
            // Remove dangerous attributes
            const dangerousAttrs = ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur'];
            dangerousAttrs.forEach(attr => {
              if (node.hasAttribute(attr)) {
                node.removeAttribute(attr);
              }
            });
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_REJECT;
        }
      }
    );

    const allowedNodes: Node[] = [];
    let currentNode = walker.nextNode();
    while (currentNode) {
      allowedNodes.push(currentNode);
      currentNode = walker.nextNode();
    }

    // Remove disallowed nodes
    const allNodes = Array.from(div.querySelectorAll('*'));
    allNodes.forEach(node => {
      if (!allowedNodes.includes(node)) {
        node.remove();
      }
    });

    return div.innerHTML;
  }

  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!password || password.length < 8) {
      errors.push('Password must be 8+ chars and include letters + (numbers or symbols)');
    }
    
    const hasLetter = /[A-Za-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    const classes = (hasLetter ? 1 : 0) + (hasDigit ? 1 : 0) + (hasSymbol ? 1 : 0);

    // Require letters + (numbers OR symbols)
    if (!hasLetter || classes < 2) {
      errors.push('Password must be 8+ chars and include letters + (numbers or symbols)');
    }
    
    // Check against common passwords
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];
    
    if (commonPasswords.some(common => 
      password.toLowerCase().includes(common.toLowerCase()))) {
      errors.push('Password contains common patterns');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export { InputSanitizer, type SanitizationOptions };