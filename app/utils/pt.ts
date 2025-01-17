import type { AutoCompletePassThroughOptions } from "primevue/autocomplete";

export const autoCompletePt: AutoCompletePassThroughOptions = {
  root: {
    class: "combobox",
  },
  pcInputText: {
    root: {
      class: "combobox__input",
    },
  },
  searchResultMessage: {
    class: "combobox__search-result-message",
  },
  dropdown: {
    class: "combobox__dropdown-button",
  },
  overlay: {
    class: "combobox__dropdown-menu",
  },
  listContainer: {
    class: "combobox__dropdown-list-wrapper",
    style: {
      maxHeight: "unset",
    },
  },
  list: {
    class: "combobox__dropdown-list",
  },
  option: {
    class: "combobox__dropdown-list-item",
    focus: {
      class: "combobox__dropdown-list-item--focus",
    },
  },
  emptyMessage: {
    class: "combobox__empty-message",
  },
};
