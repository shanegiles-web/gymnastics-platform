import { Router, Request, Response, NextFunction } from "express";
import { BillingService } from "../services/billing.service.js";
import { validate } from "../middleware/validate.js";
import { authenticate, authorize, validateTenant } from "../middleware/auth.js";
import {
  paginationSchema,
  createPaymentMethodSchema,
  createInvoiceSchema,
} from "../utils/validators.js";
import { APIResponse } from "../types/index.js";
import { z } from "zod";

const router = Router();

router.use(authenticate);
router.use(validateTenant);

// Payment Methods

// Create payment method
router.post(
  "/payment-methods",
  validate(createPaymentMethodSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { familyId } = req.body;

      const method = await BillingService.createPaymentMethod(facilityId, familyId, req.body);

      const response: APIResponse = {
        success: true,
        data: method,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Get payment methods
router.get(
  "/payment-methods/:familyId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { familyId } = req.params;

      const methods = await BillingService.getPaymentMethods(facilityId, familyId);

      const response: APIResponse = {
        success: true,
        data: methods,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Invoices

// Create invoice
router.post(
  "/invoices",
  authorize("admin", "manager"),
  validate(createInvoiceSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { familyId, dueDate, items, notes } = req.body;

      // Generate invoice number
      const invoiceNumber = `INV-${facilityId.substring(0, 8)}-${Date.now()}`;
      const amount = items.reduce((sum: number, item: any) => sum + item.quantity * item.unitPrice, 0);

      const invoice = await BillingService.createInvoice(facilityId, familyId, {
        invoiceNumber,
        amount,
        dueDate: new Date(dueDate),
        items,
        notes,
      });

      const response: APIResponse = {
        success: true,
        data: invoice,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Get invoice
router.get(
  "/invoices/:invoiceId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { invoiceId } = req.params;

      const invoice = await BillingService.getInvoice(facilityId, invoiceId);

      const response: APIResponse = {
        success: true,
        data: invoice,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Update invoice
router.patch(
  "/invoices/:invoiceId",
  authorize("admin", "manager"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { invoiceId } = req.params;

      const invoice = await BillingService.updateInvoice(facilityId, invoiceId, req.body);

      const response: APIResponse = {
        success: true,
        data: invoice,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// List invoices
router.get(
  "/invoices",
  validate(paginationSchema, "query"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { familyId } = req.query;
      const { page, limit } = req.query as any;

      const result = await BillingService.listInvoices(facilityId, familyId as string | undefined, page, limit);

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

// Send invoice
router.post(
  "/invoices/:invoiceId/send",
  authorize("admin", "manager"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { invoiceId } = req.params;

      const invoice = await BillingService.sendInvoice(facilityId, invoiceId);

      const response: APIResponse = {
        success: true,
        data: invoice,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Payments

// Process payment
router.post(
  "/payments",
  validate(
    z.object({
      invoiceId: z.string().uuid(),
      paymentMethodId: z.string().uuid(),
      amount: z.number().positive(),
    })
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { invoiceId, paymentMethodId, amount } = req.body;

      const payment = await BillingService.processPayment(facilityId, invoiceId, paymentMethodId, amount);

      const response: APIResponse = {
        success: true,
        data: payment,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Refund payment
router.post(
  "/payments/:paymentId/refund",
  authorize("admin"),
  validate(
    z.object({
      refundReason: z.string(),
    })
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { paymentId } = req.params;
      const { refundReason } = req.body;

      const payment = await BillingService.refundPayment(facilityId, paymentId, refundReason);

      const response: APIResponse = {
        success: true,
        data: payment,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Subscriptions

// Create subscription
router.post(
  "/subscriptions",
  authorize("admin"),
  validate(
    z.object({
      planId: z.string().uuid(),
    })
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { planId } = req.body;

      const subscription = await BillingService.createSubscription(facilityId, planId);

      const response: APIResponse = {
        success: true,
        data: subscription,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Get subscription
router.get(
  "/subscriptions/current",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;

      const subscription = await BillingService.getSubscription(facilityId);

      const response: APIResponse = {
        success: true,
        data: subscription,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Cancel subscription
router.post(
  "/subscriptions/cancel",
  authorize("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.user!.facilityId;
      const { reason } = req.body;

      const subscription = await BillingService.cancelSubscription(facilityId, reason);

      const response: APIResponse = {
        success: true,
        data: subscription,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Get subscription plans
router.get(
  "/subscriptions/plans",
  validate(paginationSchema, "query"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = req.query as any;

      const result = await BillingService.getSubscriptionPlans(page, limit);

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

export default router;
