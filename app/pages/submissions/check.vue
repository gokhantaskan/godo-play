<script setup lang="ts">
import { SUPPORTED_PC_STORES, SUPPORTED_PLATFORMS } from "~~/shared/constants";
import type { GameSubmission } from "~~/shared/types/submissions";

const { data, error } = await useFetch<{ submissions: GameSubmission[] }>(
  "/api/submissions/check"
);

// Pure helper functions
function getPlatformName(platformId: number): string {
  return (
    SUPPORTED_PLATFORMS.find(platform => platform.id === platformId)?.name ?? ""
  );
}

function getStoreName(storeSlug: string): string {
  return (
    SUPPORTED_PC_STORES.find(store => store.slug === storeSlug)?.label ?? ""
  );
}
</script>

<template>
  <div class="tw:container">
    <h1>Cross-Play Games</h1>

    <div v-if="error">
      <Icon name="lucide:alert-circle" />
      <span>Failed to load submissions</span>
    </div>

    <div v-else-if="data?.submissions?.length">
      <div
        v-for="submission in data.submissions"
        :key="submission.id"
      >
        <div>
          <NuxtImg
            :src="`https://images.igdb.com/igdb/image/upload/t_cover_big/${submission.gameImageId}.jpg`"
            :alt="submission.gameName"
          />
        </div>

        <div>
          <div>
            <h3>{{ submission.gameName }}</h3>
            <!-- <span :class="STATUS_COLORS[submission.status]">
              {{ submission.status }}
            </span> -->
          </div>

          <div class="submission-card__sections">
            <div v-if="submission.platformGroups?.length">
              <!-- <h4>Platform Groups</h4> -->
              <ul class="tw:list-none tw:p-0 tw:flex tw:flex-wrap tw:gap-2">
                <li
                  v-for="group in submission.platformGroups"
                  :key="group.id"
                  class="tw:inline-flex tw:items-center tw:gap-2 tw:border tw:rounded-md tw:p-1 tw:bg-gray-100 tw:text-sm tw:font-medium"
                >
                  <span>
                    {{
                      group.platforms.map(getPlatformName).sort().join(" + ")
                    }}
                  </span>
                </li>
              </ul>
            </div>

            <div v-if="submission.pcStorePlatforms?.length">
              <h4>PC Stores</h4>
              <ul>
                <li
                  v-for="store in submission.pcStorePlatforms"
                  :key="store.id"
                >
                  <span> {{ getStoreName(store.storeSlug) }}: </span>
                  <span>
                    {{
                      store.crossplayPlatforms
                        ?.map(getPlatformName)
                        .join(", ") ?? "N/A"
                    }}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <p v-else>No submissions found.</p>
  </div>
</template>
