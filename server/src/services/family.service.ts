import { v4 as uuidv4 } from "uuid";
import { getDb } from "../db/index.js";
import { families, familyBillingContacts, coppaConsentRecords } from "../db/schema/families.js";
import { students } from "../db/schema/students.js";
import { users } from "../db/schema/users.js";
import { AppError } from "../middleware/error-handler.js";
import { encrypt, decrypt } from "../utils/encryption.js";
import { and, eq, isNull, desc } from "drizzle-orm";
import { User, Family, Student, EmergencyContact, PaginatedResponse } from "../types/index.js";

export class FamilyService {
  static async createFamily(
    facilityId: string,
    data: {
      headOfHousehold: string;
      email: string;
      phone: string;
      addressLine1: string;
      addressLine2?: string | null;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      notes?: string | null;
    }
  ): Promise<Family> {
    const db = getDb();

    const existing = await db
      .select()
      .from(families)
      .where(and(eq(families.facilityId, facilityId), eq(families.email, data.email)))
      .limit(1);

    if (existing.length > 0) {
      throw new AppError("Family with this email already exists", "FAMILY_EXISTS", 409);
    }

    const family = await db
      .insert(families)
      .values({
        id: uuidv4(),
        facilityId,
        headOfHousehold: data.headOfHousehold,
        email: data.email.toLowerCase(),
        phone: data.phone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || null,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        notes: data.notes || null,
      })
      .returning();

    return family[0] as Family;
  }

  static async getFamily(facilityId: string, familyId: string): Promise<Family> {
    const db = getDb();

    const family = await db
      .select()
      .from(families)
      .where(and(eq(families.facilityId, facilityId), eq(families.id, familyId), isNull(families.deletedAt)))
      .limit(1);

    if (!family || family.length === 0) {
      throw new AppError("Family not found", "FAMILY_NOT_FOUND", 404);
    }

    return family[0] as Family;
  }

  static async updateFamily(
    facilityId: string,
    familyId: string,
    data: Partial<{
      headOfHousehold: string;
      email: string;
      phone: string;
      addressLine1: string;
      addressLine2?: string | null;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      notes?: string | null;
    }>
  ): Promise<Family> {
    const db = getDb();

    // Verify family exists and belongs to facility
    await this.getFamily(facilityId, familyId);

    const updated = await db
      .update(families)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(families.facilityId, facilityId), eq(families.id, familyId)))
      .returning();

    return updated[0] as Family;
  }

  static async deleteFamily(facilityId: string, familyId: string): Promise<void> {
    const db = getDb();

    await this.getFamily(facilityId, familyId);

    await db
      .update(families)
      .set({ deletedAt: new Date() })
      .where(and(eq(families.facilityId, facilityId), eq(families.id, familyId)));
  }

  static async listFamilies(
    facilityId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Family>> {
    const db = getDb();

    const offset = (page - 1) * limit;

    const [items, [{ count }]] = await Promise.all([
      db
        .select()
        .from(families)
        .where(and(eq(families.facilityId, facilityId), isNull(families.deletedAt)))
        .orderBy(desc(families.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: (f) => f.countAll() })
        .from(families)
        .where(and(eq(families.facilityId, facilityId), isNull(families.deletedAt))),
    ]);

    const total = parseInt(count.toString());

    return {
      items: items as Family[],
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  static async createStudent(
    facilityId: string,
    familyId: string,
    data: {
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      gender: string;
      skillLevel?: string;
      allergies?: string | null;
      notes?: string | null;
      photoUrl?: string | null;
      medicalInfo?: string | null;
      emergencyContacts: EmergencyContact[];
    }
  ): Promise<Student> {
    const db = getDb();

    // Verify family exists
    await this.getFamily(facilityId, familyId);

    const student = await db
      .insert(students)
      .values({
        id: uuidv4(),
        facilityId,
        familyId,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender as any,
        skillLevel: (data.skillLevel || "beginner") as any,
        enrollmentStatus: "active" as any,
        medicalInfoEncrypted: data.medicalInfo ? encrypt(data.medicalInfo) : null,
        emergencyContacts: data.emergencyContacts as any,
        allergies: data.allergies || null,
        notes: data.notes || null,
        photoUrl: data.photoUrl || null,
        waiverStatus: "pending" as any,
      })
      .returning();

    return this.decryptStudentData(student[0] as any);
  }

  static async getStudent(facilityId: string, studentId: string): Promise<Student> {
    const db = getDb();

    const student = await db
      .select()
      .from(students)
      .where(and(eq(students.facilityId, facilityId), eq(students.id, studentId), isNull(students.deletedAt)))
      .limit(1);

    if (!student || student.length === 0) {
      throw new AppError("Student not found", "STUDENT_NOT_FOUND", 404);
    }

    return this.decryptStudentData(student[0] as any);
  }

  static async updateStudent(
    facilityId: string,
    studentId: string,
    data: Partial<{
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      gender: string;
      skillLevel: string;
      allergies: string | null;
      notes: string | null;
      photoUrl: string | null;
      medicalInfo: string | null;
      emergencyContacts: EmergencyContact[];
    }>
  ): Promise<Student> {
    const db = getDb();

    await this.getStudent(facilityId, studentId);

    const updateData: any = { updatedAt: new Date() };

    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName) updateData.lastName = data.lastName;
    if (data.dateOfBirth) updateData.dateOfBirth = new Date(data.dateOfBirth);
    if (data.gender) updateData.gender = data.gender;
    if (data.skillLevel) updateData.skillLevel = data.skillLevel;
    if (data.allergies !== undefined) updateData.allergies = data.allergies;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl;
    if (data.medicalInfo !== undefined) {
      updateData.medicalInfoEncrypted = data.medicalInfo ? encrypt(data.medicalInfo) : null;
    }
    if (data.emergencyContacts) updateData.emergencyContacts = data.emergencyContacts;

    const updated = await db
      .update(students)
      .set(updateData)
      .where(and(eq(students.facilityId, facilityId), eq(students.id, studentId)))
      .returning();

    return this.decryptStudentData(updated[0] as any);
  }

  static async deleteStudent(facilityId: string, studentId: string): Promise<void> {
    const db = getDb();

    await this.getStudent(facilityId, studentId);

    await db
      .update(students)
      .set({ deletedAt: new Date() })
      .where(and(eq(students.facilityId, facilityId), eq(students.id, studentId)));
  }

  static async listStudentsByFamily(
    facilityId: string,
    familyId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Student>> {
    const db = getDb();

    await this.getFamily(facilityId, familyId);

    const offset = (page - 1) * limit;

    const [items, [{ count }]] = await Promise.all([
      db
        .select()
        .from(students)
        .where(
          and(
            eq(students.facilityId, facilityId),
            eq(students.familyId, familyId),
            isNull(students.deletedAt)
          )
        )
        .orderBy(desc(students.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: (s) => s.countAll() })
        .from(students)
        .where(
          and(
            eq(students.facilityId, facilityId),
            eq(students.familyId, familyId),
            isNull(students.deletedAt)
          )
        ),
    ]);

    const total = parseInt(count.toString());

    return {
      items: items.map((s) => this.decryptStudentData(s as any)) as Student[],
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  static async recordCOPPAConsent(
    facilityId: string,
    familyId: string,
    parentGuardianId: string,
    consentGiven: boolean,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    const db = getDb();

    await this.getFamily(facilityId, familyId);

    await db.insert(coppaConsentRecords).values({
      id: uuidv4(),
      facilityId,
      familyId,
      parentGuardianId,
      consentGiven,
      consentTimestamp: new Date(),
      ipAddress,
      userAgent,
    });
  }

  static async getCOPPAConsent(facilityId: string, familyId: string): Promise<any | null> {
    const db = getDb();

    const consent = await db
      .select()
      .from(coppaConsentRecords)
      .where(and(eq(coppaConsentRecords.facilityId, facilityId), eq(coppaConsentRecords.familyId, familyId)))
      .orderBy(desc(coppaConsentRecords.consentTimestamp))
      .limit(1);

    return consent[0] || null;
  }

  static async validateCOPPACompliance(facilityId: string, familyId: string): Promise<boolean> {
    const consent = await this.getCOPPAConsent(facilityId, familyId);
    return consent && consent.consentGiven === true;
  }

  private static decryptStudentData(student: any): Student {
    return {
      ...student,
      medicalInfoEncrypted: student.medicalInfoEncrypted ? decrypt(student.medicalInfoEncrypted) : null,
    };
  }
}
