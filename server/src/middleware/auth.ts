import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { CONFIG } from "../config/index.js";
import { AppError } from "./error-handler.js";

export interface JWTPayload {
  id: string;
  email: string;
  facilityId: string;
  role: "global_admin" | "admin" | "manager" | "coach" | "parent" | "student";
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Missing or invalid authorization header", "MISSING_AUTH", 401);
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, CONFIG.JWT_SECRET) as JWTPayload;

    req.user = {
      id: decoded.id,
      email: decoded.email,
      facilityId: decoded.facilityId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError("Token has expired", "TOKEN_EXPIRED", 401));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError("Invalid token", "INVALID_TOKEN", 401));
    } else if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError("Authentication failed", "AUTH_FAILED", 401));
    }
  }
}

export function authorize(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("User not authenticated", "NOT_AUTHENTICATED", 401));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError(`This action requires one of these roles: ${allowedRoles.join(", ")}`, "INSUFFICIENT_PERMISSIONS", 403));
      return;
    }

    next();
  };
}

export function validateTenant(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new AppError("User not authenticated", "NOT_AUTHENTICATED", 401));
    return;
  }

  const requestedFacilityId = req.query.facilityId || req.body?.facilityId || req.params.facilityId;

  if (requestedFacilityId && requestedFacilityId !== req.user.facilityId && req.user.role !== "global_admin") {
    next(new AppError("You do not have access to this facility", "FORBIDDEN", 403));
    return;
  }

  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, CONFIG.JWT_SECRET) as JWTPayload;

    req.user = {
      id: decoded.id,
      email: decoded.email,
      facilityId: decoded.facilityId,
      role: decoded.role,
    };

    next();
  } catch {
    // If token is invalid, just continue without user
    next();
  }
}
