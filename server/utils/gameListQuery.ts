import type {
  GameStatus,
  SortableField,
  SortField,
} from "~~/shared/types/globals";

type QueryValue = unknown;

interface ParseGameListQueryOptions {
  defaultLimit?: number;
  maxLimit?: number;
  defaultSort?: SortField;
  defaultStatuses?: GameStatus[];
}

const SORTABLE_FIELDS = [
  "created_at",
  "updated_at",
  "popularity",
  "first_release_date",
] as const satisfies readonly SortableField[];

const GAME_STATUSES = ["pending", "approved", "rejected"] as const;

function queryValues(value: QueryValue): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(item => queryValues(item));
  }

  if (!value) {
    return [];
  }

  // getQuery already URL-decodes values; decoding again throws URIError on a
  // bare "%" (e.g. a "50%" search term)
  return String(value)
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
}

function firstQueryValue(value: QueryValue): string | undefined {
  return queryValues(value)[0];
}

// Whole single value without comma-splitting, for free-text fields like search
// where a comma is a legitimate part of the term
function singleValue(value: QueryValue): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;

  if (!raw) {
    return undefined;
  }

  const trimmed = String(raw).trim();

  return trimmed || undefined;
}

function parseIntegerList(value: QueryValue): number[] | undefined {
  const values = queryValues(value).map(Number).filter(Number.isInteger);

  return values.length ? [...new Set(values)] : undefined;
}

function parseLimit(
  value: QueryValue,
  defaultLimit: number,
  maxLimit: number
): number {
  const parsed = Number(firstQueryValue(value));

  if (!Number.isInteger(parsed) || parsed < 1) {
    return defaultLimit;
  }

  return Math.min(parsed, maxLimit);
}

function parseOffset(value: QueryValue): number {
  const parsed = Number(firstQueryValue(value));

  if (!Number.isInteger(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}

function parseStatuses(
  value: QueryValue,
  defaultStatuses?: GameStatus[]
): GameStatus[] | undefined {
  const statuses = queryValues(value).filter((status): status is GameStatus =>
    GAME_STATUSES.includes(status as GameStatus)
  );

  return statuses.length ? [...new Set(statuses)] : defaultStatuses;
}

function parseSortValue(rawSort: string) {
  const direction = rawSort[0];
  const field = rawSort.slice(1);

  if (
    (direction === "-" || direction === "+") &&
    SORTABLE_FIELDS.includes(field as SortableField)
  ) {
    return {
      field: field as SortableField,
      isDescending: direction === "-",
      value: rawSort as SortField,
    };
  }

  return null;
}

function parseSort(value: QueryValue, defaultSort: SortField) {
  const rawSort = firstQueryValue(value) ?? defaultSort;

  // Fall back through the caller default to a guaranteed-valid literal so an
  // invalid input (or invalid defaultSort) can never recurse unbounded
  return (
    parseSortValue(rawSort) ??
    parseSortValue(defaultSort) ??
    parseSortValue("-popularity")!
  );
}

export function parseGameListQuery(
  query: Record<string, unknown>,
  options: ParseGameListQueryOptions = {}
) {
  const {
    defaultLimit = 60,
    maxLimit = 500,
    defaultSort = "-popularity",
    defaultStatuses,
  } = options;

  return {
    platforms: parseIntegerList(query.platforms),
    gameModes: parseIntegerList(query.gameModes),
    tags: parseIntegerList(query.tags),
    limit: parseLimit(query.limit, defaultLimit, maxLimit),
    offset: parseOffset(query.offset),
    search: singleValue(query.search),
    statuses: parseStatuses(query.status, defaultStatuses),
    sort: parseSort(query.sort, defaultSort),
    freeToPlay: firstQueryValue(query.freeToPlay) === "true",
  };
}
