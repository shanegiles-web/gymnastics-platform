import { v4 as uuidv4 } from "uuid";
import { getDb } from "../db/index.js";
import { timeRecords } from "../db/schema/timeclock.js";
import { AppError } from "../middleware/error-handler.js";
import { and, eq, isNull, desc, gte, lte, count } from "drizzle-orm";
import { TimeRecord, PaginatedResponse } from "../types/index.js";
import { CONFIG } from "../config/index.js";
import { differenceInHours, differenceInMinutes } from "date-fns";

export class TimeclockService {
  static async clockIn(
    facilityId: string,
    userId: string,
    latitude: number,
    longitude: number,
    geofenceLatitude?: number,
    geofenceLongitude?: number,
    geofenceRadius?: number
  ): Promise<TimeRecord> {
    const db = getDb();

    // Check if already clocked in
    const activeRecord = await db
      .select()
      .from(timeRecords)
      .where(
        and(
          eq(timeRecords.facilityId, facilityId),
          eq(timeRecords.userId, userId),
          isNull(timeRecords.clockOutTime),
          isNull(timeRecords.deletedAt)
        )
      )
      .limit(1);

    if (activeRecord.length > 0) {
      throw new AppError("User is already clocked in", "ALREADY_CLOCKED_IN", 400);
    }

    const geoLocation = this.getGeolocationName(latitude, longitude);
    const isWithinGeofence = this.checkGeofence(
      latitude,
      longitude,
      geofenceLatitude || 0,
      geofenceLongitude || 0,
      geofenceRadius || CONFIG.GEOFENCE_RADIUS_METERS
    );

    const record = await db
      .insert(timeRecords)
      .values({
        id: uuidv4(),
        facilityId,
        userId,
        clockInTime: new Date(),
        latitude: latitude.toString() as any,
        longitude: longitude.toString() as any,
        checkInLocation: geoLocation,
        isApproved: isWithinGeofence,
      })
      .returning();

    return record[0] as unknown as TimeRecord;
  }

  static async clockOut(
    facilityId: string,
    userId: string,
    latitude: number,
    longitude: number,
    geofenceLatitude?: number,
    geofenceLongitude?: number,
    geofenceRadius?: number
  ): Promise<TimeRecord> {
    const db = getDb();

    const activeRecord = await db
      .select()
      .from(timeRecords)
      .where(
        and(
          eq(timeRecords.facilityId, facilityId),
          eq(timeRecords.userId, userId),
          isNull(timeRecords.clockOutTime),
          isNull(timeRecords.deletedAt)
        )
      )
      .limit(1);

    if (!activeRecord || activeRecord.length === 0) {
      throw new AppError("No active clock-in record found", "NOT_CLOCKED_IN", 400);
    }

    const geoLocation = this.getGeolocationName(latitude, longitude);
    const isWithinGeofence = this.checkGeofence(
      latitude,
      longitude,
      geofenceLatitude || 0,
      geofenceLongitude || 0,
      geofenceRadius || CONFIG.GEOFENCE_RADIUS_METERS
    );

    const updated = await db
      .update(timeRecords)
      .set({
        clockOutTime: new Date(),
        checkOutLocation: geoLocation,
        isApproved: activeRecord[0].isApproved && isWithinGeofence,
        updatedAt: new Date(),
      })
      .where(eq(timeRecords.id, activeRecord[0].id))
      .returning();

    return updated[0] as unknown as TimeRecord;
  }

  static async getTimeRecord(facilityId: string, recordId: string): Promise<TimeRecord> {
    const db = getDb();

    const record = await db
      .select()
      .from(timeRecords)
      .where(and(eq(timeRecords.facilityId, facilityId), eq(timeRecords.id, recordId), isNull(timeRecords.deletedAt)))
      .limit(1);

    if (!record || record.length === 0) {
      throw new AppError("Time record not found", "RECORD_NOT_FOUND", 404);
    }

    return record[0] as unknown as TimeRecord;
  }

  static async getUserTimeRecords(
    facilityId: string,
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<TimeRecord>> {
    const db = getDb();

    const offset = (page - 1) * limit;

    const [items, countResult] = await Promise.all([
      db
        .select()
        .from(timeRecords)
        .where(
          and(eq(timeRecords.facilityId, facilityId), eq(timeRecords.userId, userId), isNull(timeRecords.deletedAt))
        )
        .orderBy(desc(timeRecords.clockInTime))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(timeRecords)
        .where(
          and(eq(timeRecords.facilityId, facilityId), eq(timeRecords.userId, userId), isNull(timeRecords.deletedAt))
        ),
    ]);

    const total = Number(countResult[0]?.count || 0);

    return {
      items: items as unknown as TimeRecord[],
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  static async getFacilityTimeRecords(
    facilityId: string,
    startDate: Date,
    endDate: Date,
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedResponse<TimeRecord>> {
    const db = getDb();

    const offset = (page - 1) * limit;

    const [items, countResult] = await Promise.all([
      db
        .select()
        .from(timeRecords)
        .where(
          and(
            eq(timeRecords.facilityId, facilityId),
            gte(timeRecords.clockInTime, startDate),
            lte(timeRecords.clockInTime, endDate),
            isNull(timeRecords.deletedAt)
          )
        )
        .orderBy(desc(timeRecords.clockInTime))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(timeRecords)
        .where(
          and(
            eq(timeRecords.facilityId, facilityId),
            gte(timeRecords.clockInTime, startDate),
            lte(timeRecords.clockInTime, endDate),
            isNull(timeRecords.deletedAt)
          )
        ),
    ]);

    const total = Number(countResult[0]?.count || 0);

    return {
      items: items as unknown as TimeRecord[],
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  static async approveTimeRecord(
    facilityId: string,
    recordId: string,
    approvalNotes?: string
  ): Promise<TimeRecord> {
    const db = getDb();

    await this.getTimeRecord(facilityId, recordId);

    const updated = await db
      .update(timeRecords)
      .set({
        isApproved: true,
        approvalNotes,
        updatedAt: new Date(),
      })
      .where(eq(timeRecords.id, recordId))
      .returning();

    return updated[0] as unknown as TimeRecord;
  }

  static async rejectTimeRecord(facilityId: string, recordId: string, reason: string): Promise<TimeRecord> {
    const db = getDb();

    await this.getTimeRecord(facilityId, recordId);

    const updated = await db
      .update(timeRecords)
      .set({
        isApproved: false,
        approvalNotes: reason,
        updatedAt: new Date(),
      })
      .where(eq(timeRecords.id, recordId))
      .returning();

    return updated[0] as unknown as TimeRecord;
  }

  static calculateHours(startTime: Date, endTime: Date | null): number {
    if (!endTime) {
      return 0;
    }
    return differenceInHours(endTime, startTime);
  }

  static calculateMinutes(startTime: Date, endTime: Date | null): number {
    if (!endTime) {
      return 0;
    }
    return differenceInMinutes(endTime, startTime);
  }

  static async exportPayrollCSV(facilityId: string, startDate: Date, endDate: Date): Promise<string> {
    const db = getDb();

    const records = await db
      .select()
      .from(timeRecords)
      .where(
        and(
          eq(timeRecords.facilityId, facilityId),
          gte(timeRecords.clockInTime, startDate),
          lte(timeRecords.clockInTime, endDate),
          eq(timeRecords.isApproved, true),
          isNull(timeRecords.deletedAt)
        )
      );

    let csv = "User ID,Clock In,Clock Out,Hours,Location\n";

    for (const record of records) {
      const hours = record.clockOutTime ? this.calculateHours(record.clockInTime, record.clockOutTime) : 0;
      csv += `${record.userId},${record.clockInTime},${record.clockOutTime || ""},${hours},${record.checkInLocation}\n`;
    }

    return csv;
  }

  private static checkGeofence(
    latitude: number,
    longitude: number,
    centerLat: number,
    centerLon: number,
    radiusMeters: number
  ): boolean {
    const R = 6371000; // Earth's radius in meters
    const lat1 = (centerLat * Math.PI) / 180;
    const lat2 = (latitude * Math.PI) / 180;
    const deltaLat = ((latitude - centerLat) * Math.PI) / 180;
    const deltaLon = ((longitude - centerLon) * Math.PI) / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance <= radiusMeters;
  }

  private static getGeolocationName(latitude: number, longitude: number): string {
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
}
