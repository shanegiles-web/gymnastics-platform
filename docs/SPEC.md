# Gymnastics Facility Management Platform
## Consolidated Design & Application Specification for Auto-Claude
### Version 3.0 — Single Source of Truth

---

## 1. Project Overview

### What This Is
A multi-tenant SaaS platform for gymnastics facilities to manage classes, students, staff, billing, events, communications, and business operations. The platform replaces fragmented tools (spreadsheets, paper waivers, separate billing systems) with a single integrated solution.

### Current State
The platform has a working production deployment on Railway with core authentication, multi-tenant database architecture, and basic CRUD operations. The following has been completed and verified:

**Completed & Deployed:**
- Multi-tenant PostgreSQL database with schema-per-tenant isolation
- Row-level security policies preventing cross-tenant data access
- JWT authentication with unified login (global admin + facility users)
- Role-based access control (Admin, Staff, Coach, Parent, Student)
- Basic student/gymnast management (add, edit, view profiles)
- Basic class scheduling with instructor assignment
- React + TypeScript frontend with Tailwind CSS
- Node.js + Express backend with Drizzle ORM
- Railway deployment with automated CI/CD and SSL
- Rate limiting fix (production-appropriate limits)
- Single unified login system (no duplicate routes)

**Live URL:** https://gymnastics-manager-production.up.railway.app

**Demo Accounts:**
- Facility Admin: admin@demo.gymnasticsapp.com / Admin123!
- Staff: staff@demo.gymnasticsapp.com / Staff123!
- Parent: parent@demo.gymnasticsapp.com / Parent123!
- Global Platform Admin: admin@gymnastics-platform.com / GlobalAdmin123!

### Target Users
| Role | Description | Primary Needs |
|------|-------------|---------------|
| Gym Owner/Admin | Facility operators running the business | Full oversight, financials, staff management, settings |
| Manager | Day-to-day operations staff | Scheduling, member management, billing, events |
| Coach/Instructor | Teaching staff on the gym floor | Rosters, attendance, progress tracking, mobile access |
| Parent | Customers managing their children's enrollment | Registration, payments, progress viewing, communication |
| Gymnast | Students (often minors) | Schedule, progress, achievements |
| Super Admin | Platform operator (us) | Tenant provisioning, platform health, cross-tenant monitoring |

---

## 2. Technical Architecture

### Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 18 + TypeScript | Single-page app with React Router |
| Styling | Tailwind CSS + shadcn/ui | Clean, professional component library |
| State Management | React Query (server) + Zustand (client) | Minimal client state, server-driven |
| Backend | Node.js + Express + TypeScript | RESTful API with middleware pipeline |
| ORM | Drizzle ORM | Type-safe, lightweight, PostgreSQL-native |
| Database | PostgreSQL | Multi-tenant with schema isolation |
| Authentication | JWT (access + refresh tokens) | Tenant-aware tokens with role context |
| File Storage | AWS S3 | Tenant-isolated buckets with CloudFront CDN |
| Email | SendGrid | Transactional emails and bulk messaging |
| SMS | Twilio | Notifications and 2FA |
| Payments | Stripe Connect | Per-facility merchant accounts |
| Calendar Sync | Nylas Calendar API | Google, Outlook, Apple calendar sync |
| E-Signatures | DocuSign | Digital waivers and consent forms |
| Deployment | Railway | PostgreSQL, auto-deploy from GitHub, SSL |
| CI/CD | GitHub Actions | Lint, test, build, deploy pipeline |

### Multi-Tenant Database Design

Each gymnastics facility operates as an isolated tenant. The architecture uses a shared database with separate schemas per facility plus row-level security as a second layer of protection.

```
PostgreSQL Database
├── shared schema (platform-wide)
│   ├── facilities (tenant registry)
│   ├── facility_domains (custom domains per tenant)
│   ├── global_admins (platform administrators)
│   └── subscription_plans (pricing tiers)
├── facility_001 schema
│   ├── users
│   ├── students
│   ├── classes
│   ├── enrollments
│   ├── attendance
│   ├── payments
│   ├── invoices
│   ├── waivers
│   ├── messages
│   ├── events
│   ├── inventory
│   ├── time_records
│   └── tenant_config
├── facility_002 schema
│   └── (same table structure)
└── ...
```

**Tenant Isolation Rules (enforced everywhere):**
- Every API request validates tenant context from JWT before any DB operation
- Row-level security policies on all tenant tables as a secondary safeguard
- No query can ever join across tenant schemas
- File storage uses separate S3 prefixes or buckets per tenant
- Error messages never leak data from other tenants

### API Design Principles

All endpoints follow this pattern:
- Base URL: `/api/v1/{resource}`
- Tenant context: extracted from JWT, never from URL params
- Standard response envelope:

```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: any };
  meta?: { page?: number; limit?: number; total?: number };
}
```

- Authentication: Bearer token in Authorization header
- Rate limiting: differentiated by endpoint type (login: 20/15min, validation: 200/min, general: 1000/min)
- Input validation on every endpoint using zod schemas

### Security Requirements

| Requirement | Implementation |
|-------------|---------------|
| Encryption at rest | AES-256 for PII and financial data |
| Encryption in transit | TLS 1.3 on all connections |
| Password hashing | bcrypt with 12 salt rounds |
| Session management | JWT access tokens (24h) + refresh tokens (7d) |
| MFA | TOTP-based for admin/owner accounts (Phase 2) |
| COPPA compliance | Verifiable parental consent for children under 13, restricted data handling, retention policies |
| PCI DSS | Stripe handles card data; platform never stores raw card numbers |
| RBAC | Role + permission matrix enforced at middleware and UI levels |
| Audit logging | All sensitive operations logged with user, tenant, timestamp, action |
| Data retention | 7 years for adults, 2 years past age of majority for minors |

---

## 3. Feature Specification

Features are organized into three priority tiers. Each feature includes the user roles that interact with it and acceptance criteria for Auto-Claude's QA loop.

### PHASE 1: Core Platform (Must Have for Launch)

These features must all work together for a viable product. Some are partially built; others need to be built from scratch.

---

#### 1.1 User Authentication & Access Control
**Status:** ✅ Built (unified login, JWT, RBAC)
**Remaining Work:** Password reset email flow, email verification on signup, remember-me functionality, session invalidation on password change.

**Acceptance Criteria:**
- Users log in at `/login` regardless of role type
- System routes users to correct dashboard based on role
- Invalid credentials show clear error message
- Locked accounts after 10 failed attempts (with unlock email)
- Password reset sends email with secure, time-limited token
- JWT refresh works transparently without forcing re-login

---

#### 1.2 Member Registration & Family Management
**Status:** 🔄 Partially built (basic student CRUD exists)
**Build:** Complete family-centric registration system.

**Features:**
- Family account creation with parent as primary account holder
- Add multiple children under one family account
- Support blended families (two parents, separate billing addresses)
- Custom registration forms configurable per facility
- Required fields: name, DOB, emergency contacts, medical conditions, allergies
- COPPA consent workflow for children under 13 (collect parental consent before storing child data)
- Skill level assignment during registration (beginner, intermediate, advanced, team)
- Auto-link family members for billing consolidation

**Acceptance Criteria:**
- Parent can register and add 3+ children in one flow
- Separate billing contacts can be assigned per child
- COPPA consent is captured and stored before any child data is persisted
- Emergency contacts display on coach class rosters
- Admin can customize which fields are required vs optional
- Duplicate detection warns when email or phone already exists

---

#### 1.3 Class Scheduling & Management
**Status:** 🔄 Basic class creation exists
**Build:** Full scheduling system with calendar views, recurring classes, and resource management.

**Features:**
- Calendar view (day, week, month) with color-coding by class type
- Recurring class creation with RRULE patterns (e.g., "Mon/Wed/Fri 4-5pm for 12 weeks")
- Template system: save class configurations as reusable templates ("Beginner Girls 6-8", "Competitive Team Practice")
- Capacity management with enrollment caps and waitlists
- Instructor assignment with conflict detection (no double-booking instructors)
- Equipment/room allocation (vault, bars, beam, floor, tumble track)
- Holiday/closure exception handling per facility
- Class cancellation with automatic parent notification
- Makeup class scheduling and tracking
- Drag-and-drop rescheduling (Phase 2 enhancement)

**Acceptance Criteria:**
- Create a recurring class that generates instances across a date range
- System prevents scheduling an instructor for two overlapping classes
- Waitlist activates when enrollment cap is reached, auto-enrolls when spot opens
- Canceling a class instance sends notification to all enrolled families
- Templates can be applied to create new classes with one click
- Calendar renders correctly on desktop and mobile

---

#### 1.4 Payment Processing & Billing
**Status:** ❌ Not built
**Build:** Full billing system with Stripe Connect integration.

**Features:**
- Stripe Connect integration (each facility gets a connected Stripe account)
- Automated recurring billing for monthly memberships/tuition
- One-time charges for events, pro shop purchases, registration fees
- Family billing consolidation (one invoice per family, multiple children)
- Multiple payment methods per family (credit card, ACH/bank transfer)
- Payment plans with installment scheduling
- Automated late payment reminders (3-day, 7-day, 14-day)
- Credit/refund management
- Discount codes and promotional pricing
- Financial dashboard showing revenue, outstanding balances, payment trends
- Invoice generation (PDF) with facility branding
- Auto-pay enrollment with ability to pause

**Acceptance Criteria:**
- Parent can add a credit card and set up auto-pay for monthly tuition
- System charges the correct amount on the billing date without manual intervention
- Failed payments trigger retry logic (retry after 3 days, then 7 days)
- Late payment notifications sent automatically
- Admin can view total revenue, outstanding balances, and payment history
- Refunds process back to original payment method via Stripe
- Family with 3 children receives one consolidated monthly invoice

---

#### 1.5 Digital Waivers & Forms
**Status:** ❌ Not built
**Build:** Electronic waiver system with e-signature capture.

**Features:**
- Customizable waiver templates per facility
- Electronic signature capture (typed name + checkbox for now; DocuSign integration in Phase 2)
- Automatic annual renewal reminders
- Medical information forms with encrypted storage
- Emergency contact forms
- Photo/video release forms
- Custom form builder for facility-specific needs
- PDF generation of signed waivers for records
- COPPA-specific consent forms for children under 13
- Admin dashboard showing waiver status (signed, expired, missing) per student

**Acceptance Criteria:**
- New registration requires waiver completion before class enrollment
- Expired waivers trigger reminder notifications and block check-in
- Admin can see which students have missing or expired waivers
- Signed waivers are stored with timestamp, IP address, and signer identity
- Medical information is encrypted at rest and only visible to authorized roles (admin, coach with that student)
- PDF download of any signed waiver is available

---

#### 1.6 Attendance Tracking
**Status:** 🔄 Basic check-in exists
**Build:** Full attendance system with mobile support and reporting.

**Features:**
- Quick check-in interface for front desk staff (search by name, scan barcode)
- Coach mobile check-in (mark attendance from class roster on phone/tablet)
- Automatic attendance recording when check-in happens
- Absence tracking with configurable alerts (e.g., notify parent after 3 consecutive absences)
- Makeup class credit tracking (student missed class X, has 1 makeup credit)
- Attendance reports by class, instructor, student, and date range
- Late arrival tracking
- Integration with billing (attendance-based billing option)

**Acceptance Criteria:**
- Front desk can check in a student in under 5 seconds
- Coach sees real-time roster with checked-in students highlighted
- Attendance report shows percentage for any student over any date range
- Makeup credits are automatically created when a student is marked absent
- Parent can see their child's attendance history in their portal

---

#### 1.7 Employee Time Clock
**Status:** ❌ Not built
**Build:** Time tracking system for facility staff.

**Features:**
- Clock in/out via mobile app or web interface
- GPS verification (employee must be within facility geofence)
- Break time tracking
- Shift scheduling with weekly templates
- Overtime calculation and alerts
- Payroll export (CSV for import into QuickBooks, ADP, Paychex)
- Time record approval workflow (manager reviews before payroll)
- Class-specific time tracking (which classes did a coach teach)
- Labor cost reports per program/class type

**Acceptance Criteria:**
- Employee clocks in from mobile within 200m of facility GPS coordinates
- Clock-in outside geofence is rejected with clear error message
- Manager can view, edit, and approve time records before payroll export
- Overtime alerts trigger when employee approaches 40 hours in a week
- Payroll CSV export matches format required by common payroll providers

---

#### 1.8 New Gymnast Onboarding
**Status:** ❌ Not built
**Build:** Guided multi-step workflow for new student registration.

**Features:**
- Step-by-step wizard: Account creation → Child info → Medical info → Waiver → Skill assessment → Class selection → Payment → Confirmation
- Progress saving (parent can leave and return to continue)
- Skill assessment questionnaire to recommend appropriate class level
- Automatic class placement suggestions based on age + skill level
- Welcome email with class schedule, facility info, what to bring
- Trial class booking option
- Referral tracking (how did you hear about us)

**Acceptance Criteria:**
- New parent can complete full onboarding in under 10 minutes
- Partial registration is saved and can be resumed later
- Skill assessment correctly suggests class level based on answers
- Welcome email sends automatically upon completion
- Admin sees new registrations in a queue for review/approval

---

### PHASE 2: Growth Features (Competitive Advantage)

These features are built after Phase 1 is stable and being used by real facilities.

---

#### 2.1 Drag-and-Drop Scheduling Interface
Enhanced scheduling with visual drag-and-drop, powered by FullCalendar or similar library.
- Drag classes to reschedule
- Visual resource timeline (see all rooms/equipment at once)
- Real-time conflict indicators (red highlight when double-booking)
- Undo/redo support
- Mobile-optimized with touch drag support

#### 2.2 Nylas Calendar API Integration
Sync facility schedules with instructors' and parents' personal calendars.
- Two-way sync with Google Calendar, Outlook, Apple Calendar
- Automatic schedule updates pushed to synced calendars
- Instructor availability pulled from personal calendar to prevent conflicts
- Virtual calendars for equipment/room booking

#### 2.3 Comprehensive Messaging System
Full internal communication platform.

**Message Types:**
- Direct messages (admin↔coach, admin↔parent, coach↔parent)
- Group messages by class, team, or custom group
- Facility-wide announcements (blast messages)
- Emergency notifications
- Schedule change alerts

**Delivery Channels:**
- In-app notification center
- Email (SendGrid)
- SMS (Twilio)
- Push notifications (Firebase)

**Controls:**
- Coach message approval workflows (configurable by gym owner)
- Parent-to-parent messaging toggle (gym owner controls)
- Message templates for common scenarios
- Read receipts for important announcements

#### 2.4 Point of Sale (POS) System
Pro shop and merchandise sales.
- Product catalog with variants (size, color)
- Inventory tracking with low-stock alerts
- Barcode scanning
- In-person checkout interface (tablet-optimized)
- Online store for parents
- Purchases linked to member accounts
- Gift card support
- Team uniform ordering workflows
- Staff/coach discounts

#### 2.5 Special Events Management
Birthday parties, camps, and special programs.

**Event Types:** Birthday parties, Parents Night Out, summer camps, open houses, workshops, competition viewing parties.

**Features:**
- Event packages with pricing (e.g., "Gold Birthday Package: 2hrs, 15 kids, pizza included")
- Time slot booking with equipment allocation
- Staff assignment per event
- Supply/catering coordination checklists
- Automated confirmation and reminder emails
- Post-event feedback collection
- Photo sharing (COPPA compliant)

#### 2.6 Parent Video Upload System
COPPA-compliant video management for skill documentation.
- Parents upload videos of their child practicing skills
- Videos tagged by skill type (vault, bars, beam, floor) and level
- Coach review and feedback workflow
- Strict COPPA compliance: verifiable parental consent before any video upload
- Privacy controls: only parent and assigned coaches can view
- H.264/H.265 compression, adaptive bitrate streaming (HLS)
- AWS S3 storage with CloudFront delivery, tenant-isolated
- Maximum upload size: 500MB per video

#### 2.7 Advanced Reporting & Analytics
- Class utilization rates (% capacity filled per class)
- Revenue by program type, month, and trend
- Member retention analysis (churn rate, average lifetime)
- Staff performance metrics (attendance accuracy, parent satisfaction)
- Financial reports (P&L summary, accounts receivable aging)
- Custom report builder with export to CSV/PDF
- Executive dashboard with KPI cards

#### 2.8 Advanced Employee Management
- Shift swap requests and approvals
- Class-specific time tracking (tie hours to specific programs)
- Labor cost analysis per program
- Employee certifications tracking (CPR, USA Gymnastics, background check)
- Automated reminders when certifications expire

---

### PHASE 3: Market Differentiators

These features set the platform apart from competitors like Jackrabbit Class and iClassPro.

---

#### 3.1 USA Gymnastics Skill Progression
- Full integration with USA Gymnastics JO levels 1-10
- Xcel division support (Bronze, Silver, Gold, Platinum, Diamond)
- Digital skill charts with star-based ratings per skill
- Coach can update skills from mobile during/after class
- Automated notifications when a gymnast achieves a new skill
- Progress history timeline per student
- Visual skill tree showing what's mastered vs. in progress

#### 3.2 Competition/Meet Management
- Meet registration workflows
- Athlete eligibility verification (age, level, membership status)
- Music file uploads for floor routines
- Real-time scoring integration
- Live results display (web page parents can watch)
- Multi-location meet coordination
- Volunteer sign-up and coordination
- Automated award calculations
- Historical performance tracking

#### 3.3 AI-Powered Features
- Predictive retention analysis (identify students at risk of leaving)
- Smart scheduling optimization (recommend class times based on historical demand)
- Automated class placement suggestions
- Chatbot for common parent inquiries (hours, pricing, class availability)
- Revenue forecasting

#### 3.4 Marketing & Retention Tools
- Automated email campaigns (welcome series, re-engagement, birthday)
- Referral program tracking
- Lead management (inquiry → trial → enrollment pipeline)
- Social media integration for achievement sharing
- Targeted promotions based on member segments

#### 3.5 Multi-Location Management
- Centralized dashboard across all facility locations
- Location-specific configurations (different schedules, pricing, staff)
- Consolidated financial reporting across locations
- Staff scheduling across sites
- Student transfer between locations

#### 3.6 Third-Party Integrations
- QuickBooks/Xero (accounting sync)
- ADP/Paychex/Gusto (payroll export)
- Mailchimp/Constant Contact (marketing)
- Background check providers
- Insurance provider integrations
- Zapier/Make webhooks for custom automation

---

## 4. User Interface Design

### Design System

**Inspiration:** Linear app (clean, data-dense, professional) with Stripe dashboard (financial clarity) influences.

**Color Palette:**
- Primary: `#5E6AD2` (indigo — action buttons, active states, links)
- Secondary: `#26272B` (dark charcoal — headers, navigation backgrounds)
- Success: `#00BA88` (green — confirmations, positive metrics)
- Warning: `#F59E0B` (amber — alerts, pending states)
- Error: `#EF4444` (red — errors, destructive actions)
- Neutrals: `#FAFAFA` (background) through `#171717` (text) — full grayscale ramp

**Typography:**
- Font family: Inter (primary), SF Mono (code/data)
- Scale: 12px (xs) → 36px (4xl)
- Weights: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

**Spacing:** 4px base unit, scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px

**Border radius:** 4px (sm), 6px (base), 8px (md), 12px (lg)

**Shadows:** Subtle, used sparingly — cards get `base` shadow, modals get `lg` shadow.

### Page Layouts by Role

**Admin Dashboard:** Sidebar navigation + main content area. Top-level KPI cards (revenue, active students, attendance rate, upcoming events). Quick-action buttons. Data tables with search, sort, and filter.

**Coach Interface:** Mobile-first. Today's classes at a glance. Tap into class → see roster with attendance toggles. Quick-access to emergency contacts. Progress note entry.

**Parent Portal:** Clean cards showing each child's upcoming classes, progress summary, balance due. Quick links to make payment, register for events, message coach.

**Login Page:** Centered card with email/password fields, demo credentials displayed below, facility branding at top.

### Responsive Breakpoints
- Mobile: < 640px (single column, bottom navigation)
- Tablet: 640-1024px (collapsible sidebar, adapted layouts)
- Desktop: > 1024px (full sidebar, multi-column layouts)

---

## 5. Database Schema (Core Tables)

All tenant tables include these standard columns:
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
facility_id     UUID NOT NULL (tenant isolation)
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
created_by      UUID
updated_by      UUID
deleted_at      TIMESTAMP NULL (soft delete)
```

### Key Entity Relationships

```
facilities (shared schema)
  └── users (one facility has many users)
        ├── role: ADMIN | MANAGER | COACH | PARENT | STUDENT
        └── family_links (parent ↔ student relationships)
              └── students
                    ├── enrollments → classes
                    ├── attendance_records → classes
                    ├── skill_records
                    ├── waivers (signed documents)
                    └── medical_info (encrypted)

classes
  ├── class_templates (reusable configurations)
  ├── class_instances (individual scheduled occurrences)
  ├── enrollments (students registered)
  ├── attendance_records
  ├── instructor assignment → users (role=COACH)
  └── resource_allocations → rooms, equipment

payments
  ├── invoices (monthly consolidated)
  ├── payment_methods (Stripe references, never raw card data)
  ├── transactions (individual charges/refunds)
  └── payment_plans (installment schedules)

messages
  ├── conversations (thread container)
  ├── messages (individual messages within conversation)
  └── message_recipients (who receives, read status)

events
  ├── event_templates (birthday package definitions)
  ├── event_bookings (specific date/time reservations)
  └── event_resources (staff, rooms, equipment assigned)

time_records
  ├── clock_in/out timestamps
  ├── break_records
  └── payroll_exports

inventory
  ├── products (pro shop items)
  ├── product_variants (sizes, colors)
  ├── stock_levels
  └── sales_transactions
```

---

## 6. API Endpoint Map

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/login | Unified login (all user types) |
| POST | /api/v1/auth/logout | Invalidate session |
| POST | /api/v1/auth/refresh | Refresh access token |
| POST | /api/v1/auth/forgot-password | Send password reset email |
| POST | /api/v1/auth/reset-password | Reset password with token |
| GET | /api/v1/auth/validate | Validate current session |

### Members & Families
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/families | List families in facility |
| POST | /api/v1/families | Create family account |
| GET | /api/v1/families/:id | Get family details |
| PUT | /api/v1/families/:id | Update family |
| POST | /api/v1/families/:id/students | Add student to family |
| GET | /api/v1/students | List all students |
| GET | /api/v1/students/:id | Get student profile |
| PUT | /api/v1/students/:id | Update student |

### Classes & Scheduling
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/classes | List classes |
| POST | /api/v1/classes | Create class |
| PUT | /api/v1/classes/:id | Update class |
| DELETE | /api/v1/classes/:id | Cancel class |
| GET | /api/v1/classes/:id/roster | Get class roster |
| POST | /api/v1/classes/:id/enroll | Enroll student |
| DELETE | /api/v1/classes/:id/enroll/:studentId | Drop student |
| GET | /api/v1/schedule | Get calendar view |
| POST | /api/v1/class-templates | Create reusable template |
| POST | /api/v1/class-templates/:id/generate | Generate class instances from template |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/attendance/check-in | Check in student |
| GET | /api/v1/attendance/class/:classId | Get attendance for class |
| GET | /api/v1/attendance/student/:studentId | Get student attendance history |
| PUT | /api/v1/attendance/:id | Update attendance record |

### Payments & Billing
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/payments/setup-intent | Create Stripe setup intent |
| POST | /api/v1/payments/charge | Process one-time charge |
| GET | /api/v1/invoices | List invoices |
| GET | /api/v1/invoices/:id | Get invoice detail |
| POST | /api/v1/billing/subscriptions | Create recurring subscription |
| PUT | /api/v1/billing/subscriptions/:id | Update subscription |
| POST | /api/v1/payments/refund | Process refund |

### Waivers & Forms
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/waivers/templates | List waiver templates |
| POST | /api/v1/waivers/templates | Create waiver template |
| POST | /api/v1/waivers/sign | Submit signed waiver |
| GET | /api/v1/waivers/student/:studentId | Get waivers for student |
| GET | /api/v1/waivers/status | Dashboard waiver status overview |

### Messaging
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/conversations | List conversations |
| POST | /api/v1/conversations | Start new conversation |
| GET | /api/v1/conversations/:id/messages | Get messages in conversation |
| POST | /api/v1/conversations/:id/messages | Send message |
| POST | /api/v1/announcements | Send blast announcement |

### Time Clock
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/timeclock/clock-in | Clock in |
| POST | /api/v1/timeclock/clock-out | Clock out |
| GET | /api/v1/timeclock/records | Get time records |
| PUT | /api/v1/timeclock/records/:id | Edit time record |
| POST | /api/v1/timeclock/export | Export payroll CSV |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/events | List events |
| POST | /api/v1/events | Create event |
| POST | /api/v1/events/:id/book | Book event |
| GET | /api/v1/events/:id/bookings | Get bookings for event |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/analytics/dashboard | KPI summary |
| GET | /api/v1/analytics/revenue | Revenue reports |
| GET | /api/v1/analytics/attendance | Attendance reports |
| GET | /api/v1/analytics/retention | Retention metrics |

### Tenant Management (Super Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/admin/facilities | Provision new facility |
| GET | /api/v1/admin/facilities | List all facilities |
| PUT | /api/v1/admin/facilities/:id | Update facility |
| GET | /api/v1/admin/health | Platform health check |

---

## 7. COPPA Compliance Requirements

Since gymnasts are often children under 13, COPPA compliance is mandatory throughout the platform.

**Rules enforced across all features:**
1. No data about a child under 13 is collected or stored until verifiable parental consent is obtained
2. Parental consent records include: parent identity, consent method, timestamp, IP address
3. Parents can review all data collected about their child at any time
4. Parents can request deletion of their child's data
5. Child data has separate retention policies (2 years past age of majority in the facility's state)
6. Video/photo uploads of minors require explicit parental consent per upload type
7. Children under 13 cannot create their own accounts; parents create accounts on their behalf
8. Third-party data sharing requires separate explicit consent (2025 COPPA update)
9. All child data is encrypted at rest with tenant-specific encryption keys
10. Audit trail for all access to child data

---

## 8. Development Phases & Auto-Claude Task Breakdown

### Phase 1 Tasks (ordered by dependency)

| Task # | Feature | Dependencies | Estimated Complexity |
|--------|---------|-------------|---------------------|
| 001 | Password reset email flow | Auth system (exists) | Simple |
| 002 | Email verification on signup | Auth system (exists) | Simple |
| 003 | Family registration & management | Users table (exists) | Standard |
| 004 | Full class scheduling with templates | Classes table (exists) | Complex |
| 005 | Payment processing (Stripe Connect) | Families, Classes | Complex |
| 006 | Digital waivers & e-signatures | Families, Students | Standard |
| 007 | Attendance tracking system | Classes, Students | Standard |
| 008 | Employee time clock | Users (staff/coach roles) | Standard |
| 009 | New gymnast onboarding wizard | Families, Classes, Waivers, Payments | Complex |
| 010 | Admin reporting dashboard | All Phase 1 features | Standard |

### Phase 2 Tasks

| Task # | Feature | Dependencies | Estimated Complexity |
|--------|---------|-------------|---------------------|
| 011 | Drag-and-drop scheduling | Task 004 | Standard |
| 012 | Nylas calendar sync | Task 004 | Standard |
| 013 | Internal messaging system | Users, Families | Complex |
| 014 | Point of sale system | Payments (Task 005) | Complex |
| 015 | Event management & booking | Classes, Payments | Standard |
| 016 | Parent video uploads (COPPA) | Families, S3 storage | Complex |
| 017 | Advanced analytics & reporting | All Phase 1 data | Standard |
| 018 | Employee certification tracking | Time clock (Task 008) | Simple |

### Phase 3 Tasks

| Task # | Feature | Dependencies | Estimated Complexity |
|--------|---------|-------------|---------------------|
| 019 | USA Gymnastics skill progression | Students, Classes | Complex |
| 020 | Competition/meet management | Skill tracking, Students | Complex |
| 021 | AI retention predictions | Analytics data | Standard |
| 022 | Marketing automation | Messaging, Families | Standard |
| 023 | Multi-location management | Tenant architecture | Complex |
| 024 | Third-party integrations | Various | Standard each |

---

## 9. Testing Requirements

Every feature must include:

1. **Unit tests** for all business logic functions (>80% coverage)
2. **API integration tests** for every endpoint (request/response validation)
3. **Tenant isolation tests** confirming no cross-tenant data leakage
4. **COPPA compliance tests** for any feature touching child data
5. **UI component tests** for interactive elements (React Testing Library)

**Testing tools:**
- Backend: Jest + Supertest
- Frontend: Jest + React Testing Library
- E2E: Playwright (Phase 2)
- Load: k6 (Phase 2)

**Performance targets:**
- API response time: < 200ms (p95)
- Page load time: < 2 seconds
- Database query time: < 50ms (p95)
- Concurrent users: 10,000+ across all tenants

---

## 10. Deployment & Infrastructure

**Current setup (Railway):**
- Monorepo with `/client` (React) and `/server` (Express)
- Single Railway service with PostgreSQL add-on
- GitHub push to `main` triggers auto-deploy
- Environment variables managed in Railway dashboard

**Production checklist for each deployment:**
- All tests pass in CI
- No TypeScript errors
- Database migrations run successfully
- Health check endpoint responds
- No console errors on key user flows

**Environment variables required:**
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
SENDGRID_API_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...
NYLAS_CLIENT_ID=...
NYLAS_API_KEY=...
FRONTEND_URL=https://gymnastics-manager-production.up.railway.app
NODE_ENV=production
```

---

## 11. Business Model

**Subscription Tiers:**

| Tier | Price | Includes |
|------|-------|----------|
| Starter | $149/mo | 1 location, up to 200 students, core features (Phase 1) |
| Professional | $349/mo | 1-3 locations, up to 1000 students, Phase 1 + Phase 2 features |
| Enterprise | $699/mo | Unlimited locations/students, all features, priority support |
| Enterprise Plus | Custom | White-label, dedicated infrastructure, custom integrations |

**Target market:** 12,000+ gymnastics facilities in the US, ranging from small recreational gyms to large competitive training centers.

**Key competitors:** Jackrabbit Class ($49-$315/mo, 7,000+ clients), iClassPro (100M+ registrations), Gymdesk, Studio Director.

**Differentiators:** Modern UI/UX, true multi-tenant architecture, COPPA-first design, competitive pricing, mobile-first coach experience, integrated video and skill tracking.

---

## 12. Known Issues & Technical Debt

These items from previous development should be addressed:

1. **CSP warning about replit-dev-banner.js** — Harmless but should be cleaned up from any leftover Replit configuration
2. **Frontend validation** — Some forms lack client-side validation (currently relying only on server-side)
3. **Error boundary** — No global React error boundary to catch and display crashes gracefully
4. **Loading states** — Some pages lack skeleton loaders or loading indicators
5. **Mobile navigation** — Bottom nav needs polish on smaller screens
6. **API documentation** — No Swagger/OpenAPI spec auto-generated yet
7. **Database indexes** — Need to audit and add indexes for common query patterns as data grows
8. **Logging** — Need structured logging (JSON format) for production debugging
9. **Monitoring** — No Sentry or equivalent for error tracking yet

---

*This document consolidates all prior design docs, architecture plans, implementation notes, and bug fix summaries into a single specification. All previous documents (v1.0, v2.0, multi-agent architecture doc, implementation roadmap, auth fix notes, rate limiting prompts, and login cleanup prompts) are superseded by this document.*

*Version: 3.0*
*Date: February 1, 2026*
*Status: Active — Single Source of Truth*
