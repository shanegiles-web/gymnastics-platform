import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { APIResponse } from "../types/index.js";

export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("Error:", error);

  const response: APIResponse = {
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An internal server error occurred",
    },
  };

  let statusCode = 500;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    response.error = {
      code: error.code,
      message: error.message,
      details: error.details,
    };
  } else if (error instanceof ZodError) {
    statusCode = 400;
    response.error = {
      code: "VALIDATION_ERROR",
      message: "Request validation failed",
      details: error.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    };
  } else if (error instanceof SyntaxError) {
    statusCode = 400;
    response.error = {
      code: "INVALID_JSON",
      message: "Invalid JSON in request body",
    };
  }

  res.status(statusCode).json(response);
}

export function notFoundHandler(req: Request, res: Response): void {
  const response: APIResponse = {
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found`,
    },
  };

  res.status(404).json(response);
}
