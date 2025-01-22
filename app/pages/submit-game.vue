<script setup lang="ts">
import type { SubmitGamePayload } from "~/types/submit-game";
import { SUPPORTED_PC_STORES } from "~~/shared/constants";

const {
  selectedGame,
  selectedPlatformGroups,
  selectedPcStores,
  selectedPcStoresPlatforms,
  isSubmitting,
  error: formError,
  platformsWithPC,
  allSelected,
  isValidForm,
  getExcludedPlatforms,
  addPlatformGroup,
  removePlatformGroup,
  updatePcStorePlatforms,
  resetForm,
} = useSubmitGameForm();

const { getToken } = useRecaptcha();

async function handleSubmit() {
  if (!isValidForm.value) {
    return;
  }

  isSubmitting.value = true;
  formError.value = null;

  try {
    const token = await getToken("submit");
    if (!token) {
      formError.value = "Failed to get reCAPTCHA token. Please try again.";
      return;
    }

    const payload: SubmitGamePayload = {
      game: selectedGame.value!,
      platformGroups: selectedPlatformGroups.value,
      pcStoresPlatforms: selectedPcStoresPlatforms.value,
    };

    const { success } = await $fetch("/api/submissions", {
      method: "POST",
      body: {
        ...payload,
        token,
      },
    });

    if (success) {
      resetForm();
    }
  } catch (error: any) {
    formError.value =
      error?.data?.message || "Failed to submit the form. Please try again.";
    console.error("Submit game error:", error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="tw:max-w-2xl tw:mx-auto tw:p-4 tw:space-y-2">
    <h1>Submit a Crossplay Support</h1>
    <p>
      Help us identify games and their supported crossplay platforms. Specify
      which platforms can play together in groups.
    </p>

    <form
      class="tw:space-y-4"
      @submit.prevent="handleSubmit"
    >
      <SubmitGameAutocomplete
        v-model="selectedGame"
        class="tw:w-full"
      />

      <div v-if="selectedGame">
        <div
          class="tw:grid tw:grid-cols-[clamp(4rem,8vw,12rem)_minmax(0,1fr)] tw:gap-2"
        >
          <div
            class="tw:rounded-lg tw:overflow-hidden tw:h-fit tw:shadow-sm tw:bg-border"
          >
            <NuxtImg
              :src="`https://images.igdb.com/igdb/image/upload/t_cover_big/${selectedGame.imageId}.jpg`"
              :alt="selectedGame.name"
              lazy
            />
          </div>
          <div class="tw:space-y-2">
            <h2 class="tw:text-lg tw:font-medium">{{ selectedGame.name }}</h2>
            <ul class="tw:ps-4 tw:m-0">
              <li class="tw:text-sm">
                {{
                  selectedGame.platforms
                    .map(platform => platform.name)
                    .toSorted()
                    .join(", ")
                }}
              </li>
              <li class="tw:text-sm">
                {{ selectedGame.gameModes.map(mode => mode.name).join(", ") }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <fieldset>
        <legend>Platforms</legend>
        <p class="tw:text-sm tw:text-text-muted tw:mb-4">
          Choose compatible platforms for the game. Groups specify which
          platforms can play together.
          <strong class="tw:inline-block"
            >If the game doesn't support cross-play, list each platform in its
            own group.</strong
          >
        </p>
        <div
          v-for="(_, groupIndex) in selectedPlatformGroups"
          :key="groupIndex"
          class="tw:flex tw:items-center tw:gap-2 tw:mb-4 tw:last-of-type:mb-0"
        >
          <PlatformSelect
            v-model="selectedPlatformGroups[groupIndex]"
            :label="`Group ${groupIndex + 1}`"
            multiple
            :exclude-platforms="getExcludedPlatforms(groupIndex)"
          />
          <CloseButton
            v-if="selectedPlatformGroups.length > 1"
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
            selectedPlatformGroups[selectedPlatformGroups.length - 1]
              ?.length === 0 || allSelected
          "
          @click="addPlatformGroup"
        >
          Add Platform Group
        </TheButton>
      </fieldset>

      <fieldset :disabled="!platformsWithPC?.length">
        <legend class="tw:text-lg tw:font-medium tw:mb-2">PC Stores</legend>
        <p class="tw:text-sm tw:text-text-muted tw:mb-4">
          Select PC stores where the game is available and specify which
          platforms can play with each store's version.
          <strong class="tw:inline-block"
            >If the store doesn't support cross-play, leave the box
            empty.</strong
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
                v-model="selectedPcStores"
                type="checkbox"
                class="checkbox"
                :value="store.slug"
              />
              <span>{{ store.name }}</span>
            </label>

            <div v-if="selectedPcStores.includes(store.slug)">
              <PlatformSelect
                :model-value="
                  selectedPcStoresPlatforms[store.slug]?.crossplayPlatforms ??
                  []
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
            </div>
          </div>
        </div>
      </fieldset>

      <div
        v-if="formError"
        class="tw:text-sm tw:text-error"
      >
        {{ formError }}
      </div>

      <div class="tw:mt-4">
        <TheButton
          type="submit"
          :loading="isSubmitting"
          :disabled="!isValidForm || isSubmitting"
        >
          {{ isSubmitting ? "Submitting..." : "Submit" }}
        </TheButton>
      </div>
    </form>
  </div>
</template>
