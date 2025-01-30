import type { Platform } from "~~/server/db/schema/tables/platforms";
import type { Store } from "~~/server/db/schema/tables/stores";

export type OmitTimestamps<T> = Omit<T, "createdAt" | "updatedAt">;

export interface PlatformHardcoded extends OmitTimestamps<Platform> {
  icon: string;
}

export interface StoreHardcoded extends OmitTimestamps<Store> {
  icon: string;
}

export type SubmissionStatus = "pending" | "approved" | "rejected";

export type SortDirection = "+" | "-";

export type SortableField =
  | "created_at"
  | "updated_at"
  | "popularity"
  | "first_release_date";

export type SortField = `${SortDirection}${SortableField}`;

export interface FilterParams {
  status?: SubmissionStatus[];
  search?: string;
  sort?: SortField;
  limit?: number;
  offset?: number;
  platforms?: string;
  gameModes?: string;
}

export interface PaginatedResponse<T> {
  total: number;
  count: number;
  data: T[];
  limit: number;
  offset: number;
}
