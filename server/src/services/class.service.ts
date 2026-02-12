import { v4 as uuidv4 } from "uuid";
import { getDb } from "../db/index.js";
import {
  classes,
  classSchedules,
  classInstances,
  enrollments,
  classTemplates,
  scheduleExceptions,
} from "../db/schema/classes.js";
import { students } from "../db/schema/students.js";
import { AppError } from "../middleware/error-handler.js";
import { and, eq, isNull, desc, gte, lte } from "drizzle-orm";
import { Class, ClassSchedule, Enrollment, PaginatedResponse } from "../types/index.js";
import rrule from "rrule";
const { RRuleSet } = rrule;

export class ClassService {
  static async createClass(
    facilityId: string,
    data: {
      name: string;
      description?: string | null;
      skillLevel: string;
      maxCapacity: number;
      minAgeMonths?: number | null;
      maxAgeMonths?: number | null;
      coachIds: string[];
      pricePerMonth: number;
    }
  ): Promise<Class> {
    const db = getDb();

    const classEntity = await db
      .insert(classes)
      .values({
        id: uuidv4(),
        facilityId,
        name: data.name,
        description: data.description || null,
        skillLevel: data.skillLevel as any,
        maxCapacity: data.maxCapacity,
        minAgeMonths: data.minAgeMonths || null,
        maxAgeMonths: data.maxAgeMonths || null,
        coachIds: data.coachIds as any,
        pricePerMonth: data.pricePerMonth.toString() as any,
      })
      .returning();

    return classEntity[0] as Class;
  }

  static async getClass(facilityId: string, classId: string): Promise<Class> {
    const db = getDb();

    const classEntity = await db
      .select()
      .from(classes)
      .where(and(eq(classes.facilityId, facilityId), eq(classes.id, classId), isNull(classes.deletedAt)))
      .limit(1);

    if (!classEntity || classEntity.length === 0) {
      throw new AppError("Class not found", "CLASS_NOT_FOUND", 404);
    }

    return classEntity[0] as Class;
  }

  static async updateClass(
    facilityId: string,
    classId: string,
    data: Partial<{
      name: string;
      description: string | null;
      skillLevel: string;
      maxCapacity: number;
      minAgeMonths: number | null;
      maxAgeMonths: number | null;
      coachIds: string[];
      pricePerMonth: number;
    }>
  ): Promise<Class> {
    const db = getDb();

    await this.getClass(facilityId, classId);

    const updateData: any = { updatedAt: new Date() };
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.skillLevel) updateData.skillLevel = data.skillLevel;
    if (data.maxCapacity) updateData.maxCapacity = data.maxCapacity;
    if (data.minAgeMonths !== undefined) updateData.minAgeMonths = data.minAgeMonths;
    if (data.maxAgeMonths !== undefined) updateData.maxAgeMonths = data.maxAgeMonths;
    if (data.coachIds) updateData.coachIds = data.coachIds;
    if (data.pricePerMonth) updateData.pricePerMonth = data.pricePerMonth.toString();

    const updated = await db
      .update(classes)
      .set(updateData)
      .where(and(eq(classes.facilityId, facilityId), eq(classes.id, classId)))
      .returning();

    return updated[0] as Class;
  }

  static async deleteClass(facilityId: string, classId: string): Promise<void> {
    const db = getDb();

    await this.getClass(facilityId, classId);

    await db
      .update(classes)
      .set({ deletedAt: new Date() })
      .where(and(eq(classes.facilityId, facilityId), eq(classes.id, classId)));
  }

  static async listClasses(
    facilityId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Class>> {
    const db = getDb();

    const offset = (page - 1) * limit;

    const [items, [{ count }]] = await Promise.all([
      db
        .select()
        .from(classes)
        .where(and(eq(classes.facilityId, facilityId), isNull(classes.deletedAt)))
        .orderBy(desc(classes.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: (c) => c.countAll() })
        .from(classes)
        .where(and(eq(classes.facilityId, facilityId), isNull(classes.deletedAt))),
    ]);

    const total = parseInt(count.toString());

    return {
      items: items as Class[],
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  static async addSchedule(
    facilityId: string,
    classId: string,
    data: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      recurrenceRule: string;
    }
  ): Promise<ClassSchedule> {
    const db = getDb();

    await this.getClass(facilityId, classId);

    const schedule = await db
      .insert(classSchedules)
      .values({
        id: uuidv4(),
        classId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        recurrenceRule: data.recurrenceRule,
      })
      .returning();

    return schedule[0] as ClassSchedule;
  }

  static async getSchedulesForClass(classId: string): Promise<ClassSchedule[]> {
    const db = getDb();

    return db
      .select()
      .from(classSchedules)
      .where(and(eq(classSchedules.classId, classId), isNull(classSchedules.deletedAt)));
  }

  static async generateClassInstances(
    facilityId: string,
    classId: string,
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    const db = getDb();

    const schedules = await this.getSchedulesForClass(classId);

    if (schedules.length === 0) {
      throw new AppError("No schedules defined for this class", "NO_SCHEDULES", 400);
    }

    for (const schedule of schedules) {
      try {
        const rruleSet = new RRuleSet();
        rruleSet.rrule(schedule.recurrenceRule as any);

        const occurrences = rruleSet.between(startDate, endDate, true);

        for (const occurrence of occurrences) {
          const [hours, minutes] = schedule.startTime.split(":").map(Number);
          const startDateTime = new Date(occurrence);
          startDateTime.setHours(hours, minutes, 0, 0);

          const [endHours, endMinutes] = schedule.endTime.split(":").map(Number);
          const endDateTime = new Date(occurrence);
          endDateTime.setHours(endHours, endMinutes, 0, 0);

          await db.insert(classInstances).values({
            id: uuidv4(),
            classScheduleId: schedule.id,
            startDateTime,
            endDateTime,
            status: "scheduled" as any,
          });
        }
      } catch (error) {
        console.error(`Failed to generate instances for schedule ${schedule.id}:`, error);
      }
    }
  }

  static async enrollStudent(
    facilityId: string,
    classId: string,
    studentId: string,
    startDate: Date,
    endDate?: Date
  ): Promise<Enrollment> {
    const db = getDb();

    // Verify class and student exist
    await this.getClass(facilityId, classId);

    const student = await db
      .select()
      .from(students)
      .where(and(eq(students.facilityId, facilityId), eq(students.id, studentId)))
      .limit(1);

    if (!student || student.length === 0) {
      throw new AppError("Student not found", "STUDENT_NOT_FOUND", 404);
    }

    // Check if already enrolled
    const existing = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.classId, classId),
          eq(enrollments.studentId, studentId),
          isNull(enrollments.deletedAt)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new AppError("Student is already enrolled in this class", "ALREADY_ENROLLED", 409);
    }

    // Get class details
    const classEntity = await this.getClass(facilityId, classId);

    // Check capacity
    const activeEnrollments = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.classId, classId),
          eq(enrollments.status, "active"),
          isNull(enrollments.deletedAt)
        )
      );

    const isWaitlisted = activeEnrollments.length >= classEntity.maxCapacity;
    const position = activeEnrollments.length + 1;

    const enrollment = await db
      .insert(enrollments)
      .values({
        id: uuidv4(),
        classId,
        studentId,
        enrollmentDate: new Date(),
        startDate,
        endDate: endDate || null,
        status: "active" as any,
        position,
        isWaitlisted,
      })
      .returning();

    return enrollment[0] as Enrollment;
  }

  static async unenrollStudent(facilityId: string, classId: string, studentId: string): Promise<void> {
    const db = getDb();

    await this.getClass(facilityId, classId);

    const enrollment = await db
      .select()
      .from(enrollments)
      .where(
        and(eq(enrollments.classId, classId), eq(enrollments.studentId, studentId), isNull(enrollments.deletedAt))
      )
      .limit(1);

    if (!enrollment || enrollment.length === 0) {
      throw new AppError("Enrollment not found", "ENROLLMENT_NOT_FOUND", 404);
    }

    await db
      .update(enrollments)
      .set({ status: "cancelled" as any, deletedAt: new Date() })
      .where(eq(enrollments.id, enrollment[0].id));
  }

  static async getClassEnrollments(facilityId: string, classId: string, page: number = 1, limit: number = 50) {
    const db = getDb();

    await this.getClass(facilityId, classId);

    const offset = (page - 1) * limit;

    const [items, [{ count }]] = await Promise.all([
      db
        .select()
        .from(enrollments)
        .where(and(eq(enrollments.classId, classId), isNull(enrollments.deletedAt)))
        .orderBy(enrollments.position)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: (e) => e.countAll() })
        .from(enrollments)
        .where(and(eq(enrollments.classId, classId), isNull(enrollments.deletedAt))),
    ]);

    const total = parseInt(count.toString());

    return {
      items: items as Enrollment[],
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  static async createClassTemplate(
    facilityId: string,
    data: {
      name: string;
      description?: string | null;
      schedules: any[];
      skillLevel: string;
      maxCapacity: number;
      coachIds: string[];
      pricePerMonth: number;
    }
  ): Promise<any> {
    const db = getDb();

    const template = await db
      .insert(classTemplates)
      .values({
        id: uuidv4(),
        facilityId,
        name: data.name,
        description: data.description || null,
        schedules: data.schedules as any,
        skillLevel: data.skillLevel,
        maxCapacity: data.maxCapacity,
        coachIds: data.coachIds as any,
        pricePerMonth: data.pricePerMonth.toString() as any,
      })
      .returning();

    return template[0];
  }

  static async applyClassTemplate(
    facilityId: string,
    templateId: string,
    data: {
      name: string;
      coachIds?: string[];
      pricePerMonth?: number;
    }
  ): Promise<Class> {
    const db = getDb();

    const template = await db
      .select()
      .from(classTemplates)
      .where(and(eq(classTemplates.facilityId, facilityId), eq(classTemplates.id, templateId)))
      .limit(1);

    if (!template || template.length === 0) {
      throw new AppError("Template not found", "TEMPLATE_NOT_FOUND", 404);
    }

    const newClass = await this.createClass(facilityId, {
      name: data.name,
      description: template[0].description || undefined,
      skillLevel: template[0].skillLevel,
      maxCapacity: parseInt(template[0].maxCapacity.toString()),
      coachIds: data.coachIds || (template[0].coachIds as any),
      pricePerMonth: data.pricePerMonth || parseFloat(template[0].pricePerMonth.toString()),
    });

    // Add schedules from template
    for (const schedule of template[0].schedules as any) {
      await this.addSchedule(facilityId, newClass.id, {
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        recurrenceRule: schedule.recurrenceRule,
      });
    }

    return newClass;
  }

  static async addScheduleException(
    classScheduleId: string,
    exceptionDate: Date,
    reason: string,
    isCancelled: boolean = true
  ): Promise<void> {
    const db = getDb();

    await db.insert(scheduleExceptions).values({
      id: uuidv4(),
      classScheduleId,
      exceptionDate,
      reason,
      isCancelled,
    });
  }
}
