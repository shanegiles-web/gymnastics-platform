import { Router, Request, Response, NextFunction } from "express";
import { AttendanceService } from "../services/attendance.service.js";
import { validate } from "../middleware/validate.js";
import { authenticate, authorize, validateTenant } from "../middleware/auth.js";
import { paginationSchema, checkInSchema, checkOutSchema, markAbsentSchema } from "../utils/validators.js";
import { APIResponse } from "../types/index.js";
import { z } from "zod";

const router = Router();

router.use(authenticate);
router.use(validateTenant);

// Check in
router.post(
  "/check-in",
  validate(checkInSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { classInstanceId, studentId } = req.body;

      const record = await AttendanceService.checkIn(facilityId, classInstanceId, studentId);

      const response: APIResponse = {
        success: true,
        data: record,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Check out
router.post(
  "/check-out",
  validate(checkOutSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { classInstanceId, studentId } = req.body;

      const record = await AttendanceService.checkOut(facilityId, classInstanceId, studentId);

      const response: APIResponse = {
        success: true,
        data: record,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Mark attendance
router.post(
  "/mark",
  authorize("admin", "manager", "coach"),
  validate(markAbsentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { classInstanceId, studentId, status, notes } = req.body;

      const record = await AttendanceService.markAttendance(facilityId, classInstanceId, studentId, status, notes);

      const response: APIResponse = {
        success: true,
        data: record,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Get class attendance
router.get(
  "/class/:classInstanceId",
  validate(paginationSchema, "query"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { classInstanceId } = req.params;
      const { page, limit } = req.query as any;

      const result = await AttendanceService.getClassAttendance(facilityId, classInstanceId, page, limit);

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

// Get student attendance report
router.get(
  "/student/:studentId",
  validate(paginationSchema, "query"),
  validate(
    z.object({
      startDate: z.string().date(),
      endDate: z.string().date(),
    }),
    "query"
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { studentId } = req.params;
      const { startDate, endDate, page, limit } = req.query as any;

      const result = await AttendanceService.getStudentAttendanceReport(
        facilityId,
        studentId,
        new Date(startDate),
        new Date(endDate),
        page,
        limit
      );

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

// Get attendance stats
router.get(
  "/stats/:studentId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { studentId } = req.params;

      const stats = await AttendanceService.getAttendanceStats(facilityId, studentId);

      const response: APIResponse = {
        success: true,
        data: stats,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
