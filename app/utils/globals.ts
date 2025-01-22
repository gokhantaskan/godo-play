import { SUPPORTED_PLATFORMS_BY_ID } from "~~/shared/constants/platforms";

export const IS_PROD = process.env.NODE_ENV === "production";
export const IS_DEV = process.env.NODE_ENV === "development";
export const IN_BROWSER = typeof window !== "undefined";

export function getPlatformNameById(id: number | undefined) {
  return id ? SUPPORTED_PLATFORMS_BY_ID[id]?.name : undefined;
}
