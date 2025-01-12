<script setup lang="ts">
import { SUPPORTED_PLATFORMS } from "~~/shared/constants/platforms";
import type { MultiplayerMode } from "~~/shared/types/igdb/gameDetails";

interface Props {
  multiplayerModes: MultiplayerMode[];
}

type PlatformKey = (typeof SUPPORTED_PLATFORMS)[number]["name"] | "Unknown";
type GroupedModes = Record<PlatformKey, [MultiplayerMode]>;

const props = defineProps<Props>();

const multiplayerModes = toRef(
  () =>
    Object.groupBy(
      props.multiplayerModes ?? [],
      ({ platform }) =>
        SUPPORTED_PLATFORMS.find(p => p.id === platform)?.name ?? "Unknown"
    ) as GroupedModes
);
</script>

<template>
  <div class="multiplayer-modes">
    <template v-if="Object.keys(multiplayerModes).length">
      <div
        v-for="(modes, platform) in multiplayerModes"
        :key="platform"
        class="multiplayer-modes__platform"
      >
        <h3
          v-if="
            Object.keys(multiplayerModes).length > 1 && platform !== 'Unknown'
          "
          class="multiplayer-modes__platform-title"
        >
          {{ platform }}
        </h3>
        <dl
          v-for="mode in modes"
          :key="mode.id"
          class="multiplayer-modes__mode"
        >
          <dt class="multiplayer-modes__mode-label">Drop-in</dt>
          <dd class="multiplayer-modes__mode-value">
            <TheBooleanIndicator :value="mode.dropin" />
          </dd>
          <dt class="multiplayer-modes__mode-label">Campaign Co-op</dt>
          <dd class="multiplayer-modes__mode-value">
            <TheBooleanIndicator :value="mode.campaigncoop" />
          </dd>
          <dt class="multiplayer-modes__mode-label">Online Co-op</dt>
          <dd class="multiplayer-modes__mode-value">
            <TheBooleanIndicator :value="mode.onlinecoop" />
            <span
              v-if="mode.onlinecoopmax"
              class="multiplayer-modes__player-count"
            >
              Up to {{ mode.onlinecoopmax }} players
            </span>
          </dd>
          <dt class="multiplayer-modes__mode-label">Offline Co-op</dt>
          <dd class="multiplayer-modes__mode-value">
            <TheBooleanIndicator :value="mode.offlinecoop" />
            <span
              v-if="mode.offlinecoopmax"
              class="multiplayer-modes__player-count"
            >
              Up to {{ mode.offlinecoopmax }} players
            </span>
          </dd>
          <dt class="multiplayer-modes__mode-label">LAN Co-op</dt>
          <dd class="multiplayer-modes__mode-value">
            <TheBooleanIndicator :value="mode.lancoop" />
          </dd>
          <dt class="multiplayer-modes__mode-label">Split-screen</dt>
          <dd class="multiplayer-modes__mode-value">
            <TheBooleanIndicator :value="mode.splitscreen" />
          </dd>
        </dl>
      </div>
    </template>
    <p
      v-else
      class="multiplayer-modes__empty"
    >
      No multiplayer information available
    </p>
  </div>
</template>

<style scoped lang="scss">
@use "sass:color";

.multiplayer-modes {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 1.5rem;
  overflow-x: auto;
  scrollbar-gutter: stable;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: 1.5rem;

  &__platform {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: fit-content;
    padding: 0.75rem;
    border: 1px solid var(--tw-color-border);
    border-radius: var(--tw-radius-md);
    scroll-snap-align: center;
    scroll-snap-stop: always;
  }

  &__platform-title {
    font-size: 0.875rem;
    font-weight: 500;
    color: color-mix(in hsl, var(--tw-color-text-muted) 75%, black);
  }

  &__mode {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 1.5rem;
    font-size: 0.875rem;
    border-radius: 0.5rem;
    background-color: var(--tw-color-background-secondary);
  }

  &__mode-label {
    grid-column: 1;
    color: var(--tw-color-text-muted);
    font-weight: 500;
  }

  &__mode-value {
    grid-column: 2;
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  &__player-count {
    font-size: 0.875rem;
    color: var(--tw-color-text-muted);
  }

  &__empty {
    font-size: 0.875rem;
    color: var(--tw-color-text-muted);
  }
}
</style>
