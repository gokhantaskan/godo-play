import type { z } from "zod";

import {
  type GameSubmission,
  GameSubmissionSchema,
  type GameSubmissionWithRelations,
  GameSubmissionWithRelationsSchema,
} from "../../server/db/schema/tables/gameSubmissions";

export {
  type GameSubmission,
  GameSubmissionSchema,
  type GameSubmissionWithRelations,
  GameSubmissionWithRelationsSchema,
};

// Export array schema for API responses
export const GameSubmissionResponseSchema =
  GameSubmissionWithRelationsSchema.array();
export type GameSubmissionResponse = z.infer<
  typeof GameSubmissionResponseSchema
>;
