<script setup lang="ts">
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "radix-vue";

import { AgeRatingCategories } from "~~/shared/constants";
import type { GameSubmissionWithRelations } from "~~/shared/types";
import type { GameDetails } from "~~/shared/types/igdb/gameDetails";

const { slug } = useRoute().params;
const currentTab = ref<"details" | "gallery">("details");

// Composable for game data fetching
const { data: igdbGame, refresh: refreshIgdbGame } =
  await useFetch<GameDetails>(`/api/games/igdb/${slug}`, {
    key: `igdb-game-${slug}`,
  });

// Throw 404 if game is not found
if (!igdbGame.value) {
  throw createError({
    statusCode: 404,
    message: "Game not found",
  });
}

const { data: game, refresh: refreshGame } =
  await useFetch<GameSubmissionWithRelations>(`/api/game-details/${slug}`, {
    key: `game-details-${slug}`,
  });

// Computed properties for better reactivity
const hasAgeRatings = computed(() => {
  const ratings = igdbGame.value?.age_ratings;
  return Array.isArray(ratings) && ratings.length > 0;
});

const hasPlatformGroups = computed(() => {
  const groups = game.value?.platformGroups;
  return Array.isArray(groups) && groups.length > 0;
});

const gameRating = computed(() => {
  if (!igdbGame.value?.aggregated_rating) {
    return null;
  }
  return Number(parseFloat(`${igdbGame.value.aggregated_rating}`) / 10).toFixed(
    1
  );
});

// Pure function for getting age rating image URL
function getAgeRatingImageUrl(
  category: string,
  rating: string | undefined
): string {
  if (!rating) {
    return "";
  }

  const extension = category === "ESRB" ? "svg" : "png";

  // For ESRB, we need to handle special cases like "Rating Pending" -> "RP"
  if (category === "ESRB") {
    // Convert "Rating Pending" to "RP", "Everyone 10+" to "E10", etc.
    const esrbMap: Record<string, string> = {
      "Rating Pending": "RP",
      "Early Childhood": "EC",
      Everyone: "E",
      "Everyone 10+": "E10",
      Teen: "T",
      Mature: "M",
      "Adults Only": "AO",
    };
    return `/age-ratings/ESRB/${esrbMap[rating] || rating}.${extension}`;
  }

  return `/age-ratings/${category}/${rating}.${extension}`;
}

async function refreshGameData() {
  await refreshIgdbGame();
  await refreshGame();
}
</script>

<template>
  <div class="game">
    <header class="game__hero">
      <div class="tw:container">
        <div class="game__hero-wrapper">
          <img
            v-if="igdbGame?.cover?.image_id"
            :src="`https://images.igdb.com/igdb/image/upload/t_720p/${igdbGame.cover.image_id}.jpg`"
            :alt="igdbGame.name || ''"
            :width="igdbGame.cover.width"
            :height="igdbGame.cover.height"
            class="game__hero-media"
            loading="eager"
          />
          <div class="game__hero-content">
            <h1 class="game__hero-heading">{{ igdbGame?.name }}</h1>
            <!-- Game Modes -->
            <div
              v-if="game?.gameSubmissionGameModes?.length"
              class="game__modes"
            >
              <template
                v-for="{ gameMode } in game.gameSubmissionGameModes"
                :key="gameMode.id"
              >
                <TheChip variant="gray">{{ gameMode.name }}</TheChip>
              </template>
            </div>
            <div
              v-if="gameRating"
              class="game__hero-rating"
            >
              <Icon
                name="lucide:star"
                class="game__hero-rating-icon"
              />
              {{ gameRating }}/10
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="igdbGame?.cover?.image_id"
        class="game__hero-backdrop"
      >
        <img
          :src="`https://images.igdb.com/igdb/image/upload/t_screenshot_med/${igdbGame.cover.image_id}.jpg`"
          :alt="igdbGame.name || ''"
          class="game__hero-backdrop-image"
          loading="lazy"
        />
      </div>
    </header>

    <!-- Age Ratings -->
    <div
      v-if="hasAgeRatings && igdbGame?.age_ratings"
      class="game__ratings"
    >
      <ConsolidatedAgeRatings
        :age-ratings="igdbGame.age_ratings"
        :visible-categories="[AgeRatingCategories.PEGI]"
      >
        <template #default="{ consolidatedRatings }">
          <div class="tw:container">
            <h2 class="game__ratings-title">Age Ratings</h2>
            <dl class="game__ratings-list">
              <template
                v-for="rating in consolidatedRatings"
                :key="rating.category"
              >
                <dt>
                  <img
                    v-if="rating.name"
                    :src="getAgeRatingImageUrl(rating.category, rating.name)"
                    :alt="`${rating.category} ${rating.name}`"
                    class="game__ratings-image"
                    loading="lazy"
                  />
                </dt>
                <dd class="game__ratings-descriptions">
                  <div
                    v-if="rating.contentDescriptions?.length"
                    class="game__ratings-content"
                    role="list"
                  >
                    {{ rating.contentDescriptions.join(", ") }}
                  </div>
                </dd>
              </template>
            </dl>
          </div>
        </template>
      </ConsolidatedAgeRatings>
    </div>

    <!-- Tabs -->
    <TabsRoot
      v-model="currentTab"
      class="game__tabs"
    >
      <TabsList as-child>
        <div class="game__tabs-list">
          <div class="tw:container">
            <TabsTrigger
              value="details"
              class="game__tabs-trigger"
              :class="{
                'game__tabs-trigger--active': currentTab === 'details',
              }"
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="gallery"
              class="game__tabs-trigger"
              :class="{
                'game__tabs-trigger--active': currentTab === 'gallery',
              }"
            >
              Gallery
            </TabsTrigger>
          </div>
        </div>

        <div class="tw:container">
          <TabsContent
            value="details"
            class="game__tabs-content tw:space-y-4"
          >
            <section class="game__about">
              <h2 class="game__about-title">About the Game</h2>
              <p class="game__content-summary">{{ igdbGame?.summary }}</p>
              <GameDetailsWebsites
                :websites="igdbGame?.websites"
                :show-label="false"
              />
            </section>

            <!-- Platform Groups -->
            <section
              v-if="hasPlatformGroups && game?.platformGroups"
              class="game__platforms"
            >
              <ConsolidatedPlatformGroups
                :platform-groups="game.platformGroups"
              >
                <template #default="{ platformGroups }">
                  <div class="game__platforms-wrapper">
                    <h2 class="game__platforms-title">Cross-play Groups</h2>
                    <p class="game__platforms-description">
                      Each platform in the same group can cross-play with each
                      other.
                    </p>
                    <dl class="game__platforms-list">
                      <template
                        v-for="(group, index) in platformGroups"
                        :key="index"
                      >
                        <dt class="game__platforms-group">
                          <strong>{{ `#${index + 1}` }}</strong>
                        </dt>
                        <dd class="game__platforms-items">
                          <span
                            v-for="platform in group"
                            :key="platform.name"
                            class="game__platforms-item"
                          >
                            <Icon
                              class="game__platforms-icon"
                              size="1.125rem"
                              :name="platform.icon"
                            />
                            {{ platform.name }}
                          </span>
                        </dd>
                      </template>
                    </dl>
                  </div>
                </template>
              </ConsolidatedPlatformGroups>
            </section>
          </TabsContent>
        </div>
      </TabsList>
    </TabsRoot>

    <div v-if="IS_DEV">
      <TheButton @click="refreshGameData"> Refresh </TheButton>
    </div>
  </div>
</template>
