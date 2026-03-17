import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SecureStorage } from '@/utils/secureStorage';
import { generateCSP } from '@/utils/security';

interface SecurityMiddlewareProps {
  children: React.ReactNode;
}

// Global security middleware component - lightweight version
export const SecurityMiddleware: React.FC<SecurityMiddlewareProps> = ({ children }) => {
  const { user, profile } = useAuth();
  const headersSetRef = useRef(false);

  // Set security headers once
  useEffect(() => {
    if (headersSetRef.current) return;
    headersSetRef.current = true;

    const setSecurityHeaders = () => {
      const headers: Record<string, { attr: string; name: string; content: string }> = {
        csp: { attr: 'http-equiv', name: 'Content-Security-Policy', content: generateCSP({ includeUpgradeInsecureRequests: true }) },
        referrer: { attr: 'name', name: 'referrer', content: 'strict-origin-when-cross-origin' },
      };

      Object.values(headers).forEach(({ attr, name, content }) => {
        if (!document.querySelector(`meta[${attr}="${name}"]`)) {
          const meta = document.createElement('meta');
          meta.setAttribute(attr, name);
          meta.setAttribute('content', content);
          document.head.appendChild(meta);
        }
      });
    };

    setSecurityHeaders();

    // Clean up expired sessions periodically
    const cleanupInterval = setInterval(() => SecureStorage.cleanup(), 5 * 60 * 1000);
    return () => clearInterval(cleanupInterval);
  }, []);

  // Session security for authenticated users
  useEffect(() => {
    if (user && profile) {
      SecureStorage.set('last_auth_success', {
        userId: user.id,
        timestamp: Date.now(),
        role: (profile as any).role
      }, {
        expiry: 24 * 60 * 60 * 1000,
        sensitive: true
      });
      SecureStorage.remove('failed_auth_attempts');
    }
  }, [user?.id, (profile as any)?.role]);

  return <>{children}</>;
};
