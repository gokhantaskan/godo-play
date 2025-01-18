import { createStorage } from "unstorage";
import redisDriver from "unstorage/drivers/redis";

// https://nitro.build/guide/storage#runtime-configuration
export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig();
  const storage = useStorage();

  const driver = createStorage({
    driver: redisDriver({
      base: "redis",
      host: config.redis.host,
      port: Number(config.redis.port),
      password: config.redis.password,
      connectTimeout: 10000,
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        if (times > 3) {
          console.error("Redis connection failed after 3 retries");
          return null;
        }
        return Math.min(times * 1000, 3000);
      },
    }),
  });

  storage.mount("redis", driver);
});
