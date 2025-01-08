<script setup lang="ts">
import { Icon } from "#components";
import { PLATFORMS } from "~~/shared/constants/platforms";
import type { MultiplayerMode } from "~~/shared/types/igdb/gameDetails";

interface Props {
  multiplayerMode: MultiplayerMode;
}

const props = defineProps<Props>();

const YesIcon = h(Icon, { name: "i-lucide-check", class: "tw:text-green" });
const NoIcon = h(Icon, { name: "i-lucide-x", class: "tw:text-red" });

const platform = computed(() => {
  return PLATFORMS.find(
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
        <dt>Campaign Co-op</dt>
        <dd>
          <template v-if="multiplayerMode.campaigncoop">
            <YesIcon />
          </template>
          <template v-else>
            <NoIcon />
          </template>
        </dd>
        <dt>Online Co-op</dt>
        <dd>
          <template v-if="multiplayerMode.onlinecoop">
            <YesIcon />
          </template>
          <template v-else>
            <NoIcon />
          </template>
        </dd>
        <dt>Offline Co-op</dt>
        <dd>
          <template v-if="multiplayerMode.offlinecoop">
            <YesIcon />
          </template>
          <template v-else>
            <NoIcon />
          </template>
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
}
</style>
