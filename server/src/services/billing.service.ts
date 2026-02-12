import { v4 as uuidv4 } from "uuid";
import { getDb } from "../db/index.js";
import { invoices, payments, paymentMethods, subscriptions } from "../db/schema/billing.js";
import { subscriptionPlans } from "../db/schema/shared.js";
import { AppError } from "../middleware/error-handler.js";
import { and, eq, isNull, desc } from "drizzle-orm";
import { Invoice, Payment, Subscription, PaginatedResponse } from "../types/index.js";
import { addMonths } from "date-fns";

export class BillingService {
  static async createPaymentMethod(
    facilityId: string,
    familyId: string,
    data: {
      type: string;
      stripePaymentMethodId: string;
      lastFourDigits: string;
      expiryMonth?: number | null;
      expiryYear?: number | null;
      isDefault?: boolean;
    }
  ): Promise<any> {
    const db = getDb();

    const method = await db
      .insert(paymentMethods)
      .values({
        id: uuidv4(),
        facilityId,
        familyId,
        type: data.type as any,
        stripePaymentMethodId: data.stripePaymentMethodId,
        lastFourDigits: data.lastFourDigits,
        expiryMonth: data.expiryMonth || null,
        expiryYear: data.expiryYear || null,
        isDefault: data.isDefault || false,
      })
      .returning();

    return method[0];
  }

  static async getPaymentMethods(facilityId: string, familyId: string): Promise<any[]> {
    const db = getDb();

    return db
      .select()
      .from(paymentMethods)
      .where(
        and(
          eq(paymentMethods.facilityId, facilityId),
          eq(paymentMethods.familyId, familyId),
          isNull(paymentMethods.deletedAt)
        )
      )
      .orderBy(paymentMethods.isDefault ? "desc" : "asc");
  }

  static async createInvoice(
    facilityId: string,
    familyId: string,
    data: {
      invoiceNumber: string;
      amount: number;
      dueDate: Date;
      items: any[];
      notes?: string | null;
    }
  ): Promise<Invoice> {
    const db = getDb();

    const invoice = await db
      .insert(invoices)
      .values({
        id: uuidv4(),
        facilityId,
        familyId,
        invoiceNumber: data.invoiceNumber,
        amount: data.amount.toString() as any,
        dueDate: data.dueDate,
        status: "draft" as any,
        items: data.items as any,
        notes: data.notes || null,
      })
      .returning();

    return invoice[0] as Invoice;
  }

  static async getInvoice(facilityId: string, invoiceId: string): Promise<Invoice> {
    const db = getDb();

    const invoice = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.facilityId, facilityId), eq(invoices.id, invoiceId), isNull(invoices.deletedAt)))
      .limit(1);

    if (!invoice || invoice.length === 0) {
      throw new AppError("Invoice not found", "INVOICE_NOT_FOUND", 404);
    }

    return invoice[0] as Invoice;
  }

  static async updateInvoice(
    facilityId: string,
    invoiceId: string,
    data: Partial<{
      status: string;
      dueDate: Date;
      items: any[];
      notes: string | null;
    }>
  ): Promise<Invoice> {
    const db = getDb();

    await this.getInvoice(facilityId, invoiceId);

    const updateData: any = { updatedAt: new Date() };
    if (data.status) updateData.status = data.status;
    if (data.dueDate) updateData.dueDate = data.dueDate;
    if (data.items) updateData.items = data.items;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const updated = await db
      .update(invoices)
      .set(updateData)
      .where(and(eq(invoices.facilityId, facilityId), eq(invoices.id, invoiceId)))
      .returning();

    return updated[0] as Invoice;
  }

  static async listInvoices(
    facilityId: string,
    familyId?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Invoice>> {
    const db = getDb();

    const offset = (page - 1) * limit;

    let whereClause = and(eq(invoices.facilityId, facilityId), isNull(invoices.deletedAt));

    if (familyId) {
      whereClause = and(whereClause, eq(invoices.familyId, familyId));
    }

    const [items, [{ count }]] = await Promise.all([
      db
        .select()
        .from(invoices)
        .where(whereClause)
        .orderBy(desc(invoices.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: (i) => i.countAll() }).from(invoices).where(whereClause),
    ]);

    const total = parseInt(count.toString());

    return {
      items: items as Invoice[],
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  static async sendInvoice(facilityId: string, invoiceId: string): Promise<Invoice> {
    const db = getDb();

    const invoice = await this.getInvoice(facilityId, invoiceId);

    if (invoice.status === "sent") {
      throw new AppError("Invoice has already been sent", "INVOICE_ALREADY_SENT", 400);
    }

    const updated = await db
      .update(invoices)
      .set({
        status: "sent" as any,
        sentAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, invoiceId))
      .returning();

    return updated[0] as Invoice;
  }

  static async processPayment(
    facilityId: string,
    invoiceId: string,
    paymentMethodId: string,
    amount: number
  ): Promise<Payment> {
    const db = getDb();

    const invoice = await this.getInvoice(facilityId, invoiceId);

    if (invoice.status === "paid") {
      throw new AppError("Invoice is already paid", "INVOICE_ALREADY_PAID", 400);
    }

    // Verify payment method belongs to the invoice family
    const method = await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.id, paymentMethodId))
      .limit(1);

    if (!method || method.length === 0) {
      throw new AppError("Payment method not found", "PAYMENT_METHOD_NOT_FOUND", 404);
    }

    if (method[0].familyId !== invoice.familyId) {
      throw new AppError("Payment method does not belong to this family", "INVALID_PAYMENT_METHOD", 400);
    }

    // Process payment (mocked Stripe integration)
    const stripePaymentIntentId = `pi_${uuidv4().replace(/-/g, "")}`;

    const payment = await db
      .insert(payments)
      .values({
        id: uuidv4(),
        facilityId,
        invoiceId,
        amount: amount.toString() as any,
        paymentMethod: method[0].type as any,
        stripePaymentIntentId,
        status: "completed" as any,
        paidAt: new Date(),
      })
      .returning();

    // Update invoice status
    await db
      .update(invoices)
      .set({
        status: "paid" as any,
        paidAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, invoiceId));

    return payment[0] as Payment;
  }

  static async refundPayment(
    facilityId: string,
    paymentId: string,
    refundReason: string
  ): Promise<Payment> {
    const db = getDb();

    const payment = await db
      .select()
      .from(payments)
      .where(and(eq(payments.facilityId, facilityId), eq(payments.id, paymentId)))
      .limit(1);

    if (!payment || payment.length === 0) {
      throw new AppError("Payment not found", "PAYMENT_NOT_FOUND", 404);
    }

    if (payment[0].status === "refunded") {
      throw new AppError("Payment has already been refunded", "ALREADY_REFUNDED", 400);
    }

    const updated = await db
      .update(payments)
      .set({
        status: "refunded" as any,
        refundedAt: new Date(),
        refundReason,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, paymentId))
      .returning();

    // Update invoice status to draft
    await db
      .update(invoices)
      .set({
        status: "draft" as any,
        paidAt: null,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, payment[0].invoiceId));

    return updated[0] as Payment;
  }

  static async createSubscription(
    facilityId: string,
    planId: string
  ): Promise<Subscription> {
    const db = getDb();

    // Verify plan exists
    const plan = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, planId)).limit(1);

    if (!plan || plan.length === 0) {
      throw new AppError("Subscription plan not found", "PLAN_NOT_FOUND", 404);
    }

    const now = new Date();
    const periodEnd = addMonths(now, 1);

    const subscription = await db
      .insert(subscriptions)
      .values({
        id: uuidv4(),
        facilityId,
        planId,
        status: "active" as any,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        stripeSubscriptionId: `sub_${uuidv4().replace(/-/g, "")}`,
      })
      .returning();

    return subscription[0] as Subscription;
  }

  static async getSubscription(facilityId: string): Promise<Subscription | null> {
    const db = getDb();

    const subscription = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.facilityId, facilityId), eq(subscriptions.status, "active"), isNull(subscriptions.deletedAt)))
      .limit(1);

    return subscription[0] || null;
  }

  static async cancelSubscription(facilityId: string, reason?: string): Promise<Subscription> {
    const db = getDb();

    const subscription = await this.getSubscription(facilityId);

    if (!subscription) {
      throw new AppError("Active subscription not found", "SUBSCRIPTION_NOT_FOUND", 404);
    }

    const updated = await db
      .update(subscriptions)
      .set({
        status: "cancelled" as any,
        cancelledAt: new Date(),
        cancelReason: reason || null,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscription.id))
      .returning();

    return updated[0] as Subscription;
  }

  static async getSubscriptionPlans(page: number = 1, limit: number = 10): Promise<PaginatedResponse<any>> {
    const db = getDb();

    const offset = (page - 1) * limit;

    const [items, [{ count }]] = await Promise.all([
      db
        .select()
        .from(subscriptionPlans)
        .where(and(eq(subscriptionPlans.isActive, true), isNull(subscriptionPlans.deletedAt)))
        .orderBy(subscriptionPlans.pricePerMonth)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: (p) => p.countAll() })
        .from(subscriptionPlans)
        .where(and(eq(subscriptionPlans.isActive, true), isNull(subscriptionPlans.deletedAt))),
    ]);

    const total = parseInt(count.toString());

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }
}
