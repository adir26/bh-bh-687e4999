export async function withTimeout<T>(p: Promise<T>, ms = 12_000): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Request timeout after ${ms}ms`)), ms)
    ),
  ]) as Promise<T>;
}