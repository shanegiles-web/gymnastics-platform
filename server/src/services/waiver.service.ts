import { v4 as uuidv4 } from "uuid";
import PDFDocument from "pdfkit";
import { getDb } from "../db/index.js";
import { waiverTemplates, signedWaivers } from "../db/schema/waivers.js";
import { AppError } from "../middleware/error-handler.js";
import { and, eq, isNull, desc } from "drizzle-orm";
import { WaiverTemplate, SignedWaiver, PaginatedResponse } from "../types/index.js";
import { addYears } from "date-fns";

export class WaiverService {
  static async createTemplate(
    facilityId: string,
    data: {
      name: string;
      version: string;
      content: string;
      effectiveDate: Date;
    }
  ): Promise<WaiverTemplate> {
    const db = getDb();

    const template = await db
      .insert(waiverTemplates)
      .values({
        id: uuidv4(),
        facilityId,
        name: data.name,
        version: data.version,
        content: data.content,
        effectiveDate: data.effectiveDate,
        isActive: false,
      })
      .returning();

    return template[0] as WaiverTemplate;
  }

  static async getTemplate(facilityId: string, templateId: string): Promise<WaiverTemplate> {
    const db = getDb();

    const template = await db
      .select()
      .from(waiverTemplates)
      .where(
        and(eq(waiverTemplates.facilityId, facilityId), eq(waiverTemplates.id, templateId), isNull(waiverTemplates.deletedAt))
      )
      .limit(1);

    if (!template || template.length === 0) {
      throw new AppError("Waiver template not found", "TEMPLATE_NOT_FOUND", 404);
    }

    return template[0] as WaiverTemplate;
  }

  static async getActiveTemplate(facilityId: string): Promise<WaiverTemplate | null> {
    const db = getDb();

    const template = await db
      .select()
      .from(waiverTemplates)
      .where(
        and(
          eq(waiverTemplates.facilityId, facilityId),
          eq(waiverTemplates.isActive, true),
          isNull(waiverTemplates.deletedAt)
        )
      )
      .orderBy(desc(waiverTemplates.effectiveDate))
      .limit(1);

    return template[0] || null;
  }

  static async activateTemplate(facilityId: string, templateId: string): Promise<WaiverTemplate> {
    const db = getDb();

    const template = await this.getTemplate(facilityId, templateId);

    // Deactivate other templates
    await db
      .update(waiverTemplates)
      .set({ isActive: false })
      .where(and(eq(waiverTemplates.facilityId, facilityId), eq(waiverTemplates.isActive, true)));

    const updated = await db
      .update(waiverTemplates)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(waiverTemplates.id, templateId))
      .returning();

    return updated[0] as WaiverTemplate;
  }

  static async listTemplates(
    facilityId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<WaiverTemplate>> {
    const db = getDb();

    const offset = (page - 1) * limit;

    const [items, [{ count }]] = await Promise.all([
      db
        .select()
        .from(waiverTemplates)
        .where(and(eq(waiverTemplates.facilityId, facilityId), isNull(waiverTemplates.deletedAt)))
        .orderBy(desc(waiverTemplates.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: (w) => w.countAll() })
        .from(waiverTemplates)
        .where(and(eq(waiverTemplates.facilityId, facilityId), isNull(waiverTemplates.deletedAt))),
    ]);

    const total = parseInt(count.toString());

    return {
      items: items as WaiverTemplate[],
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  static async signWaiver(
    facilityId: string,
    waiverTemplateId: string,
    studentId: string,
    parentGuardianId: string,
    signature: string,
    ipAddress: string,
    userAgent: string
  ): Promise<SignedWaiver> {
    const db = getDb();

    const template = await this.getTemplate(facilityId, waiverTemplateId);

    const expiresAt = addYears(new Date(), 1);

    const signedWaiver = await db
      .insert(signedWaivers)
      .values({
        id: uuidv4(),
        facilityId,
        waiverTemplateId,
        studentId,
        parentGuardianId,
        signature,
        ipAddress,
        userAgent,
        signedAt: new Date(),
        expiresAt,
      })
      .returning();

    return signedWaiver[0] as SignedWaiver;
  }

  static async getSignedWaiver(facilityId: string, studentId: string): Promise<SignedWaiver | null> {
    const db = getDb();

    const waiver = await db
      .select()
      .from(signedWaivers)
      .where(
        and(eq(signedWaivers.facilityId, facilityId), eq(signedWaivers.studentId, studentId), isNull(signedWaivers.deletedAt))
      )
      .orderBy(desc(signedWaivers.signedAt))
      .limit(1);

    return waiver[0] || null;
  }

  static async isWaiverValid(facilityId: string, studentId: string): Promise<boolean> {
    const waiver = await this.getSignedWaiver(facilityId, studentId);

    if (!waiver) {
      return false;
    }

    return waiver.expiresAt > new Date();
  }

  static async generateWaiverPDF(
    templateContent: string,
    studentName: string,
    parentName: string
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc.fontSize(16).text("WAIVER AND RELEASE OF LIABILITY", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(templateContent);
      doc.moveDown();
      doc.text(`Student Name: ${studentName}`);
      doc.text(`Parent/Guardian Name: ${parentName}`);
      doc.text(`Date Signed: ${new Date().toLocaleDateString()}`);
      doc.moveDown();
      doc.text("Signature: _________________________");

      doc.end();
    });
  }

  static async getWaiverStatus(facilityId: string, studentId: string): Promise<any> {
    const waiver = await this.getSignedWaiver(facilityId, studentId);

    if (!waiver) {
      return {
        status: "pending",
        message: "Waiver not signed",
      };
    }

    if (waiver.expiresAt < new Date()) {
      return {
        status: "expired",
        message: "Waiver has expired",
        expiresAt: waiver.expiresAt,
      };
    }

    return {
      status: "signed",
      message: "Waiver is valid",
      signedAt: waiver.signedAt,
      expiresAt: waiver.expiresAt,
    };
  }
}
