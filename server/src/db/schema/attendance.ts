import { pgTable, uuid, varchar, timestamp, text } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { facilities } from "./shared.js";
import { classInstances } from "./classes.js";
import { students } from "./students.js";

export const attendanceRecords = pgTable("attendance_records", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  facilityId: uuid("facility_id")
    .notNull()
    .references(() => facilities.id, { onDelete: "cascade" }),
  classInstanceId: uuid("class_instance_id")
    .notNull()
    .references(() => classInstances.id, { onDelete: "cascade" }),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 20 }).default("absent"),
  checkInTime: timestamp("check_in_time"),
  checkOutTime: timestamp("check_out_time"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
  deletedAt: timestamp("deleted_at"),
});
