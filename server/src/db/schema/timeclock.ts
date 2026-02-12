import { pgTable, uuid, varchar, timestamp, numeric, text, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { facilities } from "./shared.js";
import { users } from "./users.js";

export const timeRecords = pgTable("time_records", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  facilityId: uuid("facility_id")
    .notNull()
    .references(() => facilities.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  clockInTime: timestamp("clock_in_time").notNull(),
  clockOutTime: timestamp("clock_out_time"),
  latitude: numeric("latitude", { precision: 10, scale: 8 }),
  longitude: numeric("longitude", { precision: 11, scale: 8 }),
  checkInLocation: varchar("check_in_location", { length: 255 }),
  checkOutLocation: varchar("check_out_location", { length: 255 }),
  isApproved: boolean("is_approved").default(false),
  approvedBy: uuid("approved_by").references(() => users.id),
  approvalNotes: text("approval_notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
  deletedAt: timestamp("deleted_at"),
});
