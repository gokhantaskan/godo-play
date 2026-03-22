# UI Improvement Tasks

Remaining items from the design critique, in priority order.

## 1. Typeset — Games listing hierarchy

The games page has a flat typographic rhythm. The page heading, filter controls, and results grid blur together visually. Casual users scan — they need stronger visual separation.

**What to do:**

- Create more vertical separation between the page header zone (title + description) and the filter/results area
- Consider a subtle divider, background shift, or increased spacing between sections
- Review the narrow size band (0.75rem–1.125rem) used across filter labels, card titles, and game modes — introduce more contrast between heading levels
- The page description (`tw:text-text-muted tw:text-sm`) could be slightly larger or have more breathing room

**Files:** `app/pages/games/index.vue`, potentially `app/assets/styles/tailwind.css`
**Command:** `/typeset`

---

## 2. Arrange — Home page rhythm and content preview

The home page is a Prismic SliceZone with a centered hero (text + CTA) and uniform `padding-block: 4rem` on all sections. There's no game imagery, no social proof, no preview of the catalog. It communicates "landing page template" rather than "game discovery platform."

**What to do:**

- Add a featured/trending games row below the hero to immediately show catalog content
- Break the uniform section padding — vary rhythm between sections
- Show platform icons or a visual "cross-play" representation in the hero
- Consider showing total game count or other social proof ("500+ cross-play games")

**Files:** `app/pages/index.vue`, `app/slices/HeroSection/index.vue`, potentially a new slice or inline section

**Command:** `/arrange`
**Note:** This is the biggest lift — it involves Prismic content strategy decisions, not just code changes.

---

## 3. Animate — Game card hover micro-interactions

Cards now scale on hover (from the polish pass), but there's room for more personality. The brand promises "playful with purpose" — hover states are the easiest place to deliver that.

**What to do:**

- Add a subtle shadow lift on card hover (not just scale)
- Consider a cover image slight zoom effect within the card's `overflow: hidden` container
- Platform group icons could have a subtle stagger or highlight on card hover

**Files:** `app/assets/styles/components/_game-card.scss`, `app/components/CrossPlay/GameCard/CrossPlayGameCard.vue`

---

## 4. Navbar presence

The navbar has only 2 links (Games, About), no hover/focus transitions, and the brand name is plain text. For the primary navigation, it reads as a placeholder.

**What to do:**

- Add hover/focus states with transitions on nav links (underline, color shift, or subtle background)
- Give the brand mark more visual weight — consider font-weight, letter-spacing, or a slightly larger logo
- The Home link is commented out — decide: restore it or ensure logo-click-to-home is obvious
- Plan for mobile navigation (hamburger/slide-out) if not already handled

**Files:** `app/components/AppNavbar.vue`

---

## 5. Game card dialog — Game title in header

The dialog header is a 4rem transparent bar with just an X button. This wastes space and provides no orientation — users lose context of which game they're viewing, especially while loading.

**What to do:**

- Show the game name in the dialog header alongside the close button
- The title could fade in once data loads, or be passed from the card that opened the dialog

**Files:** `app/components/CrossPlay/GameCard/CrossPlayGameCardDialog.vue`, `app/components/CrossPlay/GameCard/CrossPlayGameCard.vue`
