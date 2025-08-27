import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSecureInput } from '@/hooks/useSecureInput';
import { SecureStorage } from '@/utils/secureStorage';

interface SecurityMiddlewareProps {
  children: React.ReactNode;
}

// Global security middleware component
export const SecurityMiddleware: React.FC<SecurityMiddlewareProps> = ({ children }) => {
  const { user, profile } = useAuth();

  useEffect(() => {
    // Set up security headers via meta tags
    const setSecurityHeaders = () => {
      // Content Security Policy
      const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (!cspMeta) {
        const meta = document.createElement('meta');
        meta.setAttribute('http-equiv', 'Content-Security-Policy');
        meta.setAttribute('content', 
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; " +
          "style-src 'self' 'unsafe-inline' https:; " +
          "img-src 'self' data: https:; " +
          "connect-src 'self' https://yislkmhnitznvbxfpcxd.supabase.co wss://yislkmhnitznvbxfpcxd.supabase.co; " +
          "font-src 'self' https:; " +
          "frame-ancestors 'none';"
        );
        document.head.appendChild(meta);
      }

      // X-Frame-Options
      const frameMeta = document.querySelector('meta[name="X-Frame-Options"]');
      if (!frameMeta) {
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'X-Frame-Options');
        meta.setAttribute('content', 'DENY');
        document.head.appendChild(meta);
      }

      // X-Content-Type-Options
      const contentTypeMeta = document.querySelector('meta[name="X-Content-Type-Options"]');
      if (!contentTypeMeta) {
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'X-Content-Type-Options');
        meta.setAttribute('content', 'nosniff');
        document.head.appendChild(meta);
      }
    };

    setSecurityHeaders();

    // Monitor for suspicious activity
    const monitorSecurity = () => {
      // Log failed authentication attempts
      let failedAttempts = SecureStorage.get('failed_auth_attempts') || 0;
      
      // Clean up expired sessions periodically
      const cleanupInterval = setInterval(() => {
        SecureStorage.cleanup();
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(cleanupInterval);
    };

    const cleanup = monitorSecurity();

    // Session security for authenticated users
    if (user && profile) {
      // Log successful authentication
      SecureStorage.set('last_auth_success', {
        userId: user.id,
        timestamp: Date.now(),
        role: profile.role
      }, {
        expiry: 24 * 60 * 60 * 1000, // 24 hours
        sensitive: true
      });

      // Reset failed attempts on successful auth
      SecureStorage.remove('failed_auth_attempts');
    }

    return cleanup;
  }, [user, profile]);

  // Monitor for XSS attempts
  useEffect(() => {
    const detectXSS = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'SCRIPT' || target.innerHTML?.includes('<script')) {
        console.warn('Potential XSS attempt detected');
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener('DOMNodeInserted', detectXSS, true);
    
    return () => {
      document.removeEventListener('DOMNodeInserted', detectXSS, true);
    };
  }, []);

  return <>{children}</>;
};