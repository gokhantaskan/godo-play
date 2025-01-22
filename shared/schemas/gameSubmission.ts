import { z } from "zod";

import {
  BaseGameSubmissionSchema,
  BaseInsertGameSubmissionSchema,
} from "~~/server/db/schema/tables/gameSubmissions";

// Extend base schemas with additional validation/transformation
export const GameSubmissionSchema = BaseGameSubmissionSchema.extend({
  // Add any additional validation or transformations here
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const InsertGameSubmissionSchema = BaseInsertGameSubmissionSchema.extend(
  {
    // Add any additional validation or transformations here
  }
);

export const UpdateGameSubmissionSchema = z.object({
  id: z.number(),
  status: z.enum(["pending", "approved", "rejected"]),
  reason: z.string().optional(),
});

// Export types for use in the application
export type GameSubmission = z.infer<typeof GameSubmissionSchema>;
export type InsertGameSubmission = z.infer<typeof InsertGameSubmissionSchema>;
export type UpdateGameSubmission = z.infer<typeof UpdateGameSubmissionSchema>;
