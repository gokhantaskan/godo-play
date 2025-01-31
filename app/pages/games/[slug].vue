<script setup lang="ts">
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "radix-vue";

import { ageRatingHumanizedRatings } from "~~/shared/constants";
import type { GameSubmissionWithRelations } from "~~/shared/types";
import type { GameDetails } from "~~/shared/types/igdb/gameDetails";

definePageMeta({
  name: "CrossPlayGameDetailsPage",
});

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

const { data: dbGame, refresh: refreshDbGame } =
  await useCachedFetch<GameSubmissionWithRelations>(
    `/api/game-details/${slug}`
  );

const gameName = computed(() => {
  return dbGame.value?.name ?? igdbGame.value?.name;
});

// Computed properties for better reactivity
const hasAgeRatings = computed(() => {
  const ratings = igdbGame.value?.age_ratings;
  return Array.isArray(ratings) && ratings.length > 0;
});

const hasPlatformGroups = computed(() => {
  const groups = dbGame.value?.platformGroups;
  return Array.isArray(groups) && groups.length > 0;
});

const roundedGameRating = computed(() => {
  const dbGameRating = dbGame.value?.external?.igdbAggregatedRating;
  const igdbGameRating = igdbGame.value?.aggregated_rating;
  const rating = dbGameRating || igdbGameRating;

  if (!rating) {
    return null;
  }

  return Number(parseFloat(`${rating}`) / 10).toFixed(1);
});

// Add this computed property
const groupedCompanies = computed(() => {
  if (!igdbGame.value?.involved_companies) {
    return { developers: [], publishers: [] };
  }

  return {
    developers: igdbGame.value.involved_companies
      .filter(company => company.developer)
      .map(company => company.company.name),
    publishers: igdbGame.value.involved_companies
      .filter(company => company.publisher)
      .map(company => company.company.name),
  };
});

const seoMeta = computed(() => {
  return {
    seoTitle: `${gameName.value} Crossplay Information`,
    seoDescription: `Learn about ${gameName.value} and its crossplay support.`,
    seoImage: `https://images.igdb.com/igdb/image/upload/t_screenshot_med/${dbGame.value?.external?.igdbImageId}.jpg`,
  };
});

useSeoMeta({
  title: seoMeta.value.seoTitle,
  ogTitle: `${seoMeta.value.seoTitle} - GodoPlay`,
  twitterTitle: `${seoMeta.value.seoTitle} - GodoPlay`,
  description: seoMeta.value.seoDescription,
  ogDescription: seoMeta.value.seoDescription,
  twitterDescription: seoMeta.value.seoDescription,
  ogImage: seoMeta.value.seoImage,
  twitterImage: seoMeta.value.seoImage,
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

  return `/age-ratings/${category}/${rating}.${extension}`;
}

async function refreshGameData() {
  await refreshIgdbGame();
  await refreshDbGame();
}

function formatDate(date: number) {
  return new Intl.DateTimeFormat(
    import.meta.client ? window.navigator.language : "en-US",
    {
      year: "numeric",
      month: "short",
    }
  ).format(new Date(date * 1000));
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
            <!--  -->
            <div class="tw:text-white/80 tw:flex tw:items-center tw:gap-1">
              <span v-if="igdbGame?.first_release_date">
                {{ formatDate(igdbGame?.first_release_date) }}
              </span>
              <span>•</span>
              <span
                v-if="roundedGameRating"
                class="game__rating"
              >
                <Icon
                  name="lucide:star"
                  class="game__rating-icon"
                />
                {{ roundedGameRating }}/10
              </span>
            </div>
            <!-- Game Modes -->
            <div
              v-if="dbGame?.gameSubmissionGameModes?.length"
              class="tw:flex tw:flex-wrap tw:gap-2 tw:mt-1"
            >
              <template
                v-for="{ gameMode } in dbGame.gameSubmissionGameModes"
                :key="gameMode.id"
              >
                <TheChip variant="gray">{{ gameMode.name }}</TheChip>
              </template>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="dbGame?.external?.igdbImageId"
        class="game__hero-backdrop"
      >
        <img
          :src="`https://images.igdb.com/igdb/image/upload/t_screenshot_med/${dbGame.external.igdbImageId}.jpg`"
          :alt="gameName || ''"
          class="game__hero-backdrop-image"
          loading="lazy"
        />
      </div>
    </header>

    <!-- Age Ratings -->
    <div
      v-if="hasAgeRatings && igdbGame?.age_ratings"
      class="tw:bg-fg/10 tw:py-4"
    >
      <ConsolidatedAgeRatings :age-ratings="igdbGame.age_ratings">
        <template #default="{ consolidatedRatings }">
          <div class="tw:container">
            <h2 class="tw:sr-only">Age Ratings</h2>
            <dl
              v-for="(rating, index) in consolidatedRatings"
              :key="rating.category"
              class="tw:grid tw:grid-cols-[max-content_1fr] tw:gap-2 tw:last-of-type:mt-2"
            >
              <template v-if="index === consolidatedRatings.length - 1">
                <dt>
                  <img
                    v-if="rating.name"
                    :src="getAgeRatingImageUrl(rating.category, rating.name)"
                    :alt="`${rating.category} ${rating.name}`"
                    class="tw:h-12"
                    loading="lazy"
                  />
                </dt>
                <dd class="game__section-descriptions">
                  <div
                    v-if="rating.contentDescriptions?.length"
                    class="game__section-content tw:text-sm"
                  >
                    {{
                      rating.contentDescriptions
                        ?.map((desc: any) => desc.description)
                        .join(", ")
                    }}
                  </div>
                  <div>
                    <span class="tw:text-xs tw:leading-0 tw:text-text-muted"
                      >{{ rating.category }}
                      {{
                        ageRatingHumanizedRatings[
                          rating.name as keyof typeof ageRatingHumanizedRatings
                        ]
                      }}</span
                    >
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

        <div class="game__tabs-content-wrapper tw:container">
          <TabsContent
            value="details"
            class="game__tabs-content tw:space-y-4"
          >
            <section>
              <h2 class="tw:sr-only">About the Game</h2>
              <ReadMore>{{ igdbGame?.summary }}</ReadMore>
              <div
                role="list"
                class="tw:w-full tw:mt-2"
              >
                <template v-if="groupedCompanies.developers.length">
                  <div role="listitem">
                    <strong class="tw:text-start tw:mr-2 tw:font-semibold"
                      >Developers:</strong
                    >
                    <span>{{ groupedCompanies.developers.join(", ") }}</span>
                  </div>
                </template>
                <template v-if="groupedCompanies.publishers.length">
                  <div role="listitem">
                    <strong class="tw:text-start tw:mr-2 tw:font-semibold"
                      >Publishers:</strong
                    >
                    <span>{{ groupedCompanies.publishers.join(", ") }}</span>
                  </div>
                </template>
              </div>
            </section>

            <!-- Platform Groups -->
            <section v-if="hasPlatformGroups && dbGame?.platformGroups">
              <GameDetailsCrossplayInfo
                :game-name="gameName"
                :platform-groups="dbGame.platformGroups"
                :store-platforms="dbGame.storePlatforms"
                :crossplay-information="dbGame.crossplayInformation"
              />
            </section>
          </TabsContent>
          <TabsContent
            value="gallery"
            class="game__tabs-content tw:space-y-4"
          >
            <div class="game__section">
              <h2 class="game__section-title">Videos</h2>
              <div
                v-if="igdbGame?.videos"
                class="tw:flex tw:overflow-hidden tw:overflow-x-auto tw:gap-4 tw:pb-2"
              >
                <iframe
                  v-for="video in igdbGame.videos"
                  :key="video.id"
                  :src="`https://www.youtube.com/embed/${video.video_id}`"
                  frameborder="0"
                  allowfullscreen
                ></iframe>
              </div>
              <p v-else>No videos found.</p>
            </div>
            <div class="game__section">
              <h2 class="game__section-title">Screenshots</h2>
              <div
                v-if="igdbGame?.screenshots"
                class="game__gallery-screenshots tw:grid tw:lg:grid-cols-2 tw:gap-4"
              >
                <img
                  v-for="screenshot in igdbGame.screenshots"
                  :key="screenshot.id"
                  :src="`https://images.igdb.com/igdb/image/upload/t_screenshot_med/${screenshot.image_id}.jpg`"
                  alt=""
                  class="tw:rounded-lg"
                />
              </div>
              <p v-else>No screenshots found.</p>
            </div>
          </TabsContent>
        </div>
      </TabsList>
    </TabsRoot>

    <div v-if="IS_DEV">
      <TheButton @click="refreshGameData"> Refresh </TheButton>
    </div>
  </div>
</template>
