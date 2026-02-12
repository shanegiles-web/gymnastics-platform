import { Router, Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";
import { validate } from "../middleware/validate.js";
import { optionalAuth } from "../middleware/auth.js";
import { AppError } from "../middleware/error-handler.js";
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} from "../utils/validators.js";
import { APIResponse } from "../types/index.js";

const router = Router();

// Register new user
router.post(
  "/register",
  validate(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, firstName, lastName, facilityId } = req.body;

      const result = await AuthService.registerUser(facilityId, email, password, firstName, lastName);

      const response: APIResponse = {
        success: true,
        data: {
          user: result.user,
          verificationToken: result.verificationToken,
          message: "Registration successful. Please verify your email.",
        },
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Login user
router.post(
  "/login",
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      console.log("[Login] Attempting login for:", email);

      const result = await AuthService.login(email, password);
      console.log("[Login] Success for:", email);

      res.cookie("refreshToken", result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      const response: APIResponse = {
        success: true,
        data: {
          user: result.user,
          tokens: result.tokens,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("[Login] Error:", error);
      next(error);
    }
  }
);

// Debug endpoint to check database status (remove in production)
router.get("/debug/status", async (_req: Request, res: Response) => {
  try {
    const status = await AuthService.getDebugStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    res.json({ success: false, error: String(error) });
  }
});

// Global admin login
router.post(
  "/admin/login",
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const result = await AuthService.loginGlobalAdmin(email, password);

      res.cookie("refreshToken", result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const response: APIResponse = {
        success: true,
        data: {
          admin: result.admin,
          tokens: result.tokens,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Refresh token
router.post(
  "/refresh",
  validate(refreshTokenSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;

      const tokens = await AuthService.refreshToken(refreshToken);

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const response: APIResponse = {
        success: true,
        data: { tokens },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Logout
router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("refreshToken");

  const response: APIResponse = {
    success: true,
    data: { message: "Logged out successfully" },
  };

  res.json(response);
});

// Forgot password
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, facilityId } = req.body;

      const resetToken = await AuthService.forgotPassword(facilityId, email);

      const response: APIResponse = {
        success: true,
        data: {
          resetToken,
          message: "If an account exists with this email, a reset link has been sent.",
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Reset password
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, password, facilityId } = req.body;

      await AuthService.resetPassword(facilityId, token, password);

      const response: APIResponse = {
        success: true,
        data: {
          message: "Password has been reset successfully",
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Verify email
router.post(
  "/verify-email",
  validate(verifyEmailSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, facilityId } = req.body;

      await AuthService.verifyEmail(facilityId, token);

      const response: APIResponse = {
        success: true,
        data: {
          message: "Email verified successfully",
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Resend verification email
router.post(
  "/resend-verification",
  validate(resendVerificationSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, facilityId } = req.body;

      const verificationToken = await AuthService.resendVerificationEmail(facilityId, email);

      const response: APIResponse = {
        success: true,
        data: {
          verificationToken,
          message: "Verification email has been sent",
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Validate token
router.post(
  "/validate",
  optionalAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError("No valid token provided", "NO_TOKEN", 401);
      }

      const response: APIResponse = {
        success: true,
        data: {
          user: req.user,
          expiresIn: AuthService.getTokenExpiryTime(),
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
