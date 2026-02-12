import { Router, Request, Response, NextFunction } from "express";
import { WaiverService } from "../services/waiver.service.js";
import { validate } from "../middleware/validate.js";
import { authenticate, authorize, validateTenant } from "../middleware/auth.js";
import { paginationSchema, createWaiverTemplateSchema, signWaiverSchema } from "../utils/validators.js";
import { APIResponse } from "../types/index.js";

const router = Router();

router.use(authenticate);
router.use(validateTenant);

// Templates

// Create waiver template
router.post(
  "/templates",
  authorize("admin", "manager"),
  validate(createWaiverTemplateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;

      const template = await WaiverService.createTemplate(facilityId, {
        name: req.body.name,
        version: req.body.version,
        content: req.body.content,
        effectiveDate: new Date(req.body.effectiveDate),
      });

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

// Get template
router.get(
  "/templates/:templateId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { templateId } = req.params;

      const template = await WaiverService.getTemplate(facilityId, templateId);

      const response: APIResponse = {
        success: true,
        data: template,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Get active template
router.get(
  "/templates/active",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;

      const template = await WaiverService.getActiveTemplate(facilityId);

      const response: APIResponse = {
        success: true,
        data: template,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Activate template
router.post(
  "/templates/:templateId/activate",
  authorize("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { templateId } = req.params;

      const template = await WaiverService.activateTemplate(facilityId, templateId);

      const response: APIResponse = {
        success: true,
        data: template,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// List templates
router.get(
  "/templates",
  validate(paginationSchema, "query"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { page, limit } = req.query as any;

      const result = await WaiverService.listTemplates(facilityId, page, limit);

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

// Signed Waivers

// Sign waiver
router.post(
  "/sign",
  validate(signWaiverSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { waiverTemplateId, studentId, signature } = req.body;

      const signedWaiver = await WaiverService.signWaiver(
        facilityId,
        waiverTemplateId,
        studentId,
        req.user!.id,
        signature,
        req.ip || "unknown",
        req.get("user-agent") || "unknown"
      );

      const response: APIResponse = {
        success: true,
        data: signedWaiver,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Get signed waiver
router.get(
  "/signed/:studentId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { studentId } = req.params;

      const waiver = await WaiverService.getSignedWaiver(facilityId, studentId);

      const response: APIResponse = {
        success: true,
        data: waiver,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Check waiver validity
router.get(
  "/validity/:studentId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { studentId } = req.params;

      const isValid = await WaiverService.isWaiverValid(facilityId, studentId);

      const response: APIResponse = {
        success: true,
        data: { isValid },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Get waiver status
router.get(
  "/status/:studentId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { studentId } = req.params;

      const status = await WaiverService.getWaiverStatus(facilityId, studentId);

      const response: APIResponse = {
        success: true,
        data: status,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Generate waiver PDF
router.post(
  "/pdf",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { templateContent, studentName, parentName } = req.body;

      const pdfBuffer = await WaiverService.generateWaiverPDF(templateContent, studentName, parentName);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="waiver-${Date.now()}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
