/**
 * Error class hierarchy for the Proofpoint Essentials API client.
 *
 * All errors thrown by this library extend {@link ServiceError}, which carries
 * the HTTP status code and the parsed (or raw) response body that produced it.
 */

export class ServiceError extends Error {
  public readonly statusCode: number;
  public readonly response: unknown;

  constructor(message: string, statusCode: number, response: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.response = response;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** 401 -- credentials missing, invalid, or the account is not an org administrator. */
export class AuthenticationError extends ServiceError {
  constructor(message: string, response: unknown) {
    super(message, 401, response);
  }
}

/** 403 -- credentials are valid but not permitted to perform this operation. */
export class ForbiddenError extends ServiceError {
  constructor(message: string, response: unknown) {
    super(message, 403, response);
  }
}

/** 404 -- the requested resource does not exist. */
export class NotFoundError extends ServiceError {
  constructor(message: string, response: unknown) {
    super(message, 404, response);
  }
}

/** 409 -- the request conflicts with the current state of the resource. */
export class ConflictError extends ServiceError {
  constructor(message: string, response: unknown) {
    super(message, 409, response);
  }
}

/** 422 -- the request body failed validation. */
export class ValidationError extends ServiceError {
  public readonly errors: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    errors: Array<{ field: string; message: string }>,
    response: unknown
  ) {
    super(message, 422, response);
    this.errors = errors;
  }
}

/** 429 -- rate limit exceeded. */
export class RateLimitError extends ServiceError {
  public readonly retryAfter: number;

  constructor(message: string, retryAfter: number, response: unknown) {
    super(message, 429, response);
    this.retryAfter = retryAfter;
  }
}

/** 500 -- an unexpected server-side error. */
export class ServerError extends ServiceError {
  constructor(message: string, statusCode: number, response: unknown) {
    super(message, statusCode, response);
  }
}
