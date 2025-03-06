import { cacheManager } from ".";

export interface CachedFunctionOptions<Args extends unknown[], Result> {
  fn: (...args: Args) => Promise<Result>;
  keyFn: (...args: Args) => string;
  ttl: number;
}

export function createCachedFunction<Args extends unknown[], Result>(
  options: CachedFunctionOptions<Args, Result>,
): (...args: Args) => Promise<Result> {
  const { fn, keyFn, ttl } = options;

  return async (...args: Args): Promise<Result> => {
    const cacheKey = keyFn(...args);
    const cached = await cacheManager.get<Result>(cacheKey);

    if (cached) {
      console.log("Apply cache:", cacheKey);
      return cached;
    }

    const result = await fn(...args);

    void cacheManager.set(cacheKey, result, ttl);

    return result;
  };
}
