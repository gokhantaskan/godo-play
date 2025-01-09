<script setup lang="ts">
import {
  Listbox,
  ListboxButton,
  ListboxLabel,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/vue";

interface Option {
  id: number | string | null;
  name: string;
  icon?: string;
}

interface Props {
  options: Option[];
  label?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  icon?: string; // Nuxt Icon component name
}

const props = withDefaults(defineProps<Props>(), {
  label: "",
  required: false,
  placeholder: "Select an option",
  disabled: false,
  icon: "",
});

const modelValue = defineModel<Option["id"]>();

const selectedOption = computed(() => {
  return props.options.find(option => option.id === modelValue.value);
});
</script>

<template>
  <Listbox
    v-model="modelValue"
    :disabled="disabled"
    as="div"
    class="select"
  >
    <ListboxLabel
      v-if="label"
      class="select__label"
    >
      {{ label }}
      <span
        v-if="required"
        class="select__label-required"
      >
        *
      </span>
    </ListboxLabel>

    <ListboxButton class="select__button">
      <span
        v-if="$slots.icon || icon"
        class="select__button-leading"
      >
        <slot name="icon">
          <Icon :name="icon" />
        </slot>
      </span>

      <span
        class="select__button-text"
        :class="{ 'select__button-text--placeholder': !selectedOption }"
      >
        {{ selectedOption?.name || placeholder }}
      </span>

      <span class="select__button-icon">
        <Icon
          name="lucide:chevron-down"
          class="tw:size-5"
          aria-hidden="true"
        />
      </span>
    </ListboxButton>

    <transition
      leave-active-class="tw:transition tw:duration-100 tw:ease-in"
      leave-from-class="tw:opacity-100"
      leave-to-class="tw:opacity-0"
    >
      <ListboxOptions class="select__options">
        <ListboxOption
          v-for="option in options"
          :key="option.id ?? 'null'"
          v-slot="{ active, selected }"
          :value="option.id"
          as="template"
        >
          <li
            :class="[
              'select__option',
              active && 'select__option--active',
              selected && 'select__option--selected',
            ]"
          >
            <Icon
              v-if="option.icon"
              :name="option.icon"
              class="select__option-icon"
              aria-hidden="true"
            />
            {{ option.name }}
            <span
              v-if="selected"
              class="select__option-check"
            >
              <Icon
                name="lucide:check"
                class="tw:size-5"
                aria-hidden="true"
              />
            </span>
          </li>
        </ListboxOption>
      </ListboxOptions>
    </transition>
  </Listbox>
</template>
