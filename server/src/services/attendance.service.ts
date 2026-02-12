import { v4 as uuidv4 } from "uuid";
import { getDb } from "../db/index.js";
import { attendanceRecords } from "../db/schema/attendance.js";
import { classInstances } from "../db/schema/classes.js";
import { AppError } from "../middleware/error-handler.js";
import { and, eq, isNull, desc, gte, lte } from "drizzle-orm";
import { AttendanceRecord, PaginatedResponse } from "../types/index.js";

export class AttendanceService {
  static async checkIn(
    facilityId: string,
    classInstanceId: string,
    studentId: string
  ): Promise<AttendanceRecord> {
    const db = getDb();

    // Verify class instance exists
    const instance = await db
      .select()
      .from(classInstances)
      .where(eq(classInstances.id, classInstanceId))
      .limit(1);

    if (!instance || instance.length === 0) {
      throw new AppError("Class instance not found", "CLASS_INSTANCE_NOT_FOUND", 404);
    }

    // Check if already checked in
    const existing = await db
      .select()
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.classInstanceId, classInstanceId),
          eq(attendanceRecords.studentId, studentId),
          isNull(attendanceRecords.deletedAt)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new AppError("Student is already checked in", "ALREADY_CHECKED_IN", 400);
    }

    const now = new Date();

    const record = await db
      .insert(attendanceRecords)
      .values({
        id: uuidv4(),
        facilityId,
        classInstanceId,
        studentId,
        status: "present" as any,
        checkInTime: now,
      })
      .returning();

    return record[0] as AttendanceRecord;
  }

  static async checkOut(
    facilityId: string,
    classInstanceId: string,
    studentId: string
  ): Promise<AttendanceRecord> {
    const db = getDb();

    const record = await db
      .select()
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.facilityId, facilityId),
          eq(attendanceRecords.classInstanceId, classInstanceId),
          eq(attendanceRecords.studentId, studentId),
          isNull(attendanceRecords.deletedAt)
        )
      )
      .limit(1);

    if (!record || record.length === 0) {
      throw new AppError("Attendance record not found", "RECORD_NOT_FOUND", 404);
    }

    const updated = await db
      .update(attendanceRecords)
      .set({
        checkOutTime: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(attendanceRecords.id, record[0].id))
      .returning();

    return updated[0] as AttendanceRecord;
  }

  static async markAttendance(
    facilityId: string,
    classInstanceId: string,
    studentId: string,
    status: string,
    notes?: string | null
  ): Promise<AttendanceRecord> {
    const db = getDb();

    // Check if record exists
    const existing = await db
      .select()
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.facilityId, facilityId),
          eq(attendanceRecords.classInstanceId, classInstanceId),
          eq(attendanceRecords.studentId, studentId),
          isNull(attendanceRecords.deletedAt)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing record
      const updated = await db
        .update(attendanceRecords)
        .set({
          status: status as any,
          notes,
          updatedAt: new Date(),
        })
        .where(eq(attendanceRecords.id, existing[0].id))
        .returning();

      return updated[0] as AttendanceRecord;
    }

    // Create new record
    const record = await db
      .insert(attendanceRecords)
      .values({
        id: uuidv4(),
        facilityId,
        classInstanceId,
        studentId,
        status: status as any,
        notes,
      })
      .returning();

    return record[0] as AttendanceRecord;
  }

  static async getClassAttendance(
    facilityId: string,
    classInstanceId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedResponse<AttendanceRecord>> {
    const db = getDb();

    const offset = (page - 1) * limit;

    const [items, [{ count }]] = await Promise.all([
      db
        .select()
        .from(attendanceRecords)
        .where(
          and(
            eq(attendanceRecords.facilityId, facilityId),
            eq(attendanceRecords.classInstanceId, classInstanceId),
            isNull(attendanceRecords.deletedAt)
          )
        )
        .orderBy(desc(attendanceRecords.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: (a) => a.countAll() })
        .from(attendanceRecords)
        .where(
          and(
            eq(attendanceRecords.facilityId, facilityId),
            eq(attendanceRecords.classInstanceId, classInstanceId),
            isNull(attendanceRecords.deletedAt)
          )
        ),
    ]);

    const total = parseInt(count.toString());

    return {
      items: items as AttendanceRecord[],
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  static async getStudentAttendanceReport(
    facilityId: string,
    studentId: string,
    startDate: Date,
    endDate: Date,
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedResponse<AttendanceRecord>> {
    const db = getDb();

    const offset = (page - 1) * limit;

    const [items, [{ count }]] = await Promise.all([
      db
        .select()
        .from(attendanceRecords)
        .where(
          and(
            eq(attendanceRecords.facilityId, facilityId),
            eq(attendanceRecords.studentId, studentId),
            gte(attendanceRecords.createdAt, startDate),
            lte(attendanceRecords.createdAt, endDate),
            isNull(attendanceRecords.deletedAt)
          )
        )
        .orderBy(desc(attendanceRecords.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: (a) => a.countAll() })
        .from(attendanceRecords)
        .where(
          and(
            eq(attendanceRecords.facilityId, facilityId),
            eq(attendanceRecords.studentId, studentId),
            gte(attendanceRecords.createdAt, startDate),
            lte(attendanceRecords.createdAt, endDate),
            isNull(attendanceRecords.deletedAt)
          )
        ),
    ]);

    const total = parseInt(count.toString());

    return {
      items: items as AttendanceRecord[],
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  static async getAttendanceStats(facilityId: string, studentId: string): Promise<any> {
    const db = getDb();

    const records = await db
      .select()
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.facilityId, facilityId),
          eq(attendanceRecords.studentId, studentId),
          isNull(attendanceRecords.deletedAt)
        )
      );

    const total = records.length;
    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const excused = records.filter((r) => r.status === "excused").length;
    const late = records.filter((r) => r.status === "late").length;

    const attendanceRate = total > 0 ? (present / total) * 100 : 0;

    return {
      total,
      present,
      absent,
      excused,
      late,
      attendanceRate: attendanceRate.toFixed(2),
    };
  }
}
