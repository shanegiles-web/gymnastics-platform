import { Router, Request, Response, NextFunction } from "express";
import { authenticate, validateTenant } from "../middleware/auth.js";
import { APIResponse } from "../types/index.js";
import { getDb } from "../db/index.js";
import { students } from "../db/schema/students.js";
import { eq, and, isNull } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const router = Router();

router.use(authenticate);
router.use(validateTenant);

// List all students
router.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const db = getDb();

      const allStudents = await db
        .select()
        .from(students)
        .where(
          and(
            eq(students.facilityId, facilityId),
            isNull(students.deletedAt)
          )
        );

      // Transform to match client interface
      const transformed = allStudents.map((s) => ({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        age: s.dateOfBirth ? calculateAge(s.dateOfBirth) : 0,
        familyId: s.familyId,
        skillLevel: s.skillLevel || "beginner",
        status: s.enrollmentStatus || "active",
      }));

      const response: APIResponse = {
        success: true,
        data: transformed,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Get single student
router.get(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { id } = req.params;
      const db = getDb();

      const student = await db
        .select()
        .from(students)
        .where(
          and(
            eq(students.facilityId, facilityId),
            eq(students.id, id),
            isNull(students.deletedAt)
          )
        )
        .limit(1);

      if (!student.length) {
        const response: APIResponse = {
          success: false,
          error: { code: "NOT_FOUND", message: "Student not found" },
        };
        return res.status(404).json(response);
      }

      const s = student[0];
      const response: APIResponse = {
        success: true,
        data: {
          id: s.id,
          name: `${s.firstName} ${s.lastName}`,
          firstName: s.firstName,
          lastName: s.lastName,
          age: s.dateOfBirth ? calculateAge(s.dateOfBirth) : 0,
          dateOfBirth: s.dateOfBirth,
          familyId: s.familyId,
          skillLevel: s.skillLevel || "beginner",
          status: s.enrollmentStatus || "active",
          gender: s.gender,
          allergies: s.allergies,
          notes: s.notes,
        },
      };

      res.json(response);
      return;
    } catch (error) {
      next(error);
      return;
    }
  }
);

// Create student
router.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const db = getDb();
      const { name, familyId, skillLevel, dateOfBirth, gender } = req.body;

      // Parse name into first/last
      const nameParts = (name || "").split(" ");
      const firstName = nameParts[0] || "Unknown";
      const lastName = nameParts.slice(1).join(" ") || firstName;

      const newStudent = await db
        .insert(students)
        .values({
          id: uuidv4(),
          facilityId,
          familyId,
          firstName,
          lastName,
          dateOfBirth: dateOfBirth || new Date().toISOString().split("T")[0],
          gender: gender || "other",
          skillLevel: skillLevel || "beginner",
          enrollmentStatus: "active",
        })
        .returning();

      const s = newStudent[0];
      const response: APIResponse = {
        success: true,
        data: {
          id: s.id,
          name: `${s.firstName} ${s.lastName}`,
          age: s.dateOfBirth ? calculateAge(s.dateOfBirth) : 0,
          familyId: s.familyId,
          skillLevel: s.skillLevel || "beginner",
          status: s.enrollmentStatus || "active",
        },
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Update student
router.put(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { id } = req.params;
      const db = getDb();
      const { name, skillLevel, status } = req.body;

      // Parse name if provided
      let updateData: any = { updatedAt: new Date() };
      if (name) {
        const nameParts = name.split(" ");
        updateData.firstName = nameParts[0];
        updateData.lastName = nameParts.slice(1).join(" ") || nameParts[0];
      }
      if (skillLevel) updateData.skillLevel = skillLevel;
      if (status) updateData.enrollmentStatus = status;

      const updated = await db
        .update(students)
        .set(updateData)
        .where(
          and(
            eq(students.facilityId, facilityId),
            eq(students.id, id),
            isNull(students.deletedAt)
          )
        )
        .returning();

      if (!updated.length) {
        const response: APIResponse = {
          success: false,
          error: { code: "NOT_FOUND", message: "Student not found" },
        };
        return res.status(404).json(response);
      }

      const s = updated[0];
      const response: APIResponse = {
        success: true,
        data: {
          id: s.id,
          name: `${s.firstName} ${s.lastName}`,
          age: s.dateOfBirth ? calculateAge(s.dateOfBirth) : 0,
          familyId: s.familyId,
          skillLevel: s.skillLevel || "beginner",
          status: s.enrollmentStatus || "active",
        },
      };

      res.json(response);
      return;
    } catch (error) {
      next(error);
      return;
    }
  }
);

// Delete student (soft delete)
router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { id } = req.params;
      const db = getDb();

      const deleted = await db
        .update(students)
        .set({ deletedAt: new Date() })
        .where(
          and(
            eq(students.facilityId, facilityId),
            eq(students.id, id),
            isNull(students.deletedAt)
          )
        )
        .returning();

      if (!deleted.length) {
        const response: APIResponse = {
          success: false,
          error: { code: "NOT_FOUND", message: "Student not found" },
        };
        return res.status(404).json(response);
      }

      const response: APIResponse = {
        success: true,
        data: { message: "Student deleted successfully" },
      };

      res.json(response);
      return;
    } catch (error) {
      next(error);
      return;
    }
  }
);

// Helper function to calculate age from date of birth
function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export default router;
