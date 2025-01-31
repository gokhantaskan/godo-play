<script setup lang="ts" generic="T extends SelectOption['value']">
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
  valueKey?: string;
  labelKey?: string;
  fullWidth?: boolean;
}

const props = withDefaults(defineProps<SelectProps>(), {
  label: "",
  required: false,
  placeholder: "Select an option",
  disabled: false,
  icon: "",
  multiple: false,
  valueKey: "value",
  labelKey: "label",
  fullWidth: false,
});

const modelValue = defineModel<T | T[]>();

const selectedOptions = computed(() => {
  if (!props.multiple) {
    const option = props.options.find(
      option => option[props.valueKey] === modelValue.value
    );
    return option ? [option] : [];
  }
  return props.options.filter(option =>
    (modelValue.value as T[])?.includes(option[props.valueKey])
  );
});
</script>

<template>
  <Listbox
    v-model="modelValue"
    class="select form-group"
    as="div"
    :disabled="disabled"
    :multiple="multiple"
  >
    <ListboxLabel
      v-if="label"
      class="form-group__label"
      :class="{
        'form-group__label--required': required,
      }"
    >
      {{ label }}
    </ListboxLabel>

    <ListboxButton
      class="select__button"
      :class="{ 'select__button--disabled': disabled }"
    >
      <div
        v-if="!multiple"
        class="tw:flex tw:items-center tw:gap-2 tw:min-w-0"
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
          class="select__button-text tw:truncate"
          :class="{
            'select__button-text--placeholder': !selectedOptions.length,
          }"
        >
          {{ selectedOptions[0]?.label || placeholder }}
        </span>
      </div>
      <div
        v-else
        class="tw:flex tw:flex-wrap tw:items-center tw:gap-1.5"
      >
        <template v-if="selectedOptions.length">
          <span
            v-for="option in selectedOptions"
            :key="option.value ?? ''"
            class="tw:inline-flex tw:items-center tw:gap-1 tw:px-1.5 tw:py-0.5 tw:text-sm tw:rounded-sm tw:bg-gray-200"
          >
            <Icon
              v-if="option.icon"
              :name="option.icon"
              class="tw:size-4"
            />
            {{ option.label }}
          </span>
        </template>
        <span
          v-else
          class="select__button-text tw:truncate select__button-text--placeholder"
        >
          {{ placeholder }}
        </span>
      </div>

      <span class="select__button-icon">
        <Icon
          name="lucide:chevron-down"
          class="tw:size-5"
          aria-hidden="true"
        />
      </span>
    </ListboxButton>

    <ListboxOptions
      class="select__options"
      :class="{ 'select__options--full-width': fullWidth }"
    >
      <template v-if="options.length">
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
      </template>
      <template v-else>
        <div class="tw:text-center tw:text-sm tw:text-gray-500 tw:py-2">
          Empty
        </div>
      </template>
    </ListboxOptions>
  </Listbox>
</template>
