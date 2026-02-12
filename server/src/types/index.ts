import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        facilityId: string;
        role: "global_admin" | "admin" | "manager" | "coach" | "parent" | "student";
      };
    }
  }
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export interface User {
  id: string;
  facilityId: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: "admin" | "manager" | "coach" | "parent" | "student";
  emailVerifiedAt: Date | null;
  resetTokenHash: string | null;
  resetTokenExpires: Date | null;
  verificationTokenHash: string | null;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Family {
  id: string;
  facilityId: string;
  headOfHousehold: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Student {
  id: string;
  facilityId: string;
  familyId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: "male" | "female" | "other";
  skillLevel: "beginner" | "intermediate" | "advanced" | "elite";
  enrollmentStatus: "active" | "inactive" | "suspended";
  medicalInfoEncrypted: string | null;
  emergencyContacts: EmergencyContact[];
  allergies: string | null;
  notes: string | null;
  photoUrl: string | null;
  waiverStatus: "pending" | "signed" | "expired";
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface Class {
  id: string;
  facilityId: string;
  name: string;
  description: string | null;
  skillLevel: "beginner" | "intermediate" | "advanced" | "elite";
  maxCapacity: number;
  minAgeMonths: number | null;
  maxAgeMonths: number | null;
  minSkillLevel: string | null;
  maxSkillLevel: string | null;
  coachIds: string[];
  pricePerMonth: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface ClassSchedule {
  id: string;
  classId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  recurrenceRule: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface ClassInstance {
  id: string;
  classScheduleId: string;
  startDateTime: Date;
  endDateTime: Date;
  actualStartDateTime: Date | null;
  actualEndDateTime: Date | null;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Enrollment {
  id: string;
  classId: string;
  studentId: string;
  enrollmentDate: Date;
  startDate: Date;
  endDate: Date | null;
  status: "active" | "paused" | "completed" | "cancelled";
  position: number;
  isWaitlisted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface PaymentMethod {
  id: string;
  facilityId: string;
  familyId: string;
  type: "credit_card" | "debit_card" | "bank_account";
  stripePaymentMethodId: string;
  lastFourDigits: string;
  expiryMonth: number | null;
  expiryYear: number | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Invoice {
  id: string;
  facilityId: string;
  familyId: string;
  invoiceNumber: string;
  amount: number;
  dueDate: Date;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  items: InvoiceItem[];
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Payment {
  id: string;
  facilityId: string;
  invoiceId: string;
  amount: number;
  paymentMethod: "credit_card" | "debit_card" | "bank_account" | "cash" | "check";
  stripePaymentIntentId: string | null;
  status: "pending" | "completed" | "failed" | "refunded";
  paidAt: Date | null;
  refundedAt: Date | null;
  refundReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Subscription {
  id: string;
  facilityId: string;
  planId: string;
  status: "active" | "paused" | "cancelled";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelledAt: Date | null;
  cancelReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface WaiverTemplate {
  id: string;
  facilityId: string;
  name: string;
  version: string;
  content: string;
  effectiveDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface SignedWaiver {
  id: string;
  facilityId: string;
  waiverTemplateId: string;
  studentId: string;
  parentGuardianId: string;
  signature: string;
  ipAddress: string;
  userAgent: string;
  signedAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface AttendanceRecord {
  id: string;
  facilityId: string;
  classInstanceId: string;
  studentId: string;
  status: "present" | "absent" | "excused" | "late" | "left_early";
  checkInTime: Date | null;
  checkOutTime: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface TimeRecord {
  id: string;
  facilityId: string;
  userId: string;
  clockInTime: Date;
  clockOutTime: Date | null;
  latitude: number | null;
  longitude: number | null;
  checkInLocation: string | null;
  checkOutLocation: string | null;
  isApproved: boolean;
  approvedBy: string | null;
  approvalNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Message {
  id: string;
  facilityId: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachmentUrl: string | null;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Conversation {
  id: string;
  facilityId: string;
  participantIds: string[];
  subject: string | null;
  lastMessageAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
