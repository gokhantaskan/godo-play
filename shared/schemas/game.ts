import { z } from "zod";

import {
  type DbGame,
  DbGameSchema,
  type DbGameWithRelations,
  DbGameWithRelationsSchema,
  DbInsertGameSchema,
} from "~~/server/db/schema/tables/games";

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

// Re-export base types with submission naming
export type { DbGame as GameBase, DbGameWithRelations as GameWithRelations };
export { DbGameWithRelationsSchema as GameWithRelationsSchema };
