<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";
import { ref } from "vue";

import type { GameSubmissionWithRelations } from "~~/shared/types/games";

interface Props {
  game: GameSubmissionWithRelations & {
    gameSubmissionGameModes: Array<{
      gameModeId: number;
      gameMode: {
        id: number;
        name: string;
        slug: string;
      };
    }>;
  };
  isPending?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "refresh" | "save-and-approve"): void;
}>();

const detailsRef = ref<{ save: () => Promise<void> } | null>(null);

async function handleUpdate(status: "approved" | "rejected") {
  try {
    if (status === "approved") {
      // First save the form data
      await detailsRef.value?.save();
    }

    // Then update the status
    await $fetch("/api/games/update", {
      method: "POST",
      body: {
        id: props.game.id,
        status,
      },
    });

    emit("refresh");
  } catch (error) {
    console.error("Failed to update submission:", error);
  }
}

async function handleDelete() {
  if (!confirm("Are you sure you want to delete this submission?")) {
    return;
  }

  try {
    await $fetch(`/api/games/${props.game.id}`, {
      method: "DELETE",
    });

    emit("refresh");
  } catch (error) {
    console.error("Failed to delete submission:", error);
  }
}
</script>

<template>
  <div class="submission-card">
    <div class="submission-card__image">
      <NuxtImg
        :src="`https://images.igdb.com/igdb/image/upload/t_cover_small/${game.external.igdbImageId}.jpg`"
        :alt="game.name"
      />
    </div>
    <div class="submission-card__content">
      <div class="submission-card__header">
        <h2 class="submission-card__title">{{ game.name }}</h2>
        <TheButton
          v-if="game.status === 'approved'"
          size="sm"
          variant="secondary"
          @click="handleDelete"
        >
          Delete
        </TheButton>
      </div>
      <p class="submission-card__meta">ID: {{ game.id }}</p>
      <p class="submission-card__meta">
        Submitted:
        {{
          new Intl.DateTimeFormat("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(game.createdAt))
        }}
      </p>

      <div class="submission-card__actions">
        <Disclosure
          v-slot="{ open }"
          as="div"
        >
          <DisclosureButton class="submission-card__edit-button">
            {{ open ? "Hide Details" : "Show Details" }}
          </DisclosureButton>
          <DisclosurePanel class="submission-card__edit-panel">
            <SubmissionListItemDetails
              ref="detailsRef"
              :submission="game"
              :disabled="game.status === 'rejected'"
              @refresh="emit('refresh')"
            />
          </DisclosurePanel>
        </Disclosure>

        <div
          v-if="isPending"
          class="submission-card__status-buttons"
        >
          <TheButton
            size="sm"
            variant="primary"
            @click="handleUpdate('approved')"
          >
            Approve
          </TheButton>
          <TheButton
            size="sm"
            variant="secondary"
            @click="handleUpdate('rejected')"
          >
            Reject
          </TheButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.submission-card {
  --card-spacing: 0.75rem;
  --image-width: 4rem;

  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--card-spacing);
  padding: var(--card-spacing);
  background-color: white;
  border-radius: var(--tw-radius-md);
  border: 1px solid var(--tw-color-border);

  &__image {
    img {
      aspect-ratio: 3/4;
      object-fit: cover;
      border-radius: var(--tw-radius-sm);
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.1);
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  &__title {
    font-size: 1rem;
    font-weight: 500;
    color: var(--tw-color-text);
    line-height: 1.25;
  }

  &__meta {
    font-size: 0.875rem;
    color: var(--tw-color-text-muted);
    line-height: 1.25;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-block-start: 0.5rem;
  }

  &__edit-button {
    width: fit-content;
    padding-block: 0.25rem;
    padding-inline: 0.75rem;
    font-size: 0.875rem;
    color: var(--tw-color-text-muted);
    background-color: var(--tw-color-gray-100);
    border-radius: var(--tw-radius-sm);
    transition: all 0.2s ease;

    &:hover {
      background-color: var(--tw-color-gray-200);
    }

    &[aria-expanded="true"] {
      background-color: var(--tw-color-primary);
      color: white;
    }
  }

  &__edit-panel {
    margin-block-start: 1rem;
  }

  &__status-buttons {
    display: flex;
    gap: 0.5rem;
  }
}
</style>
