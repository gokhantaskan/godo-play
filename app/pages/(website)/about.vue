<script setup lang="ts">
definePageMeta({
  name: "AboutPage",
});

useHead({
  title: "About",
});
</script>

<template>
  <main class="tw:py-8">
    <div class="tw:container">
      <article class="prose">
        <header>
          <h1>About GōdōPlay</h1>
          <p>
            Inspired by the Japanese word Gōdō (合同), meaning "fusion" or
            "coming together," GōdōPlay is your destination for discovering
            co-op and multiplayer games that work across different gaming
            platforms. This website helps you find games that are compatible
            with your specific combination of gaming systems.
          </p>
        </header>

        <section>
          <h2>How It Works</h2>
          <p>
            Select up to three platforms from PS4, PS5, Xbox Series X/S, PC, and
            Nintendo Switch to discover player games that work across your
            chosen systems. Whether you're gaming with friends on different
            platforms or want to check cross-play options, we make it easy to
            find compatible titles. From PC PS4 compatibility to PS5 and Xbox
            Series support, GōdōPlay simplifies your search for cross-platform
            multiplayer experiences.
          </p>
        </section>

        <section>
          <h2>Features That Matter</h2>
          <ul>
            <li>
              Compare games across PS4, PS5, Xbox Series X/S, PC, and Nintendo
              Switch
            </li>
            <li>
              Select up to three platforms to find compatible multiplayer games
            </li>
            <li>
              Filter games by genres including arcade, racing, sports, and more
            </li>
            <li>
              Explore titles based on themes such as 4X, thriller, and open
              world
            </li>
            <li>
              Find games by specific modes like battle royale, co-operative, and
              MMO
            </li>
            <li>Choose games based on player perspective</li>
            <li>Easy-to-use platform selection interface</li>
            <li>Clear compatibility information for each game</li>
          </ul>
        </section>

        <section>
          <h2>Gaming Information</h2>
          <p>
            GōdōPlay sources its game data from
            <NuxtLink
              to="https://www.igdb.com"
              target="_blank"
              >IGDB.com</NuxtLink
            >
            (Internet Game Database) through their API to provide information
            about cross-platform compatibility, multiplayer features, and game
            details. While I strive for accuracy, you should double-check the
            game information on the official websites for the most reliable and
            up-to-date details.
          </p>
        </section>

        <section>
          <h2>Start Discovering Games</h2>
          <p>
            Ready to find your next cross-platform multiplayer experience?
            <NuxtLink to="/games">Discover games</NuxtLink> that you and your
            friends can play together, regardless of your gaming systems. Simply
            select your platforms and start exploring.
          </p>
        </section>

        <section>
          <h2>Have questions?</h2>
          <p>
            If you have any questions or suggestions, please feel free to
            <a href="mailto:contact@godo-play.com">contact me via email</a>.
          </p>
        </section>
      </article>
    </div>
  </main>
</template>
