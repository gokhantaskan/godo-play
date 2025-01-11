<script setup lang="ts">
import { SUPPORTED_PLATFORMS } from "~~/shared/constants/platforms";
import type { MultiplayerMode } from "~~/shared/types/igdb/gameDetails";

interface Props {
  multiplayerMode: MultiplayerMode;
}

const props = defineProps<Props>();

const platform = computed(() => {
  return SUPPORTED_PLATFORMS.find(
    platform => platform.id === props.multiplayerMode.platform
  );
});
</script>

<template>
  <div>
    <h4
      v-if="platform"
      class="tw:font-medium"
    >
      {{ platform.name }}
    </h4>
    <div>
      <dl>
        <dt>Drop-in</dt>
        <dd>
          <TheBooleanIndicator :value="multiplayerMode.dropin" />
        </dd>
        <dt>Campaign Co-op</dt>
        <dd>
          <TheBooleanIndicator :value="multiplayerMode.campaigncoop" />
        </dd>
        <dt>Online Co-op</dt>
        <dd>
          <TheBooleanIndicator :value="multiplayerMode.onlinecoop" />
          <span v-if="multiplayerMode.onlinecoopmax"
            >Up to {{ multiplayerMode.onlinecoopmax }}</span
          >
        </dd>
        <dt>Offline Co-op</dt>
        <dd>
          <TheBooleanIndicator :value="multiplayerMode.offlinecoop" />
          <span v-if="multiplayerMode.offlinecoopmax"
            >Up to {{ multiplayerMode.offlinecoopmax }}</span
          >
        </dd>
        <dt>LAN Co-op</dt>
        <dd>
          <TheBooleanIndicator :value="multiplayerMode.lancoop" />
        </dd>
        <dt>Split-screen</dt>
        <dd>
          <TheBooleanIndicator :value="multiplayerMode.splitscreen" />
        </dd>
      </dl>
    </div>
  </div>
</template>

<style scoped lang="scss">
dl {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 1.5em;
  font-size: 0.75rem;
}

dt {
  grid-column: 1;
  font-weight: 500;
  color: var(--tw-color-text-muted);
}

dd {
  grid-column: 2;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}
</style>
