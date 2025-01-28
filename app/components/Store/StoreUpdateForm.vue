<script setup lang="ts">
import { SUPPORTED_PLATFORMS } from "~~/shared/constants/platforms";
import type { StoreWithRelations } from "~~/shared/schemas/store";

interface Props {
  store: StoreWithRelations;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "submit", data: { name: string; supportedPlatformIds: number[] }): void;
}>();

const form = reactive({
  name: props.store.name,
  supportedPlatformIds: props.store.supportedPlatforms.map(
    sp => sp.platform.id
  ),
});

/** Handle form submission */
function handleSubmit() {
  emit("submit", {
    name: form.name,
    supportedPlatformIds: form.supportedPlatformIds,
  });
}
</script>

<template>
  <form
    class="store-update-form"
    @submit.prevent="handleSubmit"
  >
    <div class="store-update-form__field">
      <label
        for="name"
        class="store-update-form__label"
      >
        Name
      </label>
      <input
        id="name"
        v-model="form.name"
        type="text"
        class="store-update-form__input"
        required
      />
    </div>

    <div class="store-update-form__field">
      <TheSelect
        v-model="form.supportedPlatformIds"
        :options="
          SUPPORTED_PLATFORMS.map(platform => ({
            label: platform.name,
            value: platform.id,
            icon: platform.icon,
          }))
        "
        label="Supported Platforms"
        placeholder="Select platforms"
        multiple
      />
    </div>

    <div class="store-update-form__actions">
      <button
        type="submit"
        class="store-update-form__submit"
      >
        Update Store
      </button>
    </div>
  </form>
</template>

<style lang="scss">
.store-update-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__label {
    font-weight: 500;
  }

  &__input {
    padding-block: 0.5rem;
    padding-inline: 0.75rem;
    border: 1px solid rgb(var(--tw-gray-300));
    border-radius: 0.375rem;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    padding-block-start: 1rem;
  }

  &__submit {
    padding-block: 0.5rem;
    padding-inline: 1rem;
    color: rgb(var(--tw-white));
    background-color: rgb(var(--tw-blue-600));
    border-radius: 0.375rem;
    transition: background-color 0.2s ease-in-out;

    &:hover {
      background-color: rgb(var(--tw-blue-700));
    }
  }
}
</style>
