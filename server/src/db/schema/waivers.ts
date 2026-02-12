import { pgTable, uuid, varchar, text, timestamp, boolean, date } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { facilities } from "./shared.js";
import { students } from "./students.js";
import { users } from "./users.js";

export const waiverTemplates = pgTable("waiver_templates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  facilityId: uuid("facility_id")
    .notNull()
    .references(() => facilities.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  version: varchar("version", { length: 50 }).notNull(),
  content: text("content").notNull(),
  effectiveDate: date("effective_date").notNull(),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
  deletedAt: timestamp("deleted_at"),
});

export const signedWaivers = pgTable("signed_waivers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  facilityId: uuid("facility_id")
    .notNull()
    .references(() => facilities.id, { onDelete: "cascade" }),
  waiverTemplateId: uuid("waiver_template_id")
    .notNull()
    .references(() => waiverTemplates.id),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  parentGuardianId: uuid("parent_guardian_id")
    .notNull()
    .references(() => users.id),
  signature: text("signature").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  signedAt: timestamp("signed_at").notNull(),
  expiresAt: date("expires_at").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
  deletedAt: timestamp("deleted_at"),
});
