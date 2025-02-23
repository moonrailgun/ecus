import { createCache } from "cache-manager";
import { Keyv } from "keyv";
import { CacheableMemory } from "cacheable";

export const cacheManager = createCache({
  stores: [
    new Keyv({
      store: new CacheableMemory({ ttl: 60_000, lruSize: 5000 }),
    }),
  ],
});
