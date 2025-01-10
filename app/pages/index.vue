<script setup lang="ts"></script>

<template>
  <main class="tw:container tw:space-y-4">
    <header class="tw:flex tw:justify-between tw:items-center tw:gap-4">
      <h1 class="tw:font-bold">GōdōPlay</h1>
    </header>

    <section class="tw:text-sm tw:max-w-[80ch]">
      <p class="tw:mb-2">
        Inspired by the Japanese word Gōdō (合同), meaning "fusion" or "coming
        together," GōdōPlay is your go-to app for discovering co-op and
        multiplayer games across PC, PlayStation, Xbox, and Nintendo Switch.
      </p>
      <p>
        Whether you're teaming up with friends for unforgettable adventures or
        diving into intense multiplayer battles, GōdōPlay seamlessly brings
        gamers together. Explore the best cross-platform games and connect with
        ease—because gaming is better when shared.
      </p>
      <NuxtLink
        v-slot="{ navigate }"
        to="/games"
        custom
      >
        <button @click="navigate">
          Find the best co-op and multiplayer games
        </button>
      </NuxtLink>
    </section>
  </main>
</template>
