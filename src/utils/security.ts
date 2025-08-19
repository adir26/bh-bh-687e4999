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
  
  if (password.length < 8) {
    errors.push('הסיסמה חייבת להכיל לפחות 8 תווים');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('הסיסמה חייבת להכיל לפחות אות גדולה אחת');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('הסיסמה חייבת להכיל לפחות אות קטנה אחת');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('הסיסמה חייבת להכיל לפחות ספרה אחת');
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

export const generateCSP = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'"
  ].join('; ');
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