import { Router, Request, Response, NextFunction } from "express";
import { ClassService } from "../services/class.service.js";
import { validate } from "../middleware/validate.js";
import { authenticate, authorize, validateTenant } from "../middleware/auth.js";
import {
  paginationSchema,
  createClassSchema,
  updateClassSchema,
  createScheduleSchema,
  enrollmentSchema,
} from "../utils/validators.js";
import { APIResponse } from "../types/index.js";

const router = Router();

router.use(authenticate);
router.use(validateTenant);

// Classes

// Create class
router.post(
  "/",
  authorize("admin", "manager"),
  validate(createClassSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const classEntity = await ClassService.createClass(facilityId, req.body);

      const response: APIResponse = {
        success: true,
        data: classEntity,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Get class
router.get(
  "/:classId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { classId } = req.params;

      const classEntity = await ClassService.getClass(facilityId, classId);

      const response: APIResponse = {
        success: true,
        data: classEntity,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Update class
router.patch(
  "/:classId",
  authorize("admin", "manager"),
  validate(updateClassSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { classId } = req.params;

      const classEntity = await ClassService.updateClass(facilityId, classId, req.body);

      const response: APIResponse = {
        success: true,
        data: classEntity,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Delete class
router.delete(
  "/:classId",
  authorize("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { classId } = req.params;

      await ClassService.deleteClass(facilityId, classId);

      const response: APIResponse = {
        success: true,
        data: { message: "Class deleted successfully" },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// List classes
router.get(
  "/",
  validate(paginationSchema, "query"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { page, limit } = req.query as any;

      const result = await ClassService.listClasses(facilityId, page, limit);

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

// Schedules

// Add schedule to class
router.post(
  "/:classId/schedules",
  authorize("admin", "manager"),
  validate(createScheduleSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { classId } = req.params;

      const schedule = await ClassService.addSchedule(facilityId, classId, req.body);

      const response: APIResponse = {
        success: true,
        data: schedule,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Get schedules for class
router.get(
  "/:classId/schedules",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { classId } = req.params;

      const schedules = await ClassService.getSchedulesForClass(classId);

      const response: APIResponse = {
        success: true,
        data: schedules,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Generate class instances
router.post(
  "/:classId/generate-instances",
  authorize("admin", "manager"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { classId } = req.params;
      const { startDate, endDate } = req.body;

      await ClassService.generateClassInstances(facilityId, classId, new Date(startDate), new Date(endDate));

      const response: APIResponse = {
        success: true,
        data: { message: "Class instances generated successfully" },
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Enrollments

// Enroll student in class
router.post(
  "/:classId/enrollments",
  validate(enrollmentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { classId } = req.params;
      const { studentId, startDate, endDate } = req.body;

      const enrollment = await ClassService.enrollStudent(
        facilityId,
        classId,
        studentId,
        new Date(startDate),
        endDate ? new Date(endDate) : undefined
      );

      const response: APIResponse = {
        success: true,
        data: enrollment,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Unenroll student from class
router.delete(
  "/:classId/enrollments/:studentId",
  authorize("admin", "manager"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { classId, studentId } = req.params;

      await ClassService.unenrollStudent(facilityId, classId, studentId);

      const response: APIResponse = {
        success: true,
        data: { message: "Student unenrolled successfully" },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Get class enrollments
router.get(
  "/:classId/enrollments",
  validate(paginationSchema, "query"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { classId } = req.params;
      const { page, limit } = req.query as any;

      const result = await ClassService.getClassEnrollments(facilityId, classId, page, limit);

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

// Templates

// Create class template
router.post(
  "/templates",
  authorize("admin", "manager"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const template = await ClassService.createClassTemplate(facilityId, req.body);

      const response: APIResponse = {
        success: true,
        data: template,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Apply class template
router.post(
  "/templates/:templateId/apply",
  authorize("admin", "manager"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { templateId } = req.params;

      const newClass = await ClassService.applyClassTemplate(facilityId, templateId, req.body);

      const response: APIResponse = {
        success: true,
        data: newClass,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Schedule exceptions

// Add schedule exception
router.post(
  "/:classId/schedule-exceptions",
  authorize("admin", "manager"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { classScheduleId, exceptionDate, reason, isCancelled } = req.body;

      await ClassService.addScheduleException(classScheduleId, new Date(exceptionDate), reason, isCancelled);

      const response: APIResponse = {
        success: true,
        data: { message: "Schedule exception added" },
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
