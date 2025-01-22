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

export function reduceZodIssues(error: ZodError) {
  return error.issues.reduce((acc: Record<string, string>, issue) => {
    acc[issue.path.join(".")] = issue.message;
    return acc;
  }, {});
}

export function customZodErrorWithData(error: ZodError) {
  return {
    statusCode: 400,
    statusMessage: "Validation Error",
    message: "Validation Error",
    data: { errors: reduceZodIssues(error) },
  };
}

export function handleDatabaseError(
  error: unknown,
  message = "Database operation failed"
) {
  console.error("Database Error:", error);

  if (error instanceof Error) {
    return {
      statusCode: 500,
      statusMessage: message,
      message,
      data: {
        error: error.message,
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
      },
    };
  }

  return {
    statusCode: 500,
    statusMessage: message,
    message,
  };
}

export function handleAuthError(error: unknown) {
  console.error("Authentication Error:", error);

  if (error instanceof Error) {
    return {
      statusCode: 401,
      statusMessage: "Authentication failed",
      message: "Authentication failed",
      data: {
        error: error.message,
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
      },
    };
  }

  return {
    statusCode: 401,
    statusMessage: "Authentication failed",
    message: "Authentication failed",
  };
}

export function handleExternalApiError(error: unknown, service: string) {
  console.error(`${service} API Error:`, error);

  if (error instanceof Error) {
    return {
      statusCode: 502,
      statusMessage: `${service} service error`,
      message: `${service} service error`,
      data: {
        error: error.message,
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
      },
    };
  }

  return {
    statusCode: 502,
    statusMessage: `${service} service error`,
    message: `${service} service error`,
  };
}

export function isH3Error(error: unknown): error is H3Error {
  return error !== null && typeof error === "object" && "statusCode" in error;
}

export function handleUnknownError(
  error: unknown,
  message = "An unexpected error occurred"
) {
  console.error("Unknown Error:", error);

  if (isH3Error(error)) {
    return {
      statusCode: error.statusCode,
      statusMessage: error.statusMessage || message,
      message: error.message,
      data: error.data,
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      statusMessage: message,
      message,
      data: {
        error: error.message,
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
      },
    };
  }

  return {
    statusCode: 500,
    statusMessage: message,
    message,
  };
}

export function handleError(error: unknown) {
  console.error("Error:", error);

  if (error instanceof Error) {
    if (error instanceof ZodError) {
      return customZodErrorWithData(error);
    }

    return handleUnknownError(error);
  }

  if (isH3Error(error)) {
    return {
      statusCode: error.statusCode,
      statusMessage: error.statusMessage || "An error occurred",
      message: error.message,
      data: error.data,
    };
  }

  return handleUnknownError(error);
}
