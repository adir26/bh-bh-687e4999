import { useState, useCallback } from 'react';

interface UseSecureInputOptions {
  maxLength?: number;
  allowedChars?: RegExp;
  sanitizer?: (value: string) => string;
}

export const useSecureInput = (initialValue: string = '', options: UseSecureInputOptions = {}) => {
  const { maxLength, allowedChars, sanitizer } = options;
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  const sanitizeInput = useCallback((input: string): string => {
    let sanitized = input;
    
    // Apply custom sanitizer if provided
    if (sanitizer) {
      sanitized = sanitizer(sanitized);
    }
    
    // Remove potential XSS characters
    sanitized = sanitized
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();

    // Apply length limit
    if (maxLength && sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    // Apply allowed characters filter
    if (allowedChars && !allowedChars.test(sanitized)) {
      setError('תווים לא חוקיים בקלט');
      return value; // Return previous value if invalid
    }

    setError(null);
    return sanitized;
  }, [maxLength, allowedChars, sanitizer, value]);

  const updateValue = useCallback((newValue: string) => {
    const sanitizedValue = sanitizeInput(newValue);
    setValue(sanitizedValue);
    return sanitizedValue;
  }, [sanitizeInput]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
  }, [initialValue]);

  return {
    value,
    setValue: updateValue,
    error,
    reset,
    isValid: error === null
  };
};

// Predefined secure input patterns
export const secureInputPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  alphanumeric: /^[a-zA-Z0-9\u0590-\u05FF\s]*$/,
  numeric: /^[0-9]*$/,
  phone: /^[0-9\-+\s()]*$/,
  safeText: /^[a-zA-Z0-9\u0590-\u05FF\s\-_.,!?]*$/
};