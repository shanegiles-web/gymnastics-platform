import { Router, Request, Response, NextFunction } from "express";
import { authenticate, validateTenant } from "../middleware/auth.js";
import { APIResponse } from "../types/index.js";
import { getDb } from "../db/index.js";
import { students } from "../db/schema/students.js";
import { classes } from "../db/schema/classes.js";
import { eq, and, isNull, sql } from "drizzle-orm";

const router = Router();

router.use(authenticate);
router.use(validateTenant);

// Get dashboard metrics
router.get(
  "/metrics",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const db = getDb();

      // Count active students
      const studentCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(students)
        .where(
          and(
            eq(students.facilityId, facilityId),
            isNull(students.deletedAt),
            eq(students.enrollmentStatus, "active")
          )
        );

      // Count active classes
      const classCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(classes)
        .where(
          and(
            eq(classes.facilityId, facilityId),
            isNull(classes.deletedAt)
          )
        );

      const response: APIResponse = {
        success: true,
        data: {
          revenue: 12500, // Placeholder - would calculate from invoices
          activeStudents: Number(studentCount[0]?.count || 0),
          attendanceRate: 94, // Placeholder - would calculate from attendance records
          upcomingEvents: Number(classCount[0]?.count || 0),
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Get dashboard activity
router.get(
  "/activity",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // Return mock activity for now - would query actual activity logs
      const response: APIResponse = {
        success: true,
        data: [
          {
            id: "1",
            type: "enrollment",
            message: "Emma Johnson enrolled in Beginner Tumbling",
            timestamp: new Date().toISOString(),
          },
          {
            id: "2",
            type: "payment",
            message: "Payment received from Johnson family",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: "3",
            type: "attendance",
            message: "Class attendance recorded for Intermediate Bars",
            timestamp: new Date(Date.now() - 7200000).toISOString(),
          },
        ],
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
