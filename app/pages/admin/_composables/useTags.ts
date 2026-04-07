import { createSharedComposable } from "@vueuse/core";

import type { DbTag } from "~~/server/db/schema";

export const useTags = createSharedComposable(() => {
  return useFetch<DbTag[]>("/api/tags");
});
