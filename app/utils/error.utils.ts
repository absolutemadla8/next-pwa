/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  /**
   * HTTP status code for the error
   */
  status: number;
  
  /**
   * Error code for identifying the type of error
   */
  code?: string;

  /**
   * Initialize a new AppError
   * @param message Error message
   * @param status HTTP status code
   * @param code Optional error code
   */
  constructor(message: string, status: number = 500, code?: string) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    
    // Capture stack trace (V8 specific)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * Standardized error response format
 * @param error Error object or message
 * @param defaultStatus Default HTTP status code if not provided
 * @returns Standardized error object with status, message, and details
 */
export function formatError(error: any, defaultStatus: number = 500): any {
  // If it's already an AppError, return its properties
  if (error instanceof AppError) {
    return {
      status: error.status,
      message: error.message,
      code: error.code,
    };
  }
  
  // If it's a standard Error, extract message and use default status
  if (error instanceof Error) {
    return {
      status: defaultStatus,
      message: error.message,
    };
  }
  
  // If it's a string, use as message with default status
  if (typeof error === 'string') {
    return {
      status: defaultStatus,
      message: error,
    };
  }
  
  // If it's an object, check if it has expected properties
  if (typeof error === 'object' && error !== null) {
    return {
      status: error.status || defaultStatus,
      message: error.message || 'An unknown error occurred',
      code: error.code,
      details: error.details,
    };
  }
  
  // Fallback for unexpected error types
  return {
    status: defaultStatus,
    message: 'An unknown error occurred',
  };
}
