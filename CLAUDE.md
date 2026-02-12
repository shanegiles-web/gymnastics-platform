# CLAUDE.md — Gymnastics Facility Management Platform

## Project Overview

Multi-tenant SaaS platform for gymnastics facilities. Manages classes, students, staff, billing, events, and communications. Currently deployed on Railway with core auth and basic CRUD working.

**Live:** https://gymnastics-manager-production.up.railway.app
**Repo structure:** Monorepo with `/client` (React) and `/server` (Express)

## Build & Run Commands

```bash
# Install everything
npm install              # root dependencies
cd client && npm install # frontend
cd server && npm install # backend

# Development
npm run dev              # starts both client and server concurrently
cd client && npm run dev # frontend only (Vite, port 5173)
cd server && npm run dev # backend only (tsx watch, port 3001)

# Build
cd client && npm run build  # production React build
cd server && npm run build  # compile TypeScript

# Database
cd server && npm run db:generate  # generate Drizzle migrations
cd server && npm run db:migrate   # run migrations
cd server && npm run db:push      # push schema changes (dev only)
cd server && npm run db:seed      # seed demo data

# Testing
npm test                          # run all tests
cd server && npm test             # backend tests (Jest)
cd client && npm test             # frontend tests (Jest + RTL)
cd server && npm run test:watch   # watch mode

# Linting
npm run lint                      # ESLint across project
npm run lint:fix                  # auto-fix
npm run typecheck                 # TypeScript strict check
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui components |
| State | React Query (server state) + Zustand (client state) |
| Backend | Node.js + Express + TypeScript |
| ORM | Drizzle ORM |
| Database | PostgreSQL (multi-tenant, schema-per-facility) |
| Auth | JWT access tokens (24h) + refresh tokens (7d) |
| Payments | Stripe Connect |
| Email | SendGrid |
| SMS | Twilio |
| Storage | AWS S3 + CloudFront |
| Deploy | Railway (auto-deploy from GitHub main branch) |

## Architecture Rules

### Multi-Tenant Isolation (CRITICAL)

Every database operation, API endpoint, and file storage operation MUST be scoped to the current tenant (facility). Never allow cross-tenant data access.

```typescript
// ALWAYS: Extract facility_id from the authenticated JWT, never from request params
const facilityId = req.user.facilityId;

// ALWAYS: Include facility_id in every query WHERE clause
const students = await db.select().from(schema.students)
  .where(eq(schema.students.facilityId, facilityId));

// NEVER: Trust client-provided facility IDs for data access
// NEVER: Join across tenant schemas
// NEVER: Return error messages that leak other tenants' data
```

### COPPA Compliance (CRITICAL)

Children under 13 are core users (gymnasts). All code handling child data must:

1. Verify parental consent exists before storing child data
2. Encrypt PII at rest (medical info, emergency contacts)
3. Never expose child data to unauthorized users
4. Respect data retention limits (2 years past age of majority)
5. Log all access to child data for audit trail

### API Response Format

All endpoints return this envelope:

```typescript
// Success
{ success: true, data: T, meta?: { page, limit, total } }

// Error
{ success: false, error: { code: string, message: string, details?: any } }
```

### Authentication Pattern

```typescript
// Every protected route uses this middleware chain:
router.get('/resource',
  authenticate,        // validates JWT, sets req.user
  validateTenant,      // confirms tenant context matches
  authorize('admin', 'manager'),  // checks role permissions
  handler
);
```

## Code Style & Conventions

### TypeScript
- Strict mode enabled (`strict: true` in tsconfig)
- No `any` types — use `unknown` and narrow
- Prefer interfaces over type aliases for object shapes
- Export types separately: `export type { MyType }`

### React Components
- Functional components only (no class components)
- Named exports (no default exports except pages)
- Props interface defined above component: `interface ButtonProps { ... }`
- Use shadcn/ui components from `@/components/ui/` — don't reinvent
- Custom components go in `@/components/` organized by feature

### File Naming
```
client/src/
  components/
    ui/              # shadcn/ui primitives (button, input, card, etc.)
    layout/          # Header, Sidebar, Footer, PageLayout
    features/        # Feature-specific components
      students/      # StudentCard, StudentForm, StudentList
      classes/       # ClassCalendar, ClassForm, ClassRoster
      billing/       # InvoiceTable, PaymentForm
  pages/             # Route-level page components
  hooks/             # Custom React hooks (useStudents, useAuth, etc.)
  lib/               # Utilities (api client, formatters, validators)
  contexts/          # React contexts (AuthContext)
  types/             # Shared TypeScript types

server/src/
  routes/            # Express route handlers (auth.routes.ts, students.routes.ts)
  services/          # Business logic (auth.service.ts, student.service.ts)
  middleware/        # Express middleware (auth, tenant, validation, rateLimiting)
  db/
    schema/          # Drizzle schema definitions
    migrations/      # Generated migration files
    seed/            # Seed data scripts
  types/             # Server-side types
  utils/             # Server utilities (encryption, validators)
```

### Naming Conventions
- Files: `kebab-case.ts` (e.g., `student-service.ts`)
- React components: `PascalCase.tsx` (e.g., `StudentCard.tsx`)
- Functions/variables: `camelCase`
- Database tables: `snake_case`
- API endpoints: `kebab-case` (e.g., `/api/v1/class-templates`)
- Constants: `UPPER_SNAKE_CASE`
- Types/Interfaces: `PascalCase`

### Git Commits
Format: `type(scope): description`

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`, `perf`

Examples:
```
feat(billing): add Stripe Connect integration for recurring payments
fix(auth): resolve rate limiting on token validation endpoint
test(students): add tenant isolation tests for student queries
refactor(scheduling): extract class template logic into service layer
```

## Database Conventions

### Standard Columns (every tenant table)
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
facility_id UUID NOT NULL        -- tenant isolation
created_at  TIMESTAMP DEFAULT NOW()
updated_at  TIMESTAMP DEFAULT NOW()
created_by  UUID                 -- audit trail
updated_by  UUID                 -- audit trail
deleted_at  TIMESTAMP NULL       -- soft delete (never hard delete user data)
```

### Drizzle Schema Pattern
```typescript
// server/src/db/schema/students.ts
import { pgTable, uuid, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';

export const students = pgTable('students', {
  id: uuid('id').primaryKey().defaultRandom(),
  facilityId: uuid('facility_id').notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  dateOfBirth: timestamp('date_of_birth'),
  isMinor: boolean('is_minor').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});
```

### Query Pattern
```typescript
// ALWAYS filter by facilityId AND check deleted_at
const activeStudents = await db.select()
  .from(schema.students)
  .where(
    and(
      eq(schema.students.facilityId, facilityId),
      isNull(schema.students.deletedAt)
    )
  );
```

## Testing Requirements

### Every new feature must include:
1. **Unit tests** for service/business logic (Jest)
2. **API integration tests** for route handlers (Supertest)
3. **Tenant isolation test** proving data doesn't leak between facilities
4. **COPPA test** if the feature touches child data

### Test File Location
- `server/src/__tests__/` for backend tests
- `client/src/__tests__/` for frontend tests
- Test files named: `feature-name.test.ts` or `FeatureName.test.tsx`

### Test Pattern
```typescript
describe('StudentService', () => {
  let facilityA: string;
  let facilityB: string;

  beforeEach(async () => {
    facilityA = await createTestFacility('Gym A');
    facilityB = await createTestFacility('Gym B');
  });

  it('should not return students from another facility', async () => {
    await createStudent(facilityA, { name: 'Alice' });
    const results = await studentService.list(facilityB);
    expect(results).toHaveLength(0);
  });
});
```

## Error Handling

### Backend
```typescript
// Use typed errors
class AppError extends Error {
  constructor(public code: string, message: string, public statusCode: number = 400) {
    super(message);
  }
}

// Service layer throws AppError
throw new AppError('STUDENT_NOT_FOUND', 'Student not found', 404);

// Global error handler catches and formats
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: { code: err.code || 'INTERNAL_ERROR', message: err.message }
  });
});
```

### Frontend
```typescript
// React Query handles API errors automatically
// Use error boundaries for unexpected crashes
// Show toast notifications for user-facing errors
```

## Security Checklist (for every feature)

- [ ] All routes behind `authenticate` middleware
- [ ] Tenant isolation via `facilityId` from JWT (not request body)
- [ ] Input validation using zod schemas
- [ ] SQL injection prevented (parameterized queries via Drizzle ORM)
- [ ] XSS prevented (React escapes by default; never use `dangerouslySetInnerHTML`)
- [ ] Rate limiting applied to public endpoints
- [ ] Sensitive data encrypted at rest (medical info, payment references)
- [ ] Audit log entries for admin actions and data access
- [ ] COPPA consent verified before storing child data

## Design System Reference

See `DESIGN_SYSTEM.md` in project root for complete visual design specifications including colors, typography, spacing, component patterns, and per-role UI guidelines. All frontend work must follow the design system for consistency.

## Key Demo Accounts

```
Facility Admin: admin@demo.gymnasticsapp.com / Admin123!
Staff:          staff@demo.gymnasticsapp.com / Staff123!
Parent:         parent@demo.gymnasticsapp.com / Parent123!
Global Admin:   admin@gymnastics-platform.com / GlobalAdmin123!
```

## Known Gotchas

1. **Rate limiting**: Login endpoint allows 20 req/15min, validation allows 200 req/min. Don't make these too aggressive or auth loops happen.
2. **Unified login**: There is ONE login page at `/login`. No separate global admin login route. The backend detects user type and routes accordingly.
3. **Drizzle ORM**: Use `db.select()` not `db.query()` for complex queries. Schema push (`db:push`) for dev, migrations (`db:generate` + `db:migrate`) for production.
4. **shadcn/ui**: Components are copied into the project (not imported from a package). Add new ones with `npx shadcn-ui@latest add <component>`.
5. **Environment variables**: Railway injects `DATABASE_URL` automatically. Never commit `.env` files.
