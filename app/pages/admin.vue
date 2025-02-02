<script setup lang="ts">
const links = [
  {
    label: "Submissions",
    to: { name: "AdminGameSubmissionsPage" },
  },
  {
    label: "Stores",
    to: { name: "AdminStoresPage" },
  },
  {
    label: "Game Modes",
    to: { name: "AdminGameModesPage" },
  },
];
</script>

<template>
  <main class="tw:container">
    <h1>Admin</h1>
    <ul>
      <li
        v-for="link in links"
        :key="link.to.name"
      >
        <NuxtLink :to="link.to">{{ link.label }}</NuxtLink>
      </li>
    </ul>

    <div>
      <NuxtPage />
    </div>
  </main>
</template>
