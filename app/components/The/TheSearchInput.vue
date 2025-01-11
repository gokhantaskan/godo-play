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
