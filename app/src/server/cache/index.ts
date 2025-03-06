import { createCache } from "cache-manager";
import { Keyv } from "keyv";
import KeyvRedis from "@keyv/redis";
import { CacheableMemory } from "cacheable";

import { env } from "@/env";

export const cacheManager = createCache({
  stores: [
    env.REDIS_URL
      ? new Keyv({
          store: new KeyvRedis(env.REDIS_URL),
        })
      : new Keyv({
          // store: new CacheableMemory({ ttl: 60_000, lruSize: 5000 }), // NOTICE: can not clear if set options
          store: new CacheableMemory(),
        }),
  ],
});
