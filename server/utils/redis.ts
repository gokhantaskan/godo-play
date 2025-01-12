import { createStorage } from "unstorage";
import upstashDriver from "unstorage/drivers/upstash";

export const redisStorage = createStorage({
  driver: upstashDriver({
    base: "unstorage",
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  }),
});
