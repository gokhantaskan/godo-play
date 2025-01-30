<script setup lang="ts">
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/vue-3";

interface Props {
  modelValue?: string;
}

type Level = 3 | 4;
type ListType = "bulletList" | "orderedList";

const props = defineProps<Props>();
const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const editor = useEditor({
  content: props.modelValue,
  extensions: [StarterKit],
  editorProps: {
    attributes: {
      class: "tw:prose tw:max-w-none tw:p-4 tw:min-h-[200px] tw:outline-none",
    },
  },
  onUpdate: ({ editor }) => {
    emit("update:modelValue", editor.getHTML());
  },
});

function isActive(type: string, attrs = {}) {
  if (!editor.value?.isActive) {
    return false;
  }
  return editor.value.isActive(type, attrs);
}

function toggleHeading(level: number) {
  if (!editor.value?.chain) {
    return;
  }
  editor.value
    .chain()
    .focus()
    .toggleHeading({ level: level as Level })
    .run();
}

function toggleMark(type: "bold" | "italic") {
  if (!editor.value?.chain) {
    return;
  }
  editor.value.chain().focus().toggleMark(type).run();
}

function toggleList(type: ListType) {
  if (!editor.value?.chain) {
    return;
  }

  if (type === "bulletList") {
    editor.value.chain().focus().toggleBulletList().run();
  } else {
    editor.value.chain().focus().toggleOrderedList().run();
  }
}

function clearFormat() {
  if (!editor.value?.chain) {
    return;
  }
  editor.value.chain().focus().clearNodes().unsetAllMarks().run();
}
</script>

<template>
  <div class="tw:border tw:rounded-lg tw:overflow-hidden">
    <div
      class="tw:flex tw:gap-2 tw:items-center tw:p-2 tw:border-b tw:bg-gray-50"
    >
      <button
        v-for="level in [3, 4]"
        :key="`h${level}`"
        type="button"
        :class="{
          'tw:bg-primary tw:text-white': isActive('heading', { level }),
        }"
        @click="toggleHeading(level)"
      >
        <Icon name="fa6-solid:heading" /><span>{{ level }}</span>
      </button>

      <div class="tw:w-px tw:h-6 tw:bg-gray-300" />

      <button
        type="button"
        :class="{ 'tw:bg-primary tw:text-white': isActive('bold') }"
        @click="toggleMark('bold')"
      >
        <Icon name="fa6-solid:bold" />
      </button>

      <button
        type="button"
        :class="{ 'tw:bg-primary tw:text-white': isActive('italic') }"
        @click="toggleMark('italic')"
      >
        <Icon name="fa6-solid:italic" />
      </button>

      <div class="tw:w-px tw:h-6 tw:bg-gray-300" />

      <button
        type="button"
        :class="{ 'tw:bg-primary tw:text-white': isActive('bulletList') }"
        @click="toggleList('bulletList')"
      >
        <Icon name="fa6-solid:list-ul" />
      </button>

      <button
        type="button"
        :class="{ 'tw:bg-primary tw:text-white': isActive('orderedList') }"
        @click="toggleList('orderedList')"
      >
        <Icon name="fa6-solid:list-ol" />
      </button>

      <div class="tw:w-px tw:h-6 tw:bg-gray-300" />

      <button
        type="button"
        @click="clearFormat"
      >
        <Icon name="fa6-solid:xmark" />
      </button>
    </div>

    <EditorContent :editor="editor" />
  </div>
</template>

<style scoped lang="scss">
button {
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
}

.ProseMirror > *:first-child {
  margin-top: 0;
}
</style>
