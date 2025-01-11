<script setup lang="ts">
export interface SearchInputProps {
  placeholder: string;
}

export interface SearchInputEmits {
  (e: "clear"): void;
}

defineProps<SearchInputProps>();
const emit = defineEmits<SearchInputEmits>();
const modelValue = defineModel<string>({
  default: "",
});

function handleClear() {
  modelValue.value = "";
  emit("clear");
}
</script>

<template>
  <div class="search-input">
    <Icon
      class="search-input__icon"
      name="lucide:search"
    />
    <input
      v-model="modelValue"
      class="search-input__input"
      type="search"
      :placeholder
    />
    <button
      v-if="modelValue.length"
      class="search-input__clear"
      aria-label="Clear search"
      @click="handleClear"
    >
      <Icon name="lucide:x" />
    </button>
  </div>
</template>

<style scoped lang="scss">
.search-input {
  --radius: var(--tw-radius-sm);
  --padding-inline: 0.5rem;
  --padding-block: 0.25rem;
  --clear-size: 1.5rem;

  border-radius: var(--radius);
  padding-inline: var(--padding-inline);
  padding-block: var(--padding-block);
  padding-inline-end: calc(var(--clear-size) + var(--padding-inline) * 2);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: white;
  border: 1px solid var(--tw-color-border);
  transition: border-color 0.2s ease-in-out;
  position: relative;

  &:focus-within {
    border-color: var(--tw-color-primary);
  }

  &__icon {
    color: var(--tw-color-text-muted);
    inline-size: 1.125rem;
    block-size: 1.125rem;
    flex-shrink: 0;
  }

  &__input {
    border: none;
    outline: none;
    flex: 1;
    field-sizing: content;
    inline-size: 100%;

    @media (min-width: 768px) {
      min-inline-size: 15rem;
    }

    // Remove search icon from input
    &::-webkit-search-decoration,
    &::-webkit-search-cancel-button,
    &::-webkit-search-results-button,
    &::-webkit-search-results-decoration {
      display: none;
    }
  }

  &__clear {
    inline-size: var(--clear-size);
    block-size: var(--clear-size);
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: var(--padding-inline);
    background-color: transparent;
    border: none;
    outline: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
