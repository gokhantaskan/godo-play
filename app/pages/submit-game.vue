<script setup lang="ts">
import type { GameOption } from "~/components/SubmitGame/SubmitGameAutocomplete.vue";
import { SUPPORTED_PLATFORM_IDS } from "~~/shared/constants";

// window.grecaptcha is only available in the browser on this page
declare global {
  interface Window {
    grecaptcha?: Record<string, any>;
  }
}

const { recaptchaSiteKey } = useRuntimeConfig().public.google;

useHead({
  script: [
    {
      src: `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`,
    },
  ],
});

interface SubmitGameForm {
  game: GameOption | null;
  platformGroups: number[][];
}

const form = reactive<SubmitGameForm>({
  game: null,
  platformGroups: [[]],
});

const allSelected = computed(() => {
  return form.platformGroups.flat().length === SUPPORTED_PLATFORM_IDS.length;
});

const isValidForm = computed(() => {
  return form.game && form.platformGroups.some(group => group.length > 0);
});

function getExcludedPlatforms(currentGroupIndex: number) {
  return form.platformGroups.reduce((acc: number[], group, index) => {
    if (index !== currentGroupIndex) {
      acc.push(...group);
    }
    return acc;
  }, []);
}

function addPlatformGroup() {
  form.platformGroups.push([]);
}

function removePlatformGroup(index: number) {
  form.platformGroups.splice(index, 1);

  if (form.platformGroups.length === 0) {
    form.platformGroups.push([]);
  }
}

async function submit() {
  if (!isValidForm.value) {
    return;
  }

  try {
    // Get reCAPTCHA token
    const token = await window.grecaptcha?.execute(recaptchaSiteKey, {
      action: "submit",
    });

    // TODO: Send form data to API
    console.log("submit", {
      game: form.game,
      platformGroups: form.platformGroups,
      token,
    });

    await $fetch("/api/submit-game", {
      method: "POST",
      body: {
        game: form.game,
        platformGroups: form.platformGroups,
      },
    });

    navigateTo("/");
  } catch (error) {
    console.error("Failed to submit form:", error);
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
      @submit.prevent="submit"
    >
      <SubmitGameAutocomplete v-model="form.game" />

      <fieldset>
        <legend>Cross-play Groups</legend>
        <p class="tw:text-sm tw:text-text-muted tw:mb-4">
          Specify the platforms that can play together. Each group represents a
          set of platforms that can interact with one another. If platforms
          belong to separate groups, they cannot play together.
        </p>
        <div
          v-for="(_, groupIndex) in form.platformGroups"
          :key="groupIndex"
          class="tw:flex tw:items-center tw:gap-2 tw:mb-4 tw:last-of-type:mb-0"
        >
          <PlatformSelect
            v-model="form.platformGroups[groupIndex]"
            :label="`Group ${groupIndex + 1}`"
            multiple
            :exclude-platforms="getExcludedPlatforms(groupIndex)"
          />
          <CloseButton
            v-if="form.platformGroups.length > 1"
            size="lg"
            @click="removePlatformGroup(groupIndex)"
          />
        </div>

        <TheButton
          v-if="!allSelected"
          class="tw:mt-4"
          type="button"
          size="sm"
          variant="secondary"
          :disabled="
            form.platformGroups[form.platformGroups.length - 1]?.length === 0
          "
          @click="addPlatformGroup"
        >
          Add Platform Group
        </TheButton>
      </fieldset>

      <div class="tw:mt-4">
        <TheButton
          type="submit"
          :disabled="!isValidForm"
        >
          Submit
        </TheButton>
      </div>
    </form>
  </div>
</template>
