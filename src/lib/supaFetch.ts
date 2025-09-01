import { supabase } from '@/integrations/supabase/client';

export class QueryCancelled extends Error {
  constructor() {
    super('Query was cancelled');
    this.name = 'QueryCancelled';
  }
}

export async function supaSelect<T>(
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

export async function supaSelectMaybe<T>(
  builder: any,
  options?: { signal?: AbortSignal; errorMessage?: string }
): Promise<T | null> {
  try {
    const { data, error } = await builder.maybeSingle();
    
    if (error) {
      throw new Error(options?.errorMessage || error.message);
    }
    
    return data as T | null;
  } catch (error) {
    if (options?.signal?.aborted) {
      throw new QueryCancelled();
    }
    throw error;
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