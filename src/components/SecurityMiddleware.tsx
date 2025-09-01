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
      // Stronger Content Security Policy
      const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (!cspMeta) {
        const meta = document.createElement('meta');
        meta.setAttribute('http-equiv', 'Content-Security-Policy');
        meta.setAttribute('content', 
          "default-src 'self'; " +
          "script-src 'self' https://cdn.jsdelivr.net https://unpkg.com; " +
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
          "img-src 'self' data: https: blob:; " +
          "connect-src 'self' https://yislkmhnitznvbxfpcxd.supabase.co wss://yislkmhnitznvbxfpcxd.supabase.co https://api.ipify.org; " +
          "font-src 'self' https://fonts.gstatic.com; " +
          "frame-ancestors 'none'; " +
          "base-uri 'self'; " +
          "form-action 'self'; " +
          "upgrade-insecure-requests;"
        );
        document.head.appendChild(meta);
      }

      // Add Referrer Policy
      const referrerMeta = document.querySelector('meta[name="referrer"]');
      if (!referrerMeta) {
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'referrer');
        meta.setAttribute('content', 'strict-origin-when-cross-origin');
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

  // Enhanced security monitoring - React-safe approach
  useEffect(() => {
    // Monitor for XSS attempts without direct DOM manipulation
    const securityCheck = (element: Element): boolean => {
      const innerHTML = element.innerHTML || '';
      const tagName = element.tagName || '';
      
      return tagName === 'SCRIPT' || 
             innerHTML.includes('<script') ||
             innerHTML.includes('javascript:') ||
             /on\w+=/i.test(innerHTML);
    };

    // Use a less aggressive approach that doesn't interfere with React
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              if (securityCheck(element)) {
                console.warn('Potential XSS attempt detected', element);
                // Instead of removing directly, sanitize the content
                try {
                  // Only sanitize attributes, let React handle DOM structure
                  element.removeAttribute('onclick');
                  element.removeAttribute('onerror');
                  element.removeAttribute('onload');
                  element.removeAttribute('onmouseover');
                  
                  // For script tags, disable them instead of removing
                  if (element.tagName === 'SCRIPT') {
                    element.setAttribute('type', 'text/plain');
                  }
                } catch (e) {
                  // If we can't sanitize safely, just log it
                  console.error('Security sanitization failed:', e);
                }
              }
            }
          });
        }
      });
    });

    // Reduce the scope of observation to avoid conflicts with React
    observer.observe(document.body, {
      childList: true,
      subtree: false, // Don't observe deep changes
      attributes: true,
      attributeFilter: ['onclick', 'onerror', 'onload', 'onmouseover']
    });

    // Monitor for suspicious console access
    const originalLog = console.log;
    
    console.log = (...args) => {
      // Monitor for potential credential exposure
      const message = args.join(' ');
      if (message.includes('password') || message.includes('token') || message.includes('secret')) {
        console.warn('Potential credential exposure in console');
      }
      originalLog.apply(console, args);
    };

    return () => {
      observer.disconnect();
      console.log = originalLog;
    };
  }, []);

  return <>{children}</>;
};