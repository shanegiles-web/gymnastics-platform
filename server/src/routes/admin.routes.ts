import { Router, Request, Response, NextFunction } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { getDb } from "../db/index.js";
import {
  facilities,
  subscriptionPlans,
} from "../db/schema/shared.js";
import { users } from "../db/schema/users.js";
import { families } from "../db/schema/families.js";
import { students } from "../db/schema/students.js";
import { classes } from "../db/schema/classes.js";
import { enrollments } from "../db/schema/classes.js";
import { invoices } from "../db/schema/billing.js";
import { createSubscriptionPlanSchema, createFacilitySchema } from "../utils/validators.js";
import { APIResponse, PaginatedResponse } from "../types/index.js";
import { eq, isNull, and, desc, count, sum } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

const router = Router();

router.use(authenticate);
router.use(authorize("global_admin"));

// Subscription Plans

// Create subscription plan
router.post(
  "/subscription-plans",
  validate(createSubscriptionPlanSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const db = getDb();
      const { name, description, pricePerMonth, maxClasses, maxUsers, maxStudents, features } = req.body;

      const plan = await db
        .insert(subscriptionPlans)
        .values({
          name,
          description,
          pricePerMonth: pricePerMonth.toString(),
          maxClasses: maxClasses.toString(),
          maxUsers: maxUsers.toString(),
          maxStudents: (maxStudents || 100).toString(),
          features: features as unknown,
          isActive: true,
        })
        .returning();

      const response: APIResponse = {
        success: true,
        data: plan[0],
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Get subscription plan
router.get(
  "/subscription-plans/:planId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const db = getDb();
      const { planId } = req.params;

      const plan = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, planId))
        .limit(1);

      if (!plan || plan.length === 0) {
        res.status(404).json({
          success: false,
          error: {
            code: "PLAN_NOT_FOUND",
            message: "Subscription plan not found",
          },
        });
        return;
      }

      const response: APIResponse = {
        success: true,
        data: plan[0],
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// List subscription plans
router.get(
  "/subscription-plans",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const db = getDb();

      const plans = await db.select().from(subscriptionPlans).where(isNull(subscriptionPlans.deletedAt));

      const response: APIResponse = {
        success: true,
        data: plans,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Facilities

// Create facility
router.post(
  "/facilities",
  validate(createFacilitySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const db = getDb();
      const {
        name,
        domain,
        adminEmail,
        adminPassword,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        phone,
        subscriptionPlanId,
      } = req.body;

      // Create facility
      const facilityId = uuidv4();
      const facility = await db
        .insert(facilities)
        .values({
          id: facilityId,
          name,
          domain: domain.toLowerCase(),
          addressLine1,
          addressLine2,
          city,
          state,
          postalCode,
          country,
          phone,
          email: adminEmail,
          subscriptionPlanId,
        })
        .returning();

      // Create admin user
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      const admin = await db
        .insert(users)
        .values({
          id: uuidv4(),
          facilityId,
          email: adminEmail.toLowerCase(),
          passwordHash,
          firstName: "Admin",
          lastName: "User",
          role: "admin",
          isActive: true,
          emailVerifiedAt: new Date(),
        })
        .returning();

      const response: APIResponse = {
        success: true,
        data: {
          facility: facility[0],
          admin: {
            id: admin[0].id,
            email: admin[0].email,
            firstName: admin[0].firstName,
            lastName: admin[0].lastName,
            role: admin[0].role,
          },
        },
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Get facility
router.get(
  "/facilities/:facilityId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const db = getDb();
      const { facilityId } = req.params;

      const facility = await db
        .select()
        .from(facilities)
        .where(eq(facilities.id, facilityId))
        .limit(1);

      if (!facility || facility.length === 0) {
        res.status(404).json({
          success: false,
          error: {
            code: "FACILITY_NOT_FOUND",
            message: "Facility not found",
          },
        });
        return;
      }

      const response: APIResponse = {
        success: true,
        data: facility[0],
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// List facilities
router.get(
  "/facilities",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const db = getDb();
      const page = parseInt((req.query.page as string) || "1");
      const limit = parseInt((req.query.limit as string) || "20");
      const offset = (page - 1) * limit;

      const [items, countResult] = await Promise.all([
        db
          .select()
          .from(facilities)
          .where(isNull(facilities.deletedAt))
          .orderBy(desc(facilities.createdAt))
          .limit(limit)
          .offset(offset),
        db.select({ count: count() }).from(facilities).where(isNull(facilities.deletedAt)),
      ]);

      const total = Number(countResult[0]?.count || 0);

      const result: PaginatedResponse<typeof items[0]> = {
        items,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      };

      const response: APIResponse = {
        success: true,
        data: result,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Analytics Dashboard

// Get facility analytics
router.get(
  "/analytics/facility/:facilityId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const db = getDb();
      const { facilityId } = req.params;

      // Get counts
      const [usersCount, familiesCount, studentsCount, classesCount, enrollmentsCount, revenueResult] = await Promise.all([
        db.select({ count: count() }).from(users).where(and(eq(users.facilityId, facilityId), isNull(users.deletedAt))),
        db.select({ count: count() }).from(families).where(and(eq(families.facilityId, facilityId), isNull(families.deletedAt))),
        db.select({ count: count() }).from(students).where(and(eq(students.facilityId, facilityId), isNull(students.deletedAt))),
        db.select({ count: count() }).from(classes).where(and(eq(classes.facilityId, facilityId), isNull(classes.deletedAt))),
        db.select({ count: count() }).from(enrollments).where(isNull(enrollments.deletedAt)),
        db.select({ total: sum(invoices.amount) }).from(invoices).where(
          and(
            eq(invoices.facilityId, facilityId),
            eq(invoices.status, "paid"),
            isNull(invoices.deletedAt)
          )
        ),
      ]);

      const analytics = {
        users: Number(usersCount[0]?.count || 0),
        families: Number(familiesCount[0]?.count || 0),
        students: Number(studentsCount[0]?.count || 0),
        classes: Number(classesCount[0]?.count || 0),
        enrollments: Number(enrollmentsCount[0]?.count || 0),
        revenue: Number(revenueResult[0]?.total || 0),
      };

      const response: APIResponse = {
        success: true,
        data: analytics,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Get global analytics
router.get(
  "/analytics/global",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const db = getDb();

      const [facilitiesCount, usersCount, studentsCount, revenueResult] = await Promise.all([
        db.select({ count: count() }).from(facilities).where(isNull(facilities.deletedAt)),
        db.select({ count: count() }).from(users).where(isNull(users.deletedAt)),
        db.select({ count: count() }).from(students).where(isNull(students.deletedAt)),
        db.select({ total: sum(invoices.amount) }).from(invoices).where(and(eq(invoices.status, "paid"), isNull(invoices.deletedAt))),
      ]);

      const analytics = {
        facilities: Number(facilitiesCount[0]?.count || 0),
        users: Number(usersCount[0]?.count || 0),
        students: Number(studentsCount[0]?.count || 0),
        totalRevenue: Number(revenueResult[0]?.total || 0),
      };

      const response: APIResponse = {
        success: true,
        data: analytics,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
