<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
  auth: {
    required: true,
    // role: "admin" // Uncomment when implementing role-based access
  },
});

const supabase = useSupabaseClient();

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

async function handleLogout() {
  await supabase.auth.signOut();
}
</script>

<template>
  <main class="tw:container">
    <div class="tw:flex tw:items-center tw:justify-between">
      <h1>Admin</h1>
      <TheButton @click="handleLogout">Logout</TheButton>
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
