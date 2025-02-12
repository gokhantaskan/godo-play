<script setup lang="ts">
import type { GameOption } from "~/components/SubmitGame/SubmitGameAutocomplete.vue";
import { CATEGORIES } from "~~/shared/constants/categories";
import type {
  CrossplayInformation,
  PlatformId,
} from "~~/shared/types/crossplay";
import type { StoreHardcoded } from "~~/shared/types/globals";
import type { BaseEntity } from "~~/shared/types/igdb/globals";

// Define types that were previously in submit-game.ts
type PlatformGroups = PlatformId[][];
type Store = StoreHardcoded;
type StoreData = Partial<
  Record<
    StoreHardcoded["slug"],
    {
      crossplayPlatforms: PlatformId[];
    }
  >
>;

interface SubmitGamePayload {
  game: {
    category: number;
    name: string;
    slug: string;
    firstReleaseDate?: string;
    external: {
      igdbId: number;
      igdbImageId?: string;
      igdbAggregatedRating?: number;
    };
  };
  crossplayInformation: CrossplayInformation;
  platformGroups: PlatformGroups;
  storesPlatforms: StoreData;
  gameModeIds: number[];
  token: string;
}

const { getToken } = useRecaptcha();

// Form state
const selectedGame = ref<GameOption | null>(null);
const selectedCategory = ref<number>(0);
const selectedCrossplayInformation = ref<CrossplayInformation>({
  evidenceUrl: "",
  information: "",
  isOfficial: false,
});
const selectedPlatformGroups = ref<PlatformGroups>([[]]);
const selectedStores = ref<Store["slug"][]>([]);
const selectedStoresPlatforms = ref<StoreData>({});
const selectedGameModes = ref<number[]>([]);
const selectedFreeToPlay = ref(false);
const isSubmitting = ref(false);
const formError = ref<string | null>(null);

// Computed
const isValidForm = computed(() => {
  const hasValidGame = selectedGame.value !== null;
  const hasValidGroups = selectedPlatformGroups.value.some(
    (group: PlatformId[]) => group.length > 0
  );
  const hasValidGameModes = selectedGameModes.value.length > 0;

  return (
    hasValidGame && hasValidGroups && hasValidGameModes && !isSubmitting.value
  );
});

// Methods
function resetForm() {
  selectedGame.value = null;
  selectedPlatformGroups.value = [[]];
  selectedStores.value = [];
  selectedStoresPlatforms.value = {};
  selectedGameModes.value = [];
  selectedFreeToPlay.value = false;
  formError.value = null;
}

async function handleSubmit(event: Event) {
  event.preventDefault();

  if (!selectedGame.value || !isValidForm.value) {
    return;
  }

  try {
    isSubmitting.value = true;
    formError.value = null;

    const token = await getToken("submit");

    if (!token) {
      formError.value = "Failed to get reCAPTCHA token";
      return;
    }

    const payload: SubmitGamePayload = {
      game: {
        category: selectedCategory.value,
        name: selectedGame.value.name,
        slug: selectedGame.value.slug,
        firstReleaseDate: selectedGame.value.firstReleaseDate
          ? new Date(selectedGame.value.firstReleaseDate * 1000).toISOString()
          : undefined,
        external: {
          igdbId: selectedGame.value.id,
          igdbImageId: selectedGame.value.imageId,
          igdbAggregatedRating: selectedGame.value.aggregatedRating,
        },
      },
      crossplayInformation: selectedCrossplayInformation.value,
      platformGroups: selectedPlatformGroups.value,
      storesPlatforms: selectedStoresPlatforms.value,
      gameModeIds: selectedGameModes.value,
      token,
    };

    await $fetch<SubmitGamePayload>("/api/games", {
      method: "POST",
      body: payload,
    });

    // Reset form
    resetForm();
  } catch (error) {
    console.error("Failed to submit game:", error);
    formError.value = "Failed to submit game. Please try again.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <form
    class="submit-game__form"
    @submit.prevent="handleSubmit"
  >
    <SubmitGameAutocomplete
      v-model="selectedGame"
      class="submit-game__autocomplete"
    />

    <div
      v-if="selectedGame"
      class="submit-game__game-info"
    >
      <div class="game-info">
        <div class="game-info__cover">
          <img
            :src="`https://images.igdb.com/igdb/image/upload/t_cover_big/${selectedGame.imageId}.jpg`"
            :alt="selectedGame.name"
            lazy
          />
        </div>
        <div class="game-info__details">
          <h2 class="game-info__title">{{ selectedGame.name }}</h2>
          <ul class="game-info__list">
            <li class="game-info__list-item">
              {{ CATEGORIES[selectedGame.category]?.name ?? "Unknown" }}
            </li>
            <li class="game-info__list-item">
              {{
                selectedGame.platforms
                  .map(platform => platform.name)
                  .toSorted()
                  .join(", ")
              }}
            </li>
            <li class="game-info__list-item">
              {{
                selectedGame.gameModes
                  .map((mode: BaseEntity) => mode.name)
                  .join(", ")
              }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <SubmitGameFormInner
      v-model:free-to-play="selectedFreeToPlay"
      v-model:category="selectedCategory"
      v-model:platform-groups="selectedPlatformGroups"
      v-model:stores="selectedStores"
      v-model:store-platforms="selectedStoresPlatforms"
      v-model:game-modes="selectedGameModes"
      v-model:crossplay-information="selectedCrossplayInformation"
    />

    <div
      v-if="formError"
      class="submit-game__error"
    >
      {{ formError }}
    </div>

    <div class="submit-game__actions">
      <TheButton
        type="submit"
        :loading="isSubmitting"
        :disabled="!isValidForm || isSubmitting"
      >
        {{ isSubmitting ? "Submitting..." : "Submit" }}
      </TheButton>
    </div>
  </form>
</template>

<style lang="scss">
@use "~/assets/styles/abstracts/_variables.scss" as *;

.submit-game {
  max-inline-size: 32rem;
  margin-inline: auto;
  padding: 1rem;

  &__title {
    margin-block-end: 0.5rem;
  }

  &__description {
    margin-block-end: 1rem;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__error {
    font-size: 0.875rem;
    color: var(--tw-error);
  }
}

.game-info {
  display: grid;
  grid-template-columns: clamp(4rem, 8vw, 12rem) minmax(0, 1fr);
  gap: 0.5rem;

  &__cover {
    border-radius: 0.5rem;
    overflow: hidden;
    height: fit-content;
    box-shadow: var(--tw-shadow-sm);
    background-color: var(--tw-border);
  }

  &__details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__title {
    font-size: 1.125rem;
    font-weight: 500;
  }

  &__list {
    padding-inline-start: 1rem;
    margin: 0;
  }

  &__list-item {
    font-size: 0.875rem;
  }
}
</style>
