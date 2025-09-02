export async function withTimeout<T>(p: Promise<T> | PromiseLike<T>, ms = 12_000): Promise<T> {
  return Promise.race<T>([
    p as any,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Request timeout after ${ms}ms`)), ms)
    ),
  ]);
}