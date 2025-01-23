<script setup lang="ts">
const links = [
  {
    label: "Submissions",
    to: { name: "AdminGameSubmissionsPage" },
  },
];
</script>

<template>
  <main>
    <h1>Admin</h1>
    <ul>
      <li
        v-for="link in links"
        :key="link.to.name"
      >
        <NuxtLink :to="link.to">{{ link.label }}</NuxtLink>
      </li>
    </ul>
  </main>
</template>
