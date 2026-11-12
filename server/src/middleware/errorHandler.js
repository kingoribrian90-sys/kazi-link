import { AppError } from "../utils/AppError.js";

export function notFoundHandler(_req, _res, next) {
  next(new AppError("Route not found.", 404));
}

export function errorHandler(error, _req, res, _next) {
  const isClientError =
    Number.isInteger(error.statusCode) &&
    error.statusCode >= 400 &&
    error.statusCode < 500;
  const statusCode =
    error instanceof AppError
      ? error.statusCode
      : error.code === "ER_DUP_ENTRY"
        ? 409
        : isClientError
          ? error.statusCode
          : 500;
  const message =
    error instanceof AppError
      ? error.message
      : error.code === "ER_DUP_ENTRY"
        ? "A record with that unique value already exists."
        : statusCode === 400 && error.type === "entity.parse.failed"
          ? "Request body must be valid JSON."
          : isClientError
            ? error.message
            : "An unexpected server error occurred.";

  if (statusCode === 500) console.error(error);
  res.status(statusCode).json({
    error: message,
    ...(error instanceof AppError && error.details ? { details: error.details } : {}),
  });
}
