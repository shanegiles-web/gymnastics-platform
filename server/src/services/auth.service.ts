import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { getDb } from "../db/index.js";
import { users } from "../db/schema/users.js";
import { globalAdmins } from "../db/schema/shared.js";
import { CONFIG } from "../config/index.js";
import { AppError } from "../middleware/error-handler.js";
import { eq, and } from "drizzle-orm";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  static async registerUser(
    facilityId: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: string = "student"
  ) {
    const db = getDb();

    const existingUser = await db
      .select()
      .from(users)
      .where(and(eq(users.facilityId, facilityId), eq(users.email, email)))
      .limit(1);

    if (existingUser.length > 0) {
      throw new AppError("User with this email already exists", "USER_EXISTS", 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4();
    const verificationTokenHash = crypto.createHash("sha256").update(verificationToken).digest("hex");

    const newUser = await db
      .insert(users)
      .values({
        id: uuidv4(),
        facilityId,
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        role: role as any,
        verificationTokenHash,
      })
      .returning();

    return {
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        firstName: newUser[0].firstName,
        lastName: newUser[0].lastName,
        role: newUser[0].role,
      },
      verificationToken,
    };
  }

  static async login(
    email: string,
    password: string
  ): Promise<{ user: any; tokens: TokenPair }> {
    const db = getDb();

    // Look up user by email only (for unified login)
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user || user.length === 0) {
      throw new AppError("Invalid email or password", "INVALID_CREDENTIALS", 401);
    }

    const userData = user[0];

    if (!userData.isActive) {
      throw new AppError("User account is inactive", "USER_INACTIVE", 403);
    }

    const passwordMatch = await bcrypt.compare(password, userData.passwordHash);
    if (!passwordMatch) {
      throw new AppError("Invalid email or password", "INVALID_CREDENTIALS", 401);
    }

    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, userData.id));

    const tokens = this.generateTokens(userData.id, userData.email, userData.facilityId, userData.role);

    return {
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        facilityId: userData.facilityId,
      },
      tokens,
    };
  }

  static async loginGlobalAdmin(email: string, password: string): Promise<{ admin: any; tokens: TokenPair }> {
    const db = getDb();

    const admin = await db.select().from(globalAdmins).where(eq(globalAdmins.email, email.toLowerCase())).limit(1);

    if (!admin || admin.length === 0) {
      throw new AppError("Invalid email or password", "INVALID_CREDENTIALS", 401);
    }

    const adminData = admin[0];

    if (!adminData.isActive) {
      throw new AppError("Admin account is inactive", "ADMIN_INACTIVE", 403);
    }

    const passwordMatch = await bcrypt.compare(password, adminData.passwordHash);
    if (!passwordMatch) {
      throw new AppError("Invalid email or password", "INVALID_CREDENTIALS", 401);
    }

    await db
      .update(globalAdmins)
      .set({ lastLogin: new Date() })
      .where(eq(globalAdmins.id, adminData.id));

    const tokens = this.generateTokens(adminData.id, adminData.email, "global", "global_admin");

    return {
      admin: {
        id: adminData.id,
        email: adminData.email,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        role: "global_admin",
      },
      tokens,
    };
  }

  static async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      const decoded = jwt.verify(refreshToken, CONFIG.JWT_REFRESH_SECRET) as any;

      const tokens = this.generateTokens(decoded.id, decoded.email, decoded.facilityId, decoded.role);
      return tokens;
    } catch (error) {
      throw new AppError("Invalid or expired refresh token", "INVALID_REFRESH_TOKEN", 401);
    }
  }

  static async forgotPassword(facilityId: string, email: string): Promise<string> {
    const db = getDb();

    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.facilityId, facilityId), eq(users.email, email.toLowerCase())))
      .limit(1);

    if (!user || user.length === 0) {
      // Don't reveal if email exists for security
      return "If an account exists with this email, a reset link has been sent.";
    }

    const resetToken = uuidv4();
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    const resetTokenExpires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await db
      .update(users)
      .set({
        resetTokenHash,
        resetTokenExpires,
      })
      .where(eq(users.id, user[0].id));

    return resetToken;
  }

  static async resetPassword(facilityId: string, token: string, newPassword: string) {
    const db = getDb();
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await db
      .select()
      .from(users)
      .where(
        and(eq(users.facilityId, facilityId), eq(users.resetTokenHash, tokenHash))
      )
      .limit(1);

    if (!user || user.length === 0) {
      throw new AppError("Invalid or expired reset token", "INVALID_RESET_TOKEN", 400);
    }

    if (user[0].resetTokenExpires && user[0].resetTokenExpires < new Date()) {
      throw new AppError("Reset token has expired", "RESET_TOKEN_EXPIRED", 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await db
      .update(users)
      .set({
        passwordHash,
        resetTokenHash: null,
        resetTokenExpires: null,
      })
      .where(eq(users.id, user[0].id));

    return { success: true };
  }

  static async verifyEmail(facilityId: string, token: string) {
    const db = getDb();
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.facilityId, facilityId), eq(users.verificationTokenHash, tokenHash)))
      .limit(1);

    if (!user || user.length === 0) {
      throw new AppError("Invalid or expired verification token", "INVALID_VERIFICATION_TOKEN", 400);
    }

    await db
      .update(users)
      .set({
        emailVerifiedAt: new Date(),
        verificationTokenHash: null,
      })
      .where(eq(users.id, user[0].id));

    return { success: true };
  }

  static async resendVerificationEmail(facilityId: string, email: string): Promise<string> {
    const db = getDb();

    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.facilityId, facilityId), eq(users.email, email.toLowerCase())))
      .limit(1);

    if (!user || user.length === 0) {
      throw new AppError("User not found", "USER_NOT_FOUND", 404);
    }

    if (user[0].emailVerifiedAt) {
      throw new AppError("Email is already verified", "EMAIL_ALREADY_VERIFIED", 400);
    }

    const verificationToken = uuidv4();
    const verificationTokenHash = crypto.createHash("sha256").update(verificationToken).digest("hex");

    await db
      .update(users)
      .set({ verificationTokenHash })
      .where(eq(users.id, user[0].id));

    return verificationToken;
  }

  static async validateToken(token: string): Promise<any> {
    try {
      return jwt.verify(token, CONFIG.JWT_SECRET);
    } catch {
      throw new AppError("Invalid token", "INVALID_TOKEN", 401);
    }
  }

  private static generateTokens(userId: string, email: string, facilityId: string, role: string): TokenPair {
    const payload = {
      id: userId,
      email,
      facilityId,
      role,
    };

    const accessToken = jwt.sign(payload, CONFIG.JWT_SECRET, {
      expiresIn: CONFIG.JWT_EXPIRY as string,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, CONFIG.JWT_REFRESH_SECRET, {
      expiresIn: CONFIG.JWT_REFRESH_EXPIRY as string,
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  }

  static getTokenExpiryTime(): string {
    return CONFIG.JWT_EXPIRY;
  }

  static async getDebugStatus(): Promise<{ userCount: number; facilityCount: number; emails: string[] }> {
    const db = getDb();
    const allUsers = await db.select({ email: users.email }).from(users).limit(10);
    const { facilities } = await import("../db/schema/shared.js");
    const allFacilities = await db.select({ id: facilities.id }).from(facilities).limit(10);
    return {
      userCount: allUsers.length,
      facilityCount: allFacilities.length,
      emails: allUsers.map(u => u.email),
    };
  }
}
