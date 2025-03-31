import type { ReadGameMode, ReadStore, ReadTag } from "~~/shared/types";

export async function getGameModes() {
  try {
    const modes = await $fetch<ReadGameMode[]>("/api/game-modes");
    return modes;
  } catch (error) {
    console.error("Failed to fetch game modes", error);
    return [];
  }
}

export async function getStores() {
  return withErrorHandler(async () => {
    const response = await fetch("/api/stores");
    return (await response.json()) as ReadStore[];
  }, "Failed to fetch stores");
}

export async function getTags() {
  try {
    const tags = await $fetch<ReadTag[]>("/api/tags");
    return tags;
  } catch (error) {
    console.error("Failed to fetch tags", error);
    return [];
  }
}

async function withErrorHandler<T>(
  fn: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      throw createError(error);
    }

    throw createError({
      statusCode: 500,
      statusMessage: errorMessage,
    });
  }
}
