import type { H3Error } from "h3";
import { ZodError } from "zod";

interface H3ErrorLike {
  statusCode: number;
  message: string;
}

export function isH3ErrorLike(error: unknown): error is H3ErrorLike {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    "message" in error
  );
}

export function isH3Error(error: unknown): error is H3Error {
  return error !== null && typeof error === "object" && "statusCode" in error;
}

function reduceZodIssues(error: ZodError): Record<string, string> {
  return error.issues.reduce((acc: Record<string, string>, issue) => {
    acc[issue.path.join(".")] = issue.message;
    return acc;
  }, {});
}

export function throwValidationError(error: ZodError): never {
  throw createError({
    statusCode: 400,
    statusMessage: "Validation Error",
    message: "Validation Error",
    data: { errors: reduceZodIssues(error) },
  });
}

export function throwDatabaseError(
  error: unknown,
  message = "Database operation failed"
): never {
  console.error("Database Error:", error);

  throw createError({
    statusCode: 500,
    statusMessage: message,
    message,
    data:
      error instanceof Error
        ? {
            error: error.message,
            ...(process.env.NODE_ENV === "development" && {
              stack: error.stack,
            }),
          }
        : undefined,
  });
}

export function throwExternalApiError(error: unknown, service: string): never {
  console.error(`${service} API Error:`, error);

  throw createError({
    statusCode: 502,
    statusMessage: `${service} service error`,
    message: `${service} service error`,
    data:
      error instanceof Error
        ? {
            error: error.message,
            ...(process.env.NODE_ENV === "development" && {
              stack: error.stack,
            }),
          }
        : undefined,
  });
}

export function throwApiError(error: unknown): never {
  if (error instanceof ZodError) {
    throwValidationError(error);
  }

  if (isH3Error(error)) {
    throw error;
  }

  if (isH3ErrorLike(error)) {
    throw error;
  }

  console.error("Unhandled Error:", error);

  throw createError({
    statusCode: 500,
    statusMessage: "An unexpected error occurred",
    message:
      error instanceof Error ? error.message : "An unexpected error occurred",
    data:
      error instanceof Error
        ? {
            error: error.message,
            ...(process.env.NODE_ENV === "development" && {
              stack: error.stack,
            }),
          }
        : undefined,
  });
}
