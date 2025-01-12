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
    }),
  });

  storage.mount("redis", driver);
});
