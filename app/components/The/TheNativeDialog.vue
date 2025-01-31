<script setup lang="ts">
const isOpen = defineModel<boolean>("open");
const dialogRef = useTemplateRef("dialogRef");

function handleClose() {
  isOpen.value = false;
}

function handleBackdropClick(event: MouseEvent) {
  const dialogDimensions = dialogRef.value?.getBoundingClientRect();
  if (!dialogDimensions) {
    return;
  }

  const clickedInDialog =
    event.clientX >= dialogDimensions.left &&
    event.clientX <= dialogDimensions.right &&
    event.clientY >= dialogDimensions.top &&
    event.clientY <= dialogDimensions.bottom;

  if (!clickedInDialog) {
    handleClose();
  }
}

// Store original body overflow
let originalOverflow = "";

const unwatch = watch(isOpen, isOpen => {
  if (isOpen) {
    originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.value?.showModal();
  } else {
    document.body.style.overflow = originalOverflow;
    dialogRef.value?.close();
  }
});

// Cleanup on component unmount
onUnmounted(() => {
  document.body.style.overflow = originalOverflow;
  unwatch();
});
</script>

<template>
  <dialog
    ref="dialogRef"
    class="native-dialog"
    @close="handleClose"
    @click="handleBackdropClick"
  >
    <slot />
  </dialog>
</template>

<style lang="scss" scoped>
.native-dialog {
  padding: 0;
  border: none;
  background: transparent;
  // max-height: 90vh;
  // max-width: 90vw;
  // margin: auto;
  overflow: visible;

  &::backdrop {
    background: rgb(0 0 0 / 50%);
  }

  // &[open] {
  //   display: grid;
  // }
}
</style>
