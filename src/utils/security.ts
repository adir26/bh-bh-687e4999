// Security utilities for input validation and sanitization

export const sanitizeEmail = (email: string): string => {
  return email?.replace(/\u200F|\u200E/g, '').trim().toLowerCase();
};

export const sanitizeText = (text: string): string => {
  return text
    ?.replace(/[<>]/g, '') // Remove angle brackets
    ?.replace(/javascript:/gi, '') // Remove javascript: protocol
    ?.replace(/on\w+=/gi, '') // Remove event handlers
    ?.trim();
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!password || password.length < 8) {
    errors.push('סיסמה חייבת 8+ תווים ולשלב אותיות + (מספרים או סימנים)');
    return { isValid: false, errors };
  }
  
  const hasLetter = /[A-Za-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const classes = (hasLetter ? 1 : 0) + (hasDigit ? 1 : 0) + (hasSymbol ? 1 : 0);

  // Require letters + (numbers OR symbols)
  if (!hasLetter || classes < 2) {
    errors.push('סיסמה חייבת 8+ תווים ולשלב אותיות + (מספרים או סימנים)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(sanitizeEmail(email));
};

interface GenerateCspOptions {
  includeFrameAncestors?: boolean;
  includeUpgradeInsecureRequests?: boolean;
}

export const generateCSP = (options: GenerateCspOptions = {}): string => {
  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.ipify.org",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ];

  if (options.includeFrameAncestors) {
    directives.push("frame-ancestors 'none'");
  }

  if (options.includeUpgradeInsecureRequests) {
    directives.push('upgrade-insecure-requests');
  }

  return directives.join('; ');
};

// Rate limiting utility
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);
    
    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }
    
    if (attempt.count >= this.maxAttempts) {
      return false;
    }
    
    attempt.count++;
    return true;
  }
  
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
  
  getTimeToReset(identifier: string): number {
    const attempt = this.attempts.get(identifier);
    if (!attempt) return 0;
    
    return Math.max(0, attempt.resetTime - Date.now());
  }
}

// Security event logging
export const logSecurityEvent = async (event: string, details: Record<string, any> = {}) => {
  console.log(`[SECURITY] ${event}:`, {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...details
  });
  
  // In production, this should send to a security monitoring service
  // For now, we'll log to console and could extend to send to Supabase
};