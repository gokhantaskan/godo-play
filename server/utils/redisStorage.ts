import { createError } from "h3";
import { createStorage } from "unstorage";
import upstashDriver from "unstorage/drivers/upstash";

type RedisStorage = ReturnType<typeof createStorage>;
let _storage: RedisStorage | undefined;

function getStorage(): RedisStorage {
  if (!_storage) {
    throw createError({
      statusCode: 500,
      statusMessage: "Redis storage not initialized",
    });
  }
  return _storage;
}

function createRedisStorage(config: {
  url: string;
  token: string;
}): RedisStorage {
  if (!config.url || !config.token) {
    throw createError({
      statusCode: 500,
      statusMessage: "Redis configuration is missing required fields",
    });
  }

  return createStorage({
    driver: upstashDriver({
      base: "unstorage",
      url: config.url,
      token: config.token,
    }),
  });
}

async function initStorage(config: {
  url: string;
  token: string;
}): Promise<void> {
  try {
    _storage = createRedisStorage(config);
    // Test the connection
    await _storage.getItem("test_key");
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to initialize Redis storage",
      cause: error instanceof Error ? error : undefined,
    });
  }
}

export { getStorage, initStorage };
