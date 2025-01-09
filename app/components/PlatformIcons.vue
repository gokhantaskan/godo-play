<script setup lang="ts">
interface PlatformIcon {
  svg: string;
  color: string;
}

const platformColors = {
  ps: "#0070d1", // PlayStation blue
  xbox: "#107c10", // Xbox green
  switch: "#e60012", // Nintendo red
  win: "#00a4ef", // Windows blue
} as const;

const iconImports = import.meta.glob("../assets/icons/*.svg", {
  as: "raw",
});

const icons = ref<Record<string, PlatformIcon>>({});

const platformOrder = {
  win: 1,
  ps: 2,
  xbox: 3,
  switch: 4,
} as const;

onMounted(async () => {
  const iconEntries = await Promise.all(
    Object.entries(iconImports).map(async ([path, importFn]) => {
      const svgContent = (await importFn()) as string;
      const platform = path.split("/").pop()?.replace(".svg", "") ?? "";
      return [
        platform,
        {
          svg: svgContent,
          color:
            platformColors[platform as keyof typeof platformColors] ?? "#888",
        },
      ];
    })
  );

  icons.value = Object.fromEntries(iconEntries);
});

const sortedIcons = computed(() => {
  return Object.entries(icons.value).sort(([a], [b]) => {
    const orderA = platformOrder[a as keyof typeof platformOrder] ?? 999;
    const orderB = platformOrder[b as keyof typeof platformOrder] ?? 999;
    return orderA - orderB;
  });
});
</script>

<template>
  <!-- eslint-disable vue/no-v-html -->
  <div class="tw:flex tw:gap-2">
    <div
      v-for="[platform, icon] in sortedIcons"
      :key="platform"
      class="tw:size-8"
      :style="{ color: icon.color }"
      :aria-label="`${platform} platform`"
      v-html="icon.svg"
    />
  </div>
</template>

<style scoped>
div :deep(svg) {
  fill: currentColor;
  width: 100%;
  height: 100%;
}
</style>
