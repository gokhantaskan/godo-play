import type { ReadGameMode, ReadStore } from "~~/shared/types";

export async function getGameModes() {
  return withErrorHandler(async () => {
    const response = await fetch("/api/game-modes");
    return (await response.json()) as ReadGameMode[];
  }, "Failed to fetch game modes");
}

export async function getStores() {
  return withErrorHandler(async () => {
    const response = await fetch("/api/stores");
    return (await response.json()) as ReadStore[];
  }, "Failed to fetch stores");
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
