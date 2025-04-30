import { GraphQLError } from "graphql";

/**
 * Custom error types for specific error scenarios
 */
export enum ErrorType {
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
  INPUT_VALIDATION_ERROR = "INPUT_VALIDATION_ERROR",
  NOT_FOUND_ERROR = "NOT_FOUND_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}

/**
 * Custom error class that extends GraphQLError
 */
export class AppError extends GraphQLError {
  constructor(
    message: string,
    errorType: ErrorType = ErrorType.INTERNAL_SERVER_ERROR,
    extensions?: Record<string, any>
  ) {
    super(message, {
      extensions: {
        code: errorType,
        ...extensions,
      },
    });
  }
}

/**
 * Error formatter for Apollo Server
 */
export const formatError = (formattedError, error) => {
  // Log errors to the console or to a logging service
  console.error("GraphQL Error:", error);

  // Don't expose internal server errors to clients in production
  if (
    process.env.NODE_ENV === "production" &&
    formattedError.extensions?.code === ErrorType.INTERNAL_SERVER_ERROR
  ) {
    return {
      message: "An internal server error occurred",
      extensions: { code: ErrorType.INTERNAL_SERVER_ERROR },
    };
  }

  return formattedError;
};
