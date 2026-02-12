import { Router, Request, Response, NextFunction } from "express";
import { FamilyService } from "../services/family.service.js";
import { validate } from "../middleware/validate.js";
import { authenticate, authorize, validateTenant } from "../middleware/auth.js";
import { paginationSchema, createFamilySchema, updateFamilySchema, createStudentSchema, updateStudentSchema } from "../utils/validators.js";
import { APIResponse } from "../types/index.js";

const router = Router();

router.use(authenticate);
router.use(validateTenant);

// Families

// Create family
router.post(
  "/",
  authorize("admin", "manager"),
  validate(createFamilySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const family = await FamilyService.createFamily(facilityId, req.body);

      const response: APIResponse = {
        success: true,
        data: family,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Get family
router.get(
  "/:familyId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { familyId } = req.params;

      const family = await FamilyService.getFamily(facilityId, familyId);

      const response: APIResponse = {
        success: true,
        data: family,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Update family
router.patch(
  "/:familyId",
  authorize("admin", "manager"),
  validate(updateFamilySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { familyId } = req.params;

      const family = await FamilyService.updateFamily(facilityId, familyId, req.body);

      const response: APIResponse = {
        success: true,
        data: family,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Delete family
router.delete(
  "/:familyId",
  authorize("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { familyId } = req.params;

      await FamilyService.deleteFamily(facilityId, familyId);

      const response: APIResponse = {
        success: true,
        data: { message: "Family deleted successfully" },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// List families
router.get(
  "/",
  validate(paginationSchema, "query"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { page, limit } = req.query as any;

      const result = await FamilyService.listFamilies(facilityId, page, limit);

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

// Students

// Create student
router.post(
  "/:familyId/students",
  validate(createStudentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { familyId } = req.params;

      const student = await FamilyService.createStudent(facilityId, familyId, req.body);

      const response: APIResponse = {
        success: true,
        data: student,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Get student
router.get(
  "/:familyId/students/:studentId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { studentId } = req.params;

      const student = await FamilyService.getStudent(facilityId, studentId);

      const response: APIResponse = {
        success: true,
        data: student,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Update student
router.patch(
  "/:familyId/students/:studentId",
  validate(updateStudentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { studentId } = req.params;

      const student = await FamilyService.updateStudent(facilityId, studentId, req.body);

      const response: APIResponse = {
        success: true,
        data: student,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Delete student
router.delete(
  "/:familyId/students/:studentId",
  authorize("admin", "manager"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { studentId } = req.params;

      await FamilyService.deleteStudent(facilityId, studentId);

      const response: APIResponse = {
        success: true,
        data: { message: "Student deleted successfully" },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// List students by family
router.get(
  "/:familyId/students",
  validate(paginationSchema, "query"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { familyId } = req.params;
      const { page, limit } = req.query as any;

      const result = await FamilyService.listStudentsByFamily(facilityId, familyId, page, limit);

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

// COPPA Consent

// Record COPPA consent
router.post(
  "/:familyId/coppa-consent",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { familyId } = req.params;
      const { consentGiven } = req.body;

      await FamilyService.recordCOPPAConsent(
        facilityId,
        familyId,
        req.user!.id,
        consentGiven,
        req.ip || "unknown",
        req.get("user-agent") || "unknown"
      );

      const response: APIResponse = {
        success: true,
        data: { message: "COPPA consent recorded" },
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Get COPPA consent
router.get(
  "/:familyId/coppa-consent",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { familyId } = req.params;

      const consent = await FamilyService.getCOPPAConsent(facilityId, familyId);

      const response: APIResponse = {
        success: true,
        data: consent || null,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
