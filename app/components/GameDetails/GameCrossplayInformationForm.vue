<script setup lang="ts">
import type { CrossplayInformation } from "~~/shared/types/crossplay";

const props = defineProps<{
  modelValue: CrossplayInformation;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: CrossplayInformation];
}>();

const localValue = computed({
  get: () => props.modelValue ?? { evidenceUrl: null, information: null },
  set: value => emit("update:modelValue", value),
});

const editorContent = computed({
  get: () => localValue.value.information ?? "",
  set: (value: string) => {
    localValue.value = {
      ...localValue.value,
      information: value || null,
    };
  },
});
</script>

<template>
  <fieldset>
    <legend>Crossplay Information</legend>
    <p class="tw:text-sm tw:text-text-muted tw:mb-4">
      Provide evidence and information about the game's cross-play capabilities.
    </p>
    <div class="tw:space-y-2">
      <div>
        <input
          :value="localValue.evidenceUrl ?? ''"
          label="Evidence URL"
          @input="
            e => {
              const value = (e.target as HTMLInputElement).value;
              localValue = {
                ...localValue,
                evidenceUrl: value || null,
              };
            }
          "
        />
      </div>
      <ClientOnly>
        <div>
          <SubmissionRTE v-model="editorContent" />
        </div>
      </ClientOnly>
    </div>
  </fieldset>
</template>
