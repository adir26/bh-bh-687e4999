import { supabase } from '@/integrations/supabase/client';

export class QueryCancelled extends Error {
  constructor() {
    super('Query was cancelled');
    this.name = 'QueryCancelled';
  }
}

export async function supaSelect<T>(
  builder: any,
  options?: { signal?: AbortSignal; errorMessage?: string; timeoutMs?: number }
): Promise<T> {
  const timeoutMs = options?.timeoutMs || 15_000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort('timeout'), timeoutMs);
  
  // Combine parent signal with timeout signal
  const combinedSignal = options?.signal ? combineAbortSignals([options.signal, controller.signal]) : controller.signal;
  
  try {
    const { data, error } = await builder;
    
    if (error) {
      throw new Error(options?.errorMessage || error.message);
    }
    
    return data as T;
  } catch (error: any) {
    if (combinedSignal.aborted) {
      throw new QueryCancelled();
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function combineAbortSignals(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      break;
    }
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }
  
  return controller.signal;
}

export async function supaSelectMaybe<T>(
  builder: any,
  options?: { signal?: AbortSignal; errorMessage?: string; timeoutMs?: number }
): Promise<T | null> {
  const timeoutMs = options?.timeoutMs || 15_000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort('timeout'), timeoutMs);
  
  const combinedSignal = options?.signal ? combineAbortSignals([options.signal, controller.signal]) : controller.signal;
  
  try {
    const { data, error } = await builder.maybeSingle();
    
    if (error) {
      throw new Error(options?.errorMessage || error.message);
    }
    
    return data as T | null;
  } catch (error: any) {
    if (combinedSignal.aborted) {
      throw new QueryCancelled();
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function supaInsert<T>(
  builder: any,
  options?: { signal?: AbortSignal; errorMessage?: string }
): Promise<T> {
  try {
    const { data, error } = await builder;
    
    if (error) {
      throw new Error(options?.errorMessage || error.message);
    }
    
    return data as T;
  } catch (error) {
    if (options?.signal?.aborted) {
      throw new QueryCancelled();
    }
    throw error;
  }
}

export async function supaUpdate<T>(
  builder: any,
  options?: { signal?: AbortSignal; errorMessage?: string }
): Promise<T> {
  try {
    const { data, error } = await builder;
    
    if (error) {
      throw new Error(options?.errorMessage || error.message);
    }
    
    return data as T;
  } catch (error) {
    if (options?.signal?.aborted) {
      throw new QueryCancelled();
    }
    throw error;
  }
}

export async function supaDelete<T>(
  builder: any,
  options?: { signal?: AbortSignal; errorMessage?: string }
): Promise<T> {
  try {
    const { data, error } = await builder;
    
    if (error) {
      throw new Error(options?.errorMessage || error.message);
    }
    
    return data as T;
  } catch (error) {
    if (options?.signal?.aborted) {
      throw new QueryCancelled();
    }
    throw error;
  }
}