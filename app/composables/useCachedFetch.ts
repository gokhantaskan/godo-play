import { defu } from "defu";

type UseFetchOptions<T = any> = Omit<
  Parameters<typeof useFetch<T>>[1],
  "key" | "lazy"
>;

export function useCachedFetch<T>(
  url: string,
  options?: Omit<UseFetchOptions<T>, "key" | "lazy">,
  preventFetch = false
) {
  const { data } = useNuxtData(url);

  const fetchOptions = defu(options, {
    key: url,
    lazy: preventFetch || !!data.value,
  });

  return useFetch<T>(url, fetchOptions);
}
