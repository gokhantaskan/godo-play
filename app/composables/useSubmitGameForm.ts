import type { GameOption } from "~/components/SubmitGame/SubmitGameAutocomplete.vue";
import type { PlatformId } from "~/types/crossPlay";
import type { PCStore, PCStoreData, PlatformGroups } from "~/types/submit-game";
import { SUPPORTED_PLATFORMS } from "~~/shared/constants";

export function useSubmitGameForm() {
  const selectedGame = ref<GameOption | null>(null);
  const selectedPlatformGroups = ref<PlatformGroups>([[]]);
  const selectedPcStores = ref<PCStore["slug"][]>([]);
  const selectedPcStoresPlatforms = ref<PCStoreData>({});
  const isSubmitting = ref(false);
  const error = ref<string | null>(null);

  const platformGroupIndexWithPC = computed(() => {
    const index = selectedPlatformGroups.value.findIndex(group =>
      group.includes(6)
    );
    return index === -1 ? null : index;
  });

  const platformsWithPC = computed(() => {
    if (platformGroupIndexWithPC.value === null) {
      return [];
    }

    return selectedPlatformGroups.value[platformGroupIndexWithPC.value];
  });

  const allSelected = computed(() => {
    const selectedPlatforms = new Set(selectedPlatformGroups.value.flat());
    return SUPPORTED_PLATFORMS.every(platform =>
      selectedPlatforms.has(platform.id)
    );
  });

  const isValidPcStores = computed(() => {
    if (!selectedPcStores.value.length) {
      return true;
    }

    return selectedPcStores.value.every(store => {
      const platforms =
        selectedPcStoresPlatforms.value[store]?.crossplayPlatforms;
      return Array.isArray(platforms);
    });
  });

  const isValidForm = computed(() => {
    const hasValidGroups = selectedPlatformGroups.value.some(
      group => group.length > 0
    );
    const hasValidGame = typeof selectedGame.value === "object";

    return (
      hasValidGame &&
      hasValidGroups &&
      isValidPcStores.value &&
      !isSubmitting.value
    );
  });

  function getExcludedPlatforms(currentGroupIndex: number): PlatformId[] {
    return selectedPlatformGroups.value.reduce<PlatformId[]>(
      (acc, group, index) => {
        if (index !== currentGroupIndex) {
          acc.push(...group);
        }
        return acc;
      },
      []
    );
  }

  function addPlatformGroup(): void {
    selectedPlatformGroups.value = [...selectedPlatformGroups.value, []];
  }

  function removePlatformGroup(index: number): void {
    selectedPlatformGroups.value = selectedPlatformGroups.value.filter(
      (_, i) => i !== index
    );

    if (selectedPlatformGroups.value.length === 0) {
      selectedPlatformGroups.value = [[]];
    }
  }

  function updatePcStorePlatforms(
    store: PCStore["slug"],
    platforms: PlatformId[]
  ) {
    selectedPcStoresPlatforms.value[store] = {
      crossplayPlatforms: platforms,
    };
  }

  function resetForm() {
    selectedGame.value = null;
    selectedPlatformGroups.value = [[]];
    selectedPcStores.value = [];
    selectedPcStoresPlatforms.value = {};
  }

  watch(
    selectedPlatformGroups,
    groups => {
      const hasPCPlatform = groups.some(group =>
        group.includes(6 as PlatformId)
      );

      if (!hasPCPlatform) {
        selectedPcStores.value = [];
        selectedPcStoresPlatforms.value = {};
      }
    },
    { deep: true }
  );

  watch(
    selectedPcStores,
    (newStores, oldStores) => {
      if (oldStores) {
        const removedStores = oldStores.filter(
          store => !newStores.includes(store)
        );

        selectedPcStoresPlatforms.value = Object.fromEntries(
          Object.entries(selectedPcStoresPlatforms.value).filter(
            ([store]) => !removedStores.includes(store as PCStore["slug"])
          )
        );
      }

      newStores.forEach(store => {
        if (!selectedPcStoresPlatforms.value[store]) {
          selectedPcStoresPlatforms.value = {
            ...selectedPcStoresPlatforms.value,
            [store]: { crossplayPlatforms: [] },
          };
        }
      });
    },
    { deep: true }
  );

  return {
    // State
    selectedGame,
    selectedPlatformGroups,
    selectedPcStores,
    selectedPcStoresPlatforms,
    isSubmitting,
    error,

    // Computed
    platformGroupIndexWithPC,
    platformsWithPC,
    allSelected,
    isValidPcStores,
    isValidForm,

    // Methods
    getExcludedPlatforms,
    addPlatformGroup,
    removePlatformGroup,
    updatePcStorePlatforms,
    resetForm,
  };
}
