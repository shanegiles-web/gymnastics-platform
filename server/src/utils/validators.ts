import { z } from "zod";

// Common fields
export const emailSchema = z.string().email("Invalid email address").toLowerCase();

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(/[!@#$%^&*]/, "Password must contain a special character (!@#$%^&*)");

export const uuidSchema = z.string().uuid("Invalid UUID");

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// Auth schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  facilityId: z.string().uuid("Invalid facility ID"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: passwordSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export const resendVerificationSchema = z.object({
  email: emailSchema,
});

// Family schemas
export const createFamilySchema = z.object({
  headOfHousehold: z.string().min(1, "Head of household name is required").max(200),
  email: emailSchema,
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  addressLine1: z.string().min(1, "Address is required").max(255),
  addressLine2: z.string().max(255).optional().nullable(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(2, "State is required").max(100),
  postalCode: z.string().min(1, "Postal code is required").max(20),
  country: z.string().min(1, "Country is required").max(100),
});

export const updateFamilySchema = createFamilySchema.partial();

// Student schemas
export const createStudentSchema = z.object({
  familyId: uuidSchema,
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  dateOfBirth: z.string().date("Invalid date of birth"),
  gender: z.enum(["male", "female", "other"]),
  skillLevel: z.enum(["beginner", "intermediate", "advanced", "elite"]).default("beginner"),
  allergies: z.string().max(1000).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  photoUrl: z.string().url().optional().nullable(),
  medicalInfo: z.string().max(2000).optional().nullable(),
  emergencyContacts: z
    .array(
      z.object({
        name: z.string().min(1, "Contact name is required").max(100),
        relationship: z.string().min(1, "Relationship is required").max(50),
        phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
        email: emailSchema.optional(),
      })
    )
    .min(1, "At least one emergency contact is required"),
});

export const updateStudentSchema = createStudentSchema.partial();

// Class schemas
export const createClassSchema = z.object({
  name: z.string().min(1, "Class name is required").max(100),
  description: z.string().max(1000).optional().nullable(),
  skillLevel: z.enum(["beginner", "intermediate", "advanced", "elite"]),
  maxCapacity: z.number().int().positive("Capacity must be positive"),
  minAgeMonths: z.number().int().nonnegative().optional().nullable(),
  maxAgeMonths: z.number().int().positive().optional().nullable(),
  coachIds: z.array(uuidSchema).min(1, "At least one coach is required"),
  pricePerMonth: z.number().positive("Price must be positive"),
});

export const updateClassSchema = createClassSchema.partial();

export const createScheduleSchema = z.object({
  classId: uuidSchema,
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  recurrenceRule: z.string().min(1, "Recurrence rule is required"),
});

export const enrollmentSchema = z.object({
  classId: uuidSchema,
  studentId: uuidSchema,
  startDate: z.string().date("Invalid start date"),
  endDate: z.string().date("Invalid end date").optional().nullable(),
});

// Billing schemas
export const createPaymentMethodSchema = z.object({
  familyId: uuidSchema,
  type: z.enum(["credit_card", "debit_card", "bank_account"]),
  stripePaymentMethodId: z.string().min(1, "Stripe payment method ID is required"),
  lastFourDigits: z.string().length(4, "Last four digits must be 4 characters"),
  expiryMonth: z.number().int().min(1).max(12).optional().nullable(),
  expiryYear: z.number().int().min(2024).optional().nullable(),
  isDefault: z.boolean().default(false),
});

export const createInvoiceSchema = z.object({
  familyId: uuidSchema,
  dueDate: z.string().date("Invalid due date"),
  items: z.array(
    z.object({
      description: z.string().min(1, "Description is required").max(255),
      quantity: z.number().int().positive("Quantity must be positive"),
      unitPrice: z.number().positive("Unit price must be positive"),
    })
  ),
  notes: z.string().max(1000).optional().nullable(),
});

export const processPaymentSchema = z.object({
  invoiceId: uuidSchema,
  paymentMethodId: uuidSchema,
  amount: z.number().positive("Amount must be positive"),
});

// Waiver schemas
export const createWaiverTemplateSchema = z.object({
  name: z.string().min(1, "Waiver name is required").max(200),
  version: z.string().min(1, "Version is required").max(50),
  content: z.string().min(100, "Content must be at least 100 characters"),
  effectiveDate: z.string().date("Invalid effective date"),
});

export const signWaiverSchema = z.object({
  waiverTemplateId: uuidSchema,
  studentId: uuidSchema,
  signature: z.string().min(1, "Signature is required"),
});

// Attendance schemas
export const checkInSchema = z.object({
  classInstanceId: uuidSchema,
  studentId: uuidSchema,
});

export const checkOutSchema = z.object({
  classInstanceId: uuidSchema,
  studentId: uuidSchema,
});

export const markAbsentSchema = z.object({
  classInstanceId: uuidSchema,
  studentId: uuidSchema,
  status: z.enum(["absent", "excused", "late"]),
  notes: z.string().max(500).optional().nullable(),
});

// Timeclock schemas
export const clockInSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const clockOutSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const approveTimeRecordSchema = z.object({
  recordId: uuidSchema,
  approvalNotes: z.string().max(500).optional(),
});

// Message schemas
export const sendMessageSchema = z.object({
  conversationId: uuidSchema,
  content: z.string().min(1, "Message content is required").max(5000),
  attachmentUrl: z.string().url().optional().nullable(),
});

export const createConversationSchema = z.object({
  participantIds: z.array(uuidSchema).min(2, "At least 2 participants required"),
  subject: z.string().max(200).optional().nullable(),
});

// Admin schemas
export const createSubscriptionPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required").max(100),
  description: z.string().max(500).optional(),
  pricePerMonth: z.number().positive("Price must be positive"),
  maxClasses: z.number().int().positive(),
  maxUsers: z.number().int().positive(),
  features: z.array(z.string()).default([]),
});

export const createFacilitySchema = z.object({
  name: z.string().min(1, "Facility name is required").max(200),
  domain: z.string().min(1, "Domain is required").max(255),
  adminEmail: emailSchema,
  adminPassword: passwordSchema,
  addressLine1: z.string().min(1, "Address is required").max(255),
  addressLine2: z.string().max(255).optional().nullable(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(2, "State is required").max(100),
  postalCode: z.string().min(1, "Postal code is required").max(20),
  country: z.string().min(1, "Country is required").max(100),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
});
