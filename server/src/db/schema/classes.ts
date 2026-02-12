import { pgTable, uuid, varchar, text, timestamp, integer, numeric, boolean, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { facilities } from "./shared.js";
import { students } from "./students.js";

export const classes = pgTable("classes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  facilityId: uuid("facility_id")
    .notNull()
    .references(() => facilities.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  skillLevel: varchar("skill_level", { length: 20 }).notNull(),
  maxCapacity: integer("max_capacity").notNull(),
  minAgeMonths: integer("min_age_months"),
  maxAgeMonths: integer("max_age_months"),
  coachIds: jsonb("coach_ids").default(sql`'[]'::jsonb`),
  pricePerMonth: numeric("price_per_month", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
  deletedAt: timestamp("deleted_at"),
});

export const classSchedules = pgTable("class_schedules", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  classId: uuid("class_id")
    .notNull()
    .references(() => classes.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: varchar("start_time", { length: 10 }).notNull(),
  endTime: varchar("end_time", { length: 10 }).notNull(),
  recurrenceRule: text("recurrence_rule").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
  deletedAt: timestamp("deleted_at"),
});

export const classInstances = pgTable("class_instances", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  classScheduleId: uuid("class_schedule_id")
    .notNull()
    .references(() => classSchedules.id, { onDelete: "cascade" }),
  startDateTime: timestamp("start_date_time").notNull(),
  endDateTime: timestamp("end_date_time").notNull(),
  actualStartDateTime: timestamp("actual_start_date_time"),
  actualEndDateTime: timestamp("actual_end_date_time"),
  status: varchar("status", { length: 20 }).default("scheduled"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
  deletedAt: timestamp("deleted_at"),
});

export const enrollments = pgTable("enrollments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  classId: uuid("class_id")
    .notNull()
    .references(() => classes.id, { onDelete: "cascade" }),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  enrollmentDate: timestamp("enrollment_date").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: varchar("status", { length: 20 }).default("active"),
  position: integer("position").notNull(),
  isWaitlisted: boolean("is_waitlisted").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
  deletedAt: timestamp("deleted_at"),
});

export const classTemplates = pgTable("class_templates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  facilityId: uuid("facility_id")
    .notNull()
    .references(() => facilities.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  schedules: jsonb("schedules").default(sql`'[]'::jsonb`),
  skillLevel: varchar("skill_level", { length: 20 }).notNull(),
  maxCapacity: integer("max_capacity").notNull(),
  coachIds: jsonb("coach_ids").default(sql`'[]'::jsonb`),
  pricePerMonth: numeric("price_per_month", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
  deletedAt: timestamp("deleted_at"),
});

export const scheduleExceptions = pgTable("schedule_exceptions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  classScheduleId: uuid("class_schedule_id")
    .notNull()
    .references(() => classSchedules.id, { onDelete: "cascade" }),
  exceptionDate: timestamp("exception_date").notNull(),
  reason: varchar("reason", { length: 200 }),
  isCancelled: boolean("is_cancelled").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});
