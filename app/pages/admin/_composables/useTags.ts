import { createSharedComposable } from "@vueuse/core";

import type { Tag } from "~~/server/db/schema";

export const useTags = createSharedComposable(() => {
  return useFetch<Tag[]>("/api/tags");
});
