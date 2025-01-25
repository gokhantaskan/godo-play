<script setup lang="ts">
import { z } from "zod";

import type { PlatformId } from "~/types/crossPlay";
import type { PCStore, PCStoreData, PlatformGroups } from "~/types/submit-game";
import {
  GAME_MODES,
  SUPPORTED_PC_STORES,
  SUPPORTED_PLATFORMS,
} from "~~/shared/constants";
import { InsertPcStorePlatformSchema } from "~~/shared/schemas/pcStorePlatform";
import { InsertPlatformGroupSchema } from "~~/shared/schemas/platformGroup";

const platformGroups = defineModel<PlatformGroups>("platformGroups", {
  required: true,
  default: [[]],
});

const pcStores = defineModel<PCStore["slug"][]>("pcStores", {
  required: true,
  default: [],
});

const pcStorePlatforms = defineModel<PCStoreData>("pcStorePlatforms", {
  required: true,
  default: {},
});

const gameModes = defineModel<number[]>("gameModes", {
  required: true,
  default: [],
});

// Validation state
const errors = ref<Record<string, string>>({});

// Computed properties
const selectedPlatformGroups = computed(() => platformGroups.value);

const platformGroupIndexWithPC = computed(() => {
  const index = selectedPlatformGroups.value.findIndex(group =>
    group.includes(6)
  );
  return index === -1 ? null : index;
});

const platformsWithPC = computed(() => {
  if (platformGroupIndexWithPC.value === null) {
    return [];
  }

  return selectedPlatformGroups.value[platformGroupIndexWithPC.value];
});

const allSelected = computed(() => {
  const selectedPlatforms = new Set(selectedPlatformGroups.value.flat());
  return SUPPORTED_PLATFORMS.every(platform =>
    selectedPlatforms.has(platform.id)
  );
});

// Methods
function getExcludedPlatforms(currentGroupIndex: number): PlatformId[] {
  return selectedPlatformGroups.value.reduce<PlatformId[]>(
    (acc, group, index) => {
      if (index !== currentGroupIndex) {
        acc.push(...group);
      }
      return acc;
    },
    []
  );
}

function addPlatformGroup(): void {
  platformGroups.value = [...platformGroups.value, []];
}

function removePlatformGroup(index: number): void {
  platformGroups.value = platformGroups.value.filter((_, i) => i !== index);

  if (platformGroups.value.length === 0) {
    platformGroups.value = [[]];
  }
}

function updatePcStorePlatforms(
  store: PCStore["slug"],
  platforms: PlatformId[]
): void {
  try {
    // Validate the store slug
    InsertPcStorePlatformSchema.parse({
      storeSlug: store,
      submissionId: 0, // This will be set by the server
    });

    pcStorePlatforms.value[store] = {
      crossplayPlatforms: platforms,
    };

    // Clear any previous errors
    errors.value = {
      ...errors.value,
      [`pcStorePlatforms.${store}`]: "",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.value = {
        ...errors.value,
        [`pcStorePlatforms.${store}`]:
          error.errors[0]?.message || "Invalid data",
      };
    }
  }
}

// Watchers
watch(
  platformGroups,
  groups => {
    const hasPCPlatform = groups.some(group => group.includes(6 as PlatformId));

    if (!hasPCPlatform) {
      pcStores.value = [];
      pcStorePlatforms.value = {};
    }

    // Validate each group
    groups.forEach((group, index) => {
      try {
        InsertPlatformGroupSchema.parse({
          submissionId: 0, // This will be set by the server
        });
        errors.value = {
          ...errors.value,
          [`platformGroups.${index}`]: "",
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.value = {
            ...errors.value,
            [`platformGroups.${index}`]:
              error.errors[0]?.message || "Invalid platform group",
          };
        }
      }
    });
  },
  { deep: true }
);

watch(
  pcStores,
  (newStores, oldStores) => {
    if (oldStores) {
      const removedStores = oldStores.filter(
        store => !newStores.includes(store)
      );

      pcStorePlatforms.value = Object.fromEntries(
        Object.entries(pcStorePlatforms.value).filter(
          ([store]) => !removedStores.includes(store as PCStore["slug"])
        )
      );
    }

    newStores.forEach(store => {
      if (!pcStorePlatforms.value[store]) {
        pcStorePlatforms.value = {
          ...pcStorePlatforms.value,
          [store]: { crossplayPlatforms: [] },
        };
      }
    });
  },
  { deep: true }
);
</script>

<template>
  <div>
    <fieldset>
      <legend>Game Modes</legend>
      <p class="tw:text-sm tw:text-text-muted tw:mb-4">
        Select at least one game mode that the game supports.
      </p>
      <div class="tw:space-y-2">
        <div
          v-for="mode in GAME_MODES"
          :key="mode.id"
          class="tw:flex tw:items-center tw:gap-2"
        >
          <input
            :id="mode.slug"
            v-model="gameModes"
            type="checkbox"
            class="checkbox"
            :value="mode.id"
          />
          <label :for="mode.slug">{{ mode.name }}</label>
        </div>
      </div>
    </fieldset>

    <fieldset>
      <legend>Platforms</legend>
      <p class="tw:text-sm tw:text-text-muted tw:mb-4">
        Choose compatible platforms for the game. Groups specify which platforms
        can play together.
        <strong class="tw:inline-block"
          >If the game doesn't support cross-play, list each platform in its own
          group.</strong
        >
      </p>
      <div
        v-for="(_, groupIndex) in platformGroups"
        :key="groupIndex"
        class="tw:flex tw:items-center tw:gap-2 tw:mb-4 tw:last-of-type:mb-0"
      >
        <div class="tw:flex-1">
          <PlatformSelect
            v-model="platformGroups[groupIndex]"
            :label="`Group ${groupIndex + 1}`"
            multiple
            :exclude-platforms="getExcludedPlatforms(groupIndex)"
          />
          <p
            v-if="errors[`platformGroups.${groupIndex}`]"
            class="tw:text-sm tw:text-error tw:mt-1"
          >
            {{ errors[`platformGroups.${groupIndex}`] }}
          </p>
        </div>
        <CloseButton
          v-if="platformGroups.length > 1"
          size="lg"
          @click="removePlatformGroup(groupIndex)"
        />
      </div>

      <TheButton
        class="tw:mt-4"
        type="button"
        size="sm"
        variant="secondary"
        :disabled="
          selectedPlatformGroups[selectedPlatformGroups.length - 1]?.length ===
            0 || allSelected
        "
        @click="addPlatformGroup"
      >
        Add Platform Group
      </TheButton>
    </fieldset>

    <fieldset :disabled="!platformsWithPC?.length">
      <legend class="tw:text-lg tw:font-medium tw:mb-2">PC Stores</legend>
      <p class="tw:text-sm tw:text-text-muted tw:mb-4">
        Select PC stores where the game is available and specify which platforms
        can play with each store's version.
        <strong class="tw:inline-block"
          >If the store doesn't support cross-play, leave the box empty.</strong
        >
      </p>
      <div class="tw:space-y-4">
        <div
          v-for="store in SUPPORTED_PC_STORES"
          :key="store.slug"
          class="tw:space-y-1"
        >
          <label class="tw:flex tw:items-center tw:gap-2">
            <input
              :id="store.slug"
              v-model="pcStores"
              type="checkbox"
              class="checkbox"
              :value="store.slug"
            />
            <span>{{ store.name }}</span>
          </label>

          <div v-if="pcStores.includes(store.slug)">
            <PlatformSelect
              :model-value="
                pcStorePlatforms[store.slug]?.crossplayPlatforms ?? []
              "
              :label="`Select platforms that ${store.name} version can play with`"
              multiple
              :include-platforms="
                platformsWithPC?.filter(platform => platform !== 6)
              "
              @update:model-value="
                updatePcStorePlatforms(
                  store.slug,
                  Array.isArray($event) ? $event : [$event]
                )
              "
            />
            <p
              v-if="errors[`pcStorePlatforms.${store.slug}`]"
              class="tw:text-sm tw:text-error tw:mt-1"
            >
              {{ errors[`pcStorePlatforms.${store.slug}`] }}
            </p>
          </div>
        </div>
      </div>
    </fieldset>
  </div>
</template>
