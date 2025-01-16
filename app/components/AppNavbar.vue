<script setup lang="ts">
const menuItems = [
  // {
  //   label: "Home",
  //   to: "/",
  // },
  {
    label: "Games",
    to: "/games",
  },
  {
    label: "About",
    to: "/about",
  },
];
</script>

<template>
  <nav class="navbar">
    <div class="navbar__wrapper tw:container">
      <div class="navbar__brand">
        <NuxtLink to="/">
          <TheLogo />
          <span>GōdōPlay</span>
        </NuxtLink>
      </div>
      <div class="navbar__nav">
        <ul class="navbar__nav-list">
          <li
            v-for="item in menuItems"
            :key="item.label"
            class="navbar__nav-item"
          >
            <NuxtLink
              :to="item.to"
              class="navbar__nav-link"
              active-class="navbar__nav-link--active"
            >
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped lang="scss">
.navbar {
  --link-color: var(--tw-color-fg);
  --link-color-hover: var(--tw-color-fg);
  --link-color-active: var(--tw-color-primary);

  height: var(--navbar-height);
  display: flex;
  align-items: center;

  a {
    text-decoration: none;
  }

  &__wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__brand {
    a {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    svg {
      width: auto;
      height: 1.5rem;
    }

    span {
      color: var(--link-color);
    }
  }

  &__nav {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  &__nav-list {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  &__nav-item {
    list-style: none;
  }

  &__nav-link {
    color: var(--link-color);

    &--active {
      color: var(--link-color-active);
    }
  }
}
</style>
