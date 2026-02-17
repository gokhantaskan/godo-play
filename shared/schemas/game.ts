import { z } from "zod";

import {
  type DbGame,
  DbGameSchema,
  type DbGameWithRelations,
  DbGameWithRelationsSchema,
  DbInsertGameSchema,
} from "~~/server/db/schema/tables/games";

// Base schemas for validation
const ExternalDataSchema = z.object({
  igdbId: z.number(),
  igdbImageId: z.string().optional(),
  igdbAggregatedRating: z.number().optional(),
});

// Extend base schemas with additional validation/transformation
const ExtendedGameSchema = DbGameSchema.extend({
  // Add any additional validation or transformations here
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

const ExtendedInsertGameSchema = DbInsertGameSchema.extend({
  // Add any additional validation or transformations here
});

export const UpdateGameSchema = z.object({
  id: z.number(),
  status: z.enum(["pending", "approved", "rejected"]),
  reason: z.string().optional(),
});

// Game submit schema
export const SubmitGameSchema = z.object({
  crossplayInformation: z.object({
    isOfficial: z.boolean().optional(),
    evidenceUrl: z.string().optional(),
    information: z.string().optional(),
  }),
  game: z.object({
    name: z.string().min(1, "Game name is required"),
    slug: z.string().min(1, "Game slug is required"),
    category: z.number().min(0, "Game category is required"),
    firstReleaseDate: z.string().optional(),
    freeToPlay: z.boolean().optional(),
    external: ExternalDataSchema,
  }),
  platformGroups: z
    .array(z.array(z.number()))
    .min(1, "At least one platform group is required")
    .refine(groups => groups.every(group => group.length > 0), {
      message: "Each platform group must contain at least one platform",
    }),
  storesPlatforms: z.record(
    z.string(),
    z.object({
      crossplayPlatforms: z.array(z.number()).default([]),
      storeUrl: z.string().url().optional(),
    })
  ),
  gameModeIds: z.array(z.number()).min(1, "At least one game mode is required"),
  tagIds: z.array(z.number()).optional(),
  token: z.string().min(1, "reCAPTCHA token is required"),
});

// Export the extended schemas
export const GameSchema = ExtendedGameSchema;
export const InsertGameSchema = ExtendedInsertGameSchema;

// Export array schema for API responses
export const GameResponseSchema = DbGameWithRelationsSchema.array();

// Export types for use in the application
export type Game = z.infer<typeof GameSchema>;
export type InsertGame = z.infer<typeof InsertGameSchema>;
export type UpdateGame = z.infer<typeof UpdateGameSchema>;
export type GameResponse = z.infer<typeof GameResponseSchema>;
export type SubmitGame = z.infer<typeof SubmitGameSchema>;

// Re-export base types
export type { DbGame as GameBase, DbGameWithRelations as GameWithRelations };
export { DbGameWithRelationsSchema as GameWithRelationsSchema };
