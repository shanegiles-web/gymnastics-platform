import { pgTable, uuid, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { facilities } from "./shared.js";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  facilityId: uuid("facility_id")
    .notNull()
    .references(() => facilities.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 255 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("student"),
  emailVerifiedAt: timestamp("email_verified_at"),
  resetTokenHash: varchar("reset_token_hash", { length: 255 }),
  resetTokenExpires: timestamp("reset_token_expires"),
  verificationTokenHash: varchar("verification_token_hash", { length: 255 }),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
  deletedAt: timestamp("deleted_at"),
});

// Unique constraint: email per facility
export const userEmailUniquePerFacility = sql`CREATE UNIQUE INDEX IF NOT EXISTS user_email_facility_idx ON users(facility_id, email) WHERE deleted_at IS NULL`;
