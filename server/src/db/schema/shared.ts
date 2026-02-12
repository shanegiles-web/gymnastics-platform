import { pgTable, text, timestamp, boolean, numeric, uuid, varchar, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const facilities = pgTable("facilities", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  domain: varchar("domain", { length: 255 }).notNull().unique(),
  logoUrl: varchar("logo_url", { length: 500 }),
  addressLine1: varchar("address_line_1", { length: 255 }).notNull(),
  addressLine2: varchar("address_line_2", { length: 255 }),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  postalCode: varchar("postal_code", { length: 20 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  timeZone: varchar("time_zone", { length: 50 }).default("America/New_York"),
  geofenceLatitude: numeric("geofence_latitude"),
  geofenceLongitude: numeric("geofence_longitude"),
  geofenceRadius: numeric("geofence_radius"),
  subscriptionPlanId: uuid("subscription_plan_id"),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
  deletedAt: timestamp("deleted_at"),
});

export const facilityDomains = pgTable("facility_domains", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  facilityId: uuid("facility_id")
    .notNull()
    .references(() => facilities.id, { onDelete: "cascade" }),
  domain: varchar("domain", { length: 255 }).notNull().unique(),
  isVerified: boolean("is_verified").default(false),
  verificationToken: varchar("verification_token", { length: 255 }),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const subscriptionPlans = pgTable("subscription_plans", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  pricePerMonth: numeric("price_per_month", { precision: 10, scale: 2 }).notNull(),
  maxClasses: numeric("max_classes").notNull(),
  maxUsers: numeric("max_users").notNull(),
  maxStudents: numeric("max_students").notNull(),
  features: jsonb("features").default(sql`'[]'::jsonb`),
  stripePriceId: varchar("stripe_price_id", { length: 255 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
  deletedAt: timestamp("deleted_at"),
});

export const globalAdmins = pgTable("global_admins", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  emailVerifiedAt: timestamp("email_verified_at"),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
  deletedAt: timestamp("deleted_at"),
});
