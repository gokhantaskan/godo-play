<script setup lang="ts">
import {
  Listbox,
  ListboxButton,
  ListboxLabel,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/vue";

export interface SelectOption {
  label: string;
  value: string | number | null;
  icon?: string;
  [key: string]: any;
}

export interface SelectProps {
  options: SelectOption[];
  label?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  icon?: string;
  multiple?: boolean;
}

const props = withDefaults(defineProps<SelectProps>(), {
  label: "",
  required: false,
  placeholder: "Select an option",
  disabled: false,
  icon: "",
  multiple: false,
});

const modelValue = defineModel<SelectOption["value"]>();

const selectedOption = computed(() => {
  return props.options.find(option => option.value === modelValue.value);
});
</script>

<template>
  <Listbox
    v-model="modelValue"
    class="select"
    as="div"
    :disabled="disabled"
    :multiple="multiple"
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

    <ListboxButton
      class="select__button"
      :class="{ 'select__button--disabled': disabled }"
    >
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
        {{ selectedOption?.label || placeholder }}
      </span>

      <span class="select__button-icon">
        <Icon
          name="lucide:chevron-down"
          class="tw:size-5"
          aria-hidden="true"
        />
      </span>
    </ListboxButton>

    <ListboxOptions class="select__options">
      <ListboxOption
        v-for="option in options"
        :key="option.value ?? 'null'"
        v-slot="{ active, selected }"
        :value="option.value"
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
          {{ option.label }}
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
  </Listbox>
</template>
