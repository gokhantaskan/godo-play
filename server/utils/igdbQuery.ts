type QueryValue = unknown;

const IGDB_SORT_FIELDS = new Set([
  "aggregated_rating",
  "first_release_date",
  "name",
  "popularity",
  "rating",
  "total_rating",
]);

function queryValues(value: QueryValue): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(item => queryValues(item));
  }

  if (!value) {
    return [];
  }

  // getQuery already URL-decodes values; decoding again throws URIError on a
  // bare "%"
  return String(value)
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
}

export function escapeApicalypseString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\s+/g, " ");
}

export function parseIgdbNumberList(value: QueryValue): number[] | undefined {
  const values = queryValues(value)
    .map(Number)
    .filter(id => Number.isInteger(id) && id > 0);

  return values.length ? [...new Set(values)] : undefined;
}

export function clampInteger(
  value: unknown,
  defaultValue: number,
  min: number,
  max: number
): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed)) {
    return defaultValue;
  }

  return Math.min(Math.max(parsed, min), max);
}

export function parseIgdbSort(
  value: unknown,
  defaultSort = "aggregated_rating desc"
): string {
  const raw = typeof value === "string" ? value.trim() : defaultSort;
  const [field, direction = "desc"] = raw.split(/\s+/);

  if (
    field &&
    IGDB_SORT_FIELDS.has(field) &&
    (direction === "asc" || direction === "desc")
  ) {
    return `${field} ${direction}`;
  }

  return defaultSort;
}
