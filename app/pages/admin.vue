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
  {
    label: "Tags",
    to: { name: "AdminTagsPage" },
  },
];
</script>

<template>
  <main class="tw:container">
    <div class="tw:flex tw:items-center tw:justify-between">
      <h1>Admin</h1>
      <LogoutWrapper
        v-slot="{ logoutFn }"
        redirect
      >
        <TheButton @click="logoutFn">Logout</TheButton>
      </LogoutWrapper>
    </div>
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
