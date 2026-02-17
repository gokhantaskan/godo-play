import type { ApiErrorResponse } from "~~/shared/types/globals";

export function extractApiError(error: unknown): ApiErrorResponse | null {
  if (!error) {
    return null;
  }

  // FetchError from $fetch — has response._data with the server error
  if (
    error instanceof Error &&
    "response" in error &&
    typeof (error as any).response === "object"
  ) {
    const responseData = (error as any).response?._data;
    if (responseData && typeof responseData.statusCode === "number") {
      return {
        statusCode: responseData.statusCode,
        message:
          responseData.message || responseData.statusMessage || error.message,
        data: responseData.data,
      };
    }
  }

  // H3Error-like from useFetch error ref — has statusCode directly
  if (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof (error as any).statusCode === "number"
  ) {
    const e = error as any;
    return {
      statusCode: e.statusCode,
      message: e.message || e.statusMessage || "An error occurred",
      data: e.data,
    };
  }

  // Generic Error fallback
  if (error instanceof Error) {
    return {
      statusCode: 0,
      message: error.message,
    };
  }

  return null;
}

export function useApiError() {
  const error = ref<ApiErrorResponse | null>(null);

  const message = computed(() => error.value?.message ?? "");
  const fieldErrors = computed(() => error.value?.data?.errors ?? {});
  const hasError = computed(() => error.value !== null);

  function set(err: unknown) {
    error.value = extractApiError(err);
  }

  function clear() {
    error.value = null;
  }

  return {
    error: readonly(error),
    message,
    fieldErrors,
    hasError,
    set,
    clear,
  };
}
