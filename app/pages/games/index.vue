<script setup lang="ts">
// Composables
const {
  selectedPlatforms,
  availablePlatforms,
  getPlatformIcon,
  selectedFilters,
  search,
  queryParams,
  clearQueryAndRefreshPage,
  activeFilterChips,
  removeFilter,
} = useGameFilters();

// Data Fetching
const { status, data: games } = useFetch("/api/games", {
  query: queryParams,
});

const pending = computed(() => status.value === "pending");
</script>

<template>
  <main class="tw:container tw:space-y-4">
    <header class="tw:flex tw:justify-between tw:items-center tw:gap-4">
      <h1 class="title">Find the best co-op and multiplayer games</h1>
      <TheButton
        variant="secondary"
        size="sm"
        aria-label="Refresh"
        @click="clearQueryAndRefreshPage"
      >
        <Icon
          name="lucide:refresh-cw"
          class="tw:size-4"
        />
      </TheButton>
    </header>

    <section class="tw:flex tw:max-sm:flex-col tw:gap-4 tw:max-w-2xl">
      <TheSelect
        v-model="selectedPlatforms.p1"
        :options="availablePlatforms.p1.value"
        :icon="getPlatformIcon(selectedPlatforms.p1)"
        label="Platform 1"
        placeholder="Select platform"
        required
      />

      <TheSelect
        v-model="selectedPlatforms.p2"
        :options="availablePlatforms.p2.value"
        :icon="getPlatformIcon(selectedPlatforms.p2)"
        label="Platform 2"
        placeholder="Select platform"
      />

      <TheSelect
        v-model="selectedPlatforms.p3"
        :options="availablePlatforms.p3.value"
        :icon="getPlatformIcon(selectedPlatforms.p3)"
        label="Platform 3"
        placeholder="Select platform"
      />
    </section>

    <section class="tw:space-y-2 tw:max-sm:mt-4">
      <div class="tw:flex tw:gap-4">
        <TheSearchInput
          v-model="search"
          class="tw:max-md:w-full"
          placeholder="Search by name"
        />
        <GameCategorySelector
          v-model:game-modes="selectedFilters.gameModes"
          v-model:player-perspectives="selectedFilters.playerPerspectives"
          v-model:genres="selectedFilters.genres"
          v-model:themes="selectedFilters.themes"
        />
      </div>
      <div
        v-if="activeFilterChips.length"
        class="tw:w-full tw:flex tw:flex-wrap tw:gap-2"
      >
        <TheChip
          v-for="chip in activeFilterChips"
          :key="`${chip.type}-${chip.id}`"
          :label="chip.name"
          :removable="true"
          @remove="removeFilter(chip)"
        />
      </div>
    </section>

    <section
      v-if="pending"
      class="tw:flex tw:justify-center tw:items-center tw:min-h-[200px]"
    >
      <LoadingSpinner />
    </section>

    <section
      v-else-if="status === 'error'"
      class="tw:text-red"
    >
      An error occurred while fetching games. Please try again later. If the
      issue persists, please contact me via
      <a href="mailto:contact@godo-play.com">contact@godo-play.com</a>.
    </section>

    <section
      v-else-if="status === 'success' && !games?.length"
      class="tw:text-gray-600"
    >
      No games found for this combination
    </section>

    <section
      v-else-if="games"
      role="list"
      class="tw:grid tw:grid-cols-2 tw:gap-4 tw:sm:grid-cols-3 tw:lg:grid-cols-4 tw:xl:grid-cols-5"
    >
      <GameCard
        v-for="game in games"
        :key="game.id"
        :game="game"
      />
    </section>
  </main>
</template>

<style scoped lang="scss">
@use "sass:map";
@use "@/assets/styles/abstracts/variables" as *;

.title {
  font-size: 1.5rem;
  font-weight: 700;

  @media (min-width: map.get($breakpoints, "sm")) {
    font-size: 2.5rem;
  }
}
</style>
