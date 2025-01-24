<script setup lang="ts">
const LINKS = [
  {
    title: "Links",
    links: [
      { label: "Home", to: "/" },
      { label: "Multiplatform Games", to: { name: "MultiPlatformGamesPage" } },
      { label: "Cross-play Games", to: { name: "CrossPlayGamesPage" } },
      { label: "About", to: "/about" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy-policy" },
      { label: "Terms of Service", to: "/terms-of-service" },
    ],
  },
];
</script>

<template>
  <footer class="footer">
    <div class="footer__container tw:container">
      <div class="footer__brand">
        <div class="footer__brand-logo tw:flex tw:items-center tw:gap-2">
          <TheLogo class="tw:size-6" />
          <span class="footer__brand-text tw:text-[1.25rem]">GōdōPlay</span>
        </div>
        <div class="footer__copyright tw:text-sm">
          <span>&copy; {{ new Date().getFullYear() }} GodoPlay</span>
        </div>
      </div>
      <nav class="footer__nav">
        <div
          v-for="section in LINKS"
          :key="section.title"
          class="footer__nav-section"
        >
          <p class="footer__nav-title">{{ section.title }}</p>
          <ul class="footer__nav-list">
            <li
              v-for="(link, index) in section.links"
              :key="index"
              class="footer__nav-item"
            >
              <NuxtLink
                :to="link.to"
                class="footer__nav-link"
                >{{ link.label }}</NuxtLink
              >
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </footer>
</template>
