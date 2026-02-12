import { Router, Request, Response, NextFunction } from "express";
import { TimeclockService } from "../services/timeclock.service.js";
import { validate } from "../middleware/validate.js";
import { authenticate, authorize, validateTenant } from "../middleware/auth.js";
import { paginationSchema, clockInSchema, clockOutSchema } from "../utils/validators.js";
import { APIResponse } from "../types/index.js";
import { z } from "zod";

const router = Router();

router.use(authenticate);
router.use(validateTenant);

// Clock in
router.post(
  "/clock-in",
  validate(clockInSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const userId = req.user!.id;
      const { latitude, longitude } = req.body;

      const record = await TimeclockService.clockIn(facilityId, userId, latitude, longitude);

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

// Clock out
router.post(
  "/clock-out",
  validate(clockOutSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const userId = req.user!.id;
      const { latitude, longitude } = req.body;

      const record = await TimeclockService.clockOut(facilityId, userId, latitude, longitude);

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

// Get time record
router.get(
  "/records/:recordId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { recordId } = req.params;

      const record = await TimeclockService.getTimeRecord(facilityId, recordId);

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

// Get user time records
router.get(
  "/user/:userId",
  validate(paginationSchema, "query"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { userId } = req.params;
      const { page, limit } = req.query as any;

      const result = await TimeclockService.getUserTimeRecords(facilityId, userId, page, limit);

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

// Get facility time records
router.get(
  "/",
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
      const { startDate, endDate, page, limit } = req.query as any;

      const result = await TimeclockService.getFacilityTimeRecords(
        facilityId,
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

// Approve time record
router.post(
  "/records/:recordId/approve",
  authorize("admin", "manager"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { recordId } = req.params;
      const { approvalNotes } = req.body;

      const record = await TimeclockService.approveTimeRecord(facilityId, recordId, approvalNotes);

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

// Reject time record
router.post(
  "/records/:recordId/reject",
  authorize("admin", "manager"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { recordId } = req.params;
      const { reason } = req.body;

      const record = await TimeclockService.rejectTimeRecord(facilityId, recordId, reason);

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

// Export payroll CSV
router.get(
  "/export/payroll",
  authorize("admin", "manager"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { startDate, endDate } = req.query;

      const csv = await TimeclockService.exportPayrollCSV(
        facilityId,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="payroll-${Date.now()}.csv"`);
      res.send(csv);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
