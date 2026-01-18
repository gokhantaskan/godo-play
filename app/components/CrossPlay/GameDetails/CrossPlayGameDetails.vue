<script setup lang="ts">
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "reka-ui";
import type { LocationQuery } from "vue-router";

import { CrossPlayGameDetailsGameRecommendations } from "#components";
import { ageRatingHumanizedRatings } from "~~/shared/constants";
import type { GameSubmissionWithRelations } from "~~/shared/types";
import type {
  GameDetails,
  InvolvedCompany,
} from "~~/shared/types/igdb/gameDetails";

interface Props {
  igdbGame: GameDetails | null;
  dbGame: GameSubmissionWithRelations | null;
  gameName: string;
}

const props = defineProps<Props>();
const route = useRoute();

const currentTab = ref<"details" | "gallery">("details");
const routeFrom = ref<LocationQuery>({});

onBeforeMount(() => {
  if (import.meta.client && route.name === "CrossPlayGamesPage") {
    routeFrom.value = route.query;
  }
});

// Computed properties for better reactivity
const hasAgeRatings = computed(() => {
  const ratings = props.igdbGame?.age_ratings;
  return Array.isArray(ratings) && ratings.length > 0;
});

const hasPlatformGroups = computed(() => {
  const groups = props.dbGame?.platformGroups;
  return Array.isArray(groups) && groups.length > 0;
});

const roundedGameRating = computed(() => {
  const dbGameRating = props.dbGame?.external?.igdbAggregatedRating;
  const igdbGameRating = props.igdbGame?.aggregated_rating;
  const rating = dbGameRating || igdbGameRating;

  if (!rating) {
    return null;
  }

  return Number(parseFloat(`${rating}`) / 10).toFixed(1);
});

const groupedCompanies = computed(() => {
  if (!props.igdbGame?.involved_companies) {
    return { developers: [], publishers: [] };
  }

  return {
    developers: props.igdbGame.involved_companies
      .filter((company: InvolvedCompany) => company.developer)
      .map((company: InvolvedCompany) => company.company.name),
    publishers: props.igdbGame.involved_companies
      .filter((company: InvolvedCompany) => company.publisher)
      .map((company: InvolvedCompany) => company.company.name),
  };
});

function generateLink(gameMode: string) {
  return `/games?${new URLSearchParams({
    ...routeFrom.value,
    gameModes: gameMode,
  })}`;
}

// Pure function for getting age rating image URL
function getAgeRatingImageUrl(
  category: string,
  rating: string | undefined
): string {
  if (!rating) {
    return "";
  }

  // Determine extension based on category
  const extensionMap: Record<string, string> = {
    ESRB: "svg",
    PEGI: "png",
  };

  const extension = extensionMap[category] || "png";

  // Map the rating name to the actual filename (remove any spaces)
  const ratingFileName = rating.replace(/\s+/g, "");

  return `/age-ratings/${category}/${ratingFileName}.${extension}`;
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
            v-if="dbGame?.external?.igdbImageId"
            :src="`https://images.igdb.com/igdb/image/upload/t_720p/${dbGame.external.igdbImageId}.jpg`"
            :alt="dbGame.name || ''"
            class="game__hero-media"
            loading="eager"
          />
          <div class="game__hero-content">
            <h1 class="game__hero-heading">{{ gameName }}</h1>
            <div class="tw:text-white/80 tw:flex tw:items-center tw:gap-1">
              <span v-if="igdbGame?.first_release_date">
                {{ formatDate(igdbGame?.first_release_date) }}
              </span>
              <span
                v-if="roundedGameRating"
                class="game__rating"
              >
                <span>•</span>
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
                <a
                  :href="generateLink(gameMode.slug)"
                  target="_blank"
                >
                  <TheChip variant="gray">{{ gameMode.name }}</TheChip>
                </a>
              </template>
            </div>

            <!-- Tags -->
            <div
              v-if="dbGame?.tags?.length"
              class="tw:flex tw:flex-wrap tw:gap-2 tw:mt-1"
            >
              <TheChip
                v-for="tagItem in dbGame.tags"
                :key="tagItem.tagId"
                variant="primary"
                size="sm"
              >
                {{ tagItem.tag.name }}
              </TheChip>
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
              v-for="rating in consolidatedRatings"
              :key="rating.category"
              class="tw:grid tw:grid-cols-[max-content_1fr] tw:gap-2 tw:last-of-type:mt-2"
            >
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
                <span class="tw:text-sm"
                  >{{ rating.category }}
                  {{
                    ageRatingHumanizedRatings[
                      rating.name as keyof typeof ageRatingHumanizedRatings
                    ]
                  }}</span
                >
              </dd>
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
            <!-- Official Doc Badge -->
            <section v-if="dbGame?.crossplayInformation?.isOfficial">
              <TheAlert
                variant="success"
                size="sm"
              >
                <template #icon>
                  <Icon name="local:badge-check" />
                </template>
                <template #default>
                  <p>
                    This game's crossplay compatibility is verified through
                    official resources.
                  </p>
                </template>
              </TheAlert>
            </section>
            <section>
              <h2 class="tw:sr-only">About the Game</h2>
              <ReadMore :key="currentTab">{{ igdbGame?.summary }}</ReadMore>
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
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  referrerpolicy="strict-origin-when-cross-origin"
                  style="border: 0"
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

    <!-- Game Recommendations -->
    <CrossPlayGameDetailsGameRecommendations :slug="dbGame?.slug || ''" />
  </div>
</template>
