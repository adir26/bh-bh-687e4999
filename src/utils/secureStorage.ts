// Secure storage utilities with encryption and automatic cleanup

interface StorageOptions {
  encrypt?: boolean;
  expiry?: number; // milliseconds
  sensitive?: boolean;
}

class SecureStorage {
  private static readonly ENCRYPTION_KEY = 'bonimpo_secure_key_v1';
  
  // Simple XOR encryption for basic obfuscation
  private static encrypt(text: string): string {
    const key = this.ENCRYPTION_KEY;
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result);
  }

  private static decrypt(encrypted: string): string {
    try {
      const text = atob(encrypted);
      const key = this.ENCRYPTION_KEY;
      let result = '';
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return result;
    } catch {
      return '';
    }
  }

  static set(key: string, value: any, options: StorageOptions = {}): void {
    try {
      const data = {
        value,
        timestamp: Date.now(),
        expiry: options.expiry ? Date.now() + options.expiry : null,
        sensitive: options.sensitive || false
      };

      let serializedData = JSON.stringify(data);
      
      if (options.encrypt || options.sensitive) {
        serializedData = this.encrypt(serializedData);
      }

      localStorage.setItem(key, serializedData);
    } catch (error) {
      console.error('SecureStorage.set error:', error);
    }
  }

  static get(key: string, encrypted = false): any {
    try {
      let data = localStorage.getItem(key);
      if (!data) return null;

      if (encrypted) {
        data = this.decrypt(data);
        if (!data) return null;
      }

      const parsed = JSON.parse(data);
      
      // Check expiry
      if (parsed.expiry && Date.now() > parsed.expiry) {
        this.remove(key);
        return null;
      }

      return parsed.value;
    } catch (error) {
      console.error('SecureStorage.get error:', error);
      this.remove(key);
      return null;
    }
  }

  static remove(key: string): void {
    localStorage.removeItem(key);
  }

  static clear(): void {
    localStorage.clear();
  }

  // Clean up expired items
  static cleanup(): void {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();

      keys.forEach(key => {
        try {
          const item = localStorage.getItem(key);
          if (!item) return;

          // Try to parse as our format
          const parsed = JSON.parse(item);
          if (parsed.expiry && now > parsed.expiry) {
            localStorage.removeItem(key);
          }
        } catch {
          // Not our format, skip
        }
      });
    } catch (error) {
      console.error('SecureStorage.cleanup error:', error);
    }
  }

  // Remove all sensitive data
  static clearSensitive(): void {
    try {
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        try {
          const item = localStorage.getItem(key);
          if (!item) return;

          const parsed = JSON.parse(item);
          if (parsed.sensitive) {
            localStorage.removeItem(key);
          }
        } catch {
          // Not our format, skip
        }
      });
    } catch (error) {
      console.error('SecureStorage.clearSensitive error:', error);
    }
  }
}

// Auto-cleanup on page load
if (typeof window !== 'undefined') {
  SecureStorage.cleanup();
  
  // Cleanup sensitive data on page unload
  window.addEventListener('beforeunload', () => {
    SecureStorage.clearSensitive();
  });
}

export { SecureStorage };