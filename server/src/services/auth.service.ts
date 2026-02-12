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

  static async runSetup(): Promise<void> {
    const db = getDb();
    const { sql } = await import("drizzle-orm");

    // Create facilities table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS facilities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200) NOT NULL,
        domain VARCHAR(255) NOT NULL UNIQUE,
        logo_url VARCHAR(500),
        address_line_1 VARCHAR(255) NOT NULL,
        address_line_2 VARCHAR(255),
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        postal_code VARCHAR(20) NOT NULL,
        country VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255) NOT NULL,
        time_zone VARCHAR(50) DEFAULT 'America/New_York',
        geofence_latitude NUMERIC,
        geofence_longitude NUMERIC,
        geofence_radius NUMERIC,
        subscription_plan_id UUID,
        stripe_customer_id VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        deleted_at TIMESTAMP
      )
    `);

    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'parent',
        phone VARCHAR(20),
        profile_image_url VARCHAR(500),
        email_verified_at TIMESTAMP,
        verification_token_hash VARCHAR(255),
        reset_token_hash VARCHAR(255),
        reset_token_expires TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        deleted_at TIMESTAMP,
        UNIQUE(facility_id, email)
      )
    `);

    // Create families table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS families (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
        head_of_household VARCHAR(200) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        address_line_1 VARCHAR(255),
        address_line_2 VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(100),
        postal_code VARCHAR(20),
        country VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        deleted_at TIMESTAMP
      )
    `);

    // Create students table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS students (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
        family_id UUID REFERENCES families(id) ON DELETE SET NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        date_of_birth VARCHAR(20),
        gender VARCHAR(20),
        skill_level VARCHAR(50) DEFAULT 'beginner',
        enrollment_status VARCHAR(50) DEFAULT 'active',
        waiver_status VARCHAR(50) DEFAULT 'pending',
        allergies TEXT,
        medical_info TEXT,
        notes TEXT,
        photo_url VARCHAR(500),
        emergency_contacts JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        deleted_at TIMESTAMP
      )
    `);

    // Create classes table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS classes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        skill_level VARCHAR(50),
        max_capacity INTEGER,
        min_age_months INTEGER,
        max_age_months INTEGER,
        coach_ids JSONB DEFAULT '[]'::jsonb,
        price_per_month NUMERIC(10, 2),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        deleted_at TIMESTAMP
      )
    `);

    // Create enrollments table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enrollments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        enrollment_date TIMESTAMP DEFAULT now(),
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        status VARCHAR(50) DEFAULT 'active',
        position INTEGER DEFAULT 1,
        is_waitlisted BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        UNIQUE(class_id, student_id)
      )
    `);

    // Create global_admins table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS global_admins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email_verified_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        deleted_at TIMESTAMP
      )
    `);
  }

  static async runSeed(): Promise<void> {
    const db = getDb();
    const bcryptModule = await import("bcryptjs");
    const { v4: uuidv4 } = await import("uuid");
    const { facilities } = await import("../db/schema/shared.js");
    const { families } = await import("../db/schema/families.js");
    const { students } = await import("../db/schema/students.js");
    const { classes, enrollments } = await import("../db/schema/classes.js");

    const SALT_ROUNDS = 10;

    // Generate UUIDs
    const facilityId = uuidv4();
    const adminUserId = uuidv4();
    const coachUserId = uuidv4();
    const parentUserId = uuidv4();
    const family1Id = uuidv4();
    const student1Id = uuidv4();
    const class1Id = uuidv4();

    // Hash passwords
    const adminPasswordHash = await bcryptModule.default.hash("Admin123!", SALT_ROUNDS);
    const coachPasswordHash = await bcryptModule.default.hash("Coach123!", SALT_ROUNDS);
    const parentPasswordHash = await bcryptModule.default.hash("Parent123!", SALT_ROUNDS);

    // Create demo facility
    await db.insert(facilities).values({
      id: facilityId,
      name: "Elite Gymnastics Academy",
      domain: "elite-gymnastics",
      addressLine1: "123 Gymnastics Way",
      city: "Springfield",
      state: "IL",
      postalCode: "62701",
      country: "USA",
      phone: "(555) 123-4567",
      email: "info@elitegymnastics.demo",
      timeZone: "America/Chicago",
      isActive: true,
    });

    // Create users
    await db.insert(users).values([
      {
        id: adminUserId,
        facilityId,
        email: "admin@demo.com",
        passwordHash: adminPasswordHash,
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        emailVerifiedAt: new Date(),
        isActive: true,
      },
      {
        id: coachUserId,
        facilityId,
        email: "coach@demo.com",
        passwordHash: coachPasswordHash,
        firstName: "Coach",
        lastName: "Smith",
        role: "coach",
        emailVerifiedAt: new Date(),
        isActive: true,
      },
      {
        id: parentUserId,
        facilityId,
        email: "parent@demo.com",
        passwordHash: parentPasswordHash,
        firstName: "Parent",
        lastName: "Johnson",
        role: "parent",
        emailVerifiedAt: new Date(),
        isActive: true,
      },
    ]);

    // Create family
    await db.insert(families).values({
      id: family1Id,
      facilityId,
      headOfHousehold: "Parent Johnson",
      email: "parent@demo.com",
      phone: "(555) 111-1111",
      addressLine1: "100 Oak Street",
      city: "Springfield",
      state: "IL",
      postalCode: "62701",
      country: "USA",
    });

    // Create student
    await db.insert(students).values({
      id: student1Id,
      facilityId,
      familyId: family1Id,
      firstName: "Emma",
      lastName: "Johnson",
      dateOfBirth: "2016-03-15",
      gender: "female",
      skillLevel: "intermediate",
      enrollmentStatus: "active",
      waiverStatus: "signed",
    });

    // Create class
    await db.insert(classes).values({
      id: class1Id,
      facilityId,
      name: "Beginner Tumbling",
      description: "Introduction to basic tumbling skills.",
      skillLevel: "beginner",
      maxCapacity: 12,
      minAgeMonths: 48,
      maxAgeMonths: 96,
      coachIds: JSON.stringify([coachUserId]),
      pricePerMonth: "85.00",
    });

    // Create enrollment
    await db.insert(enrollments).values({
      classId: class1Id,
      studentId: student1Id,
      enrollmentDate: new Date(),
      startDate: new Date(),
      status: "active",
      position: 1,
      isWaitlisted: false,
    });
  }
}
