import { pgTable, uuid, varchar, date, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { facilities } from "./shared.js";
import { families } from "./families.js";

export const students = pgTable("students", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  facilityId: uuid("facility_id")
    .notNull()
    .references(() => facilities.id, { onDelete: "cascade" }),
  familyId: uuid("family_id")
    .notNull()
    .references(() => families.id, { onDelete: "cascade" }),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  gender: varchar("gender", { length: 20 }).notNull(),
  skillLevel: varchar("skill_level", { length: 20 }).default("beginner"),
  enrollmentStatus: varchar("enrollment_status", { length: 20 }).default("active"),
  medicalInfoEncrypted: text("medical_info_encrypted"),
  emergencyContacts: jsonb("emergency_contacts").default(sql`'[]'::jsonb`),
  allergies: text("allergies"),
  notes: text("notes"),
  photoUrl: varchar("photo_url", { length: 500 }),
  waiverStatus: varchar("waiver_status", { length: 20 }).default("pending"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
  deletedAt: timestamp("deleted_at"),
});
