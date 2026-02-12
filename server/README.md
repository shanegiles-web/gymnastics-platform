# Gymnastics Platform - Backend API

A production-quality Node.js + Express + TypeScript backend for a comprehensive gymnastics facility management platform with multi-tenant architecture, role-based access control, billing, waivers, attendance tracking, and timeclock functionality.

## Project Structure

```
server/
├── src/
│   ├── config/              # Configuration management
│   ├── db/
│   │   ├── schema/          # Database schema definitions (13 tables)
│   │   └── index.ts         # Database connection setup
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts          # JWT authentication & authorization
│   │   ├── error-handler.ts # Global error handling
│   │   ├── rate-limit.ts    # Rate limiting
│   │   └── validate.ts      # Zod validation
│   ├── routes/              # API route handlers (8 route modules)
│   ├── services/            # Business logic (8 services)
│   ├── utils/               # Utility functions
│   │   ├── encryption.ts    # AES-256 encryption
│   │   └── validators.ts    # Zod schemas
│   ├── types/               # TypeScript type definitions
│   └── index.ts             # Express app entry point
├── package.json             # Dependencies & scripts
├── tsconfig.json            # TypeScript configuration
├── drizzle.config.ts        # Drizzle ORM configuration
└── .env.example             # Environment variable template
```

## Database Schema

### Core Tables (13 tables)
1. **Shared**
   - facilities
   - facility_domains
   - subscription_plans
   - global_admins

2. **Users & Families**
   - users
   - families
   - family_billing_contacts
   - coppa_consent_records

3. **Students & Classes**
   - students
   - classes
   - class_schedules
   - class_instances
   - class_templates
   - enrollments
   - schedule_exceptions

4. **Billing**
   - payment_methods
   - invoices
   - payments
   - subscriptions

5. **Waivers**
   - waiver_templates
   - signed_waivers

6. **Attendance**
   - attendance_records

7. **Timeclock**
   - time_records

8. **Messages**
   - conversations
   - messages
   - message_recipients

## API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /admin/login` - Global admin login
- `POST /refresh` - Refresh JWT token
- `POST /logout` - Logout
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password
- `POST /verify-email` - Verify email address
- `POST /resend-verification` - Resend verification token
- `POST /validate` - Validate current token

### Families & Students (`/api/v1/families`)
- Family CRUD operations
- Student CRUD operations (encrypted medical info)
- COPPA consent recording and validation

### Classes & Scheduling (`/api/v1/classes`)
- Class CRUD operations
- Schedule management with RRULE support
- Class instance generation
- Student enrollment with waitlist support
- Class templates for bulk creation

### Billing (`/api/v1/billing`)
- Payment method management
- Invoice creation and management
- Payment processing (mocked Stripe)
- Refunds handling
- Subscription management
- Subscription plan listing

### Waivers (`/api/v1/waivers`)
- Waiver template CRUD
- Sign waivers (with PDF generation)
- Check waiver validity
- Track waiver expiration

### Attendance (`/api/v1/attendance`)
- Check-in/check-out
- Manual attendance marking
- Attendance reporting
- Attendance statistics

### Timeclock (`/api/v1/timeclock`)
- Clock in/out with GPS geofencing
- Time record management
- Approval workflow
- Payroll CSV export

### Admin (`/api/v1/admin`)
- Subscription plan management
- Facility CRUD
- Analytics dashboard (facility & global level)

## Key Features

### Security
- **JWT Authentication**: Bearer token-based auth with refresh tokens
- **Role-Based Access Control**: 6 roles (global_admin, admin, manager, coach, parent, student)
- **Rate Limiting**: Configurable in-memory rate limiter
- **Input Validation**: Zod schemas on all endpoints
- **AES-256 Encryption**: Medical information encrypted at rest
- **CORS & Helmet**: Security headers and origin validation
- **HTTPS Ready**: Production-ready configuration

### Multi-Tenancy
- All queries filtered by facilityId
- Tenant isolation enforced at middleware level
- Per-facility domain management
- Global admin dashboard

### Data Protection
- Soft deletes (deleted_at) on all tables
- COPPA compliance for children's data
- Encrypted medical information
- Password hashing with bcrypt

### Business Logic
- Class scheduling with recurrence rules (RRULE)
- Automatic class instance generation
- Enrollment with automatic waitlisting
- GPS geofencing for timeclock
- Invoice and payment management
- Subscription lifecycle management

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/gymnastics_db
JWT_SECRET=your-secret-key
# ... other vars
```

4. Setup database:
```bash
npm run db:generate
npm run db:migrate
npm run db:push
```

5. Start development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production server
- `npm run db:generate` - Generate migration files
- `npm run db:migrate` - Run migrations
- `npm run db:push` - Push schema changes to database
- `npm run test` - Run test suite
- `npm run lint` - Type check with TypeScript

## Environment Variables

See `.env.example` for all available configuration options:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - Refresh token secret
- `FRONTEND_URL` - CORS origin
- `STRIPE_SECRET_KEY` - Stripe API key (optional)
- `SENDGRID_API_KEY` - SendGrid API key (optional)
- `ENCRYPTION_KEY` - AES-256 encryption key
- Rate limiting and geofencing settings

## Response Format

All responses follow a consistent envelope:

**Success (2xx)**:
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

**Error (4xx, 5xx)**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": null  // Optional validation details
  }
}
```

## Error Codes

Common error codes:
- `MISSING_AUTH` - No authorization header
- `INVALID_TOKEN` - Invalid JWT token
- `TOKEN_EXPIRED` - Token has expired
- `INSUFFICIENT_PERMISSIONS` - User role lacks permission
- `VALIDATION_ERROR` - Request validation failed
- `NOT_FOUND` - Resource not found
- `ALREADY_EXISTS` - Resource already exists
- `RATE_LIMIT_EXCEEDED` - Too many requests

## Database Migrations

Using Drizzle ORM for type-safe database operations:

```bash
# Generate new migration
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema without migration files
npm run db:push
```

## Testing

Run the test suite:
```bash
npm run test

# Watch mode
npm run test:watch
```

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Set production environment variables in `.env`

3. Run migrations:
```bash
npm run db:migrate
```

4. Start the server:
```bash
npm start
```

## Security Checklist

- [ ] Update JWT_SECRET and JWT_REFRESH_SECRET
- [ ] Set ENCRYPTION_KEY to 32+ character random string
- [ ] Configure DATABASE_URL for production database
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Set up Stripe integration if needed
- [ ] Configure SendGrid for email (optional)
- [ ] Review and adjust rate limiting settings
- [ ] Enable database backups
- [ ] Use environment secrets management

## Architecture Patterns

### Service Layer Pattern
Business logic encapsulated in service classes with static methods:
```typescript
const user = await UserService.login(email, password);
```

### Middleware Chain
Express middleware for:
- Authentication (`authenticate`)
- Authorization (`authorize`)
- Tenant validation (`validateTenant`)
- Input validation (`validate`)
- Rate limiting (`rateLimit`)

### Type-Safe Database
Drizzle ORM provides:
- Schema-driven database design
- Type-safe queries
- SQL migrations
- Automatic types from schema

## Performance Considerations

- Connection pooling for database
- In-memory rate limiting (can be upgraded to Redis)
- Soft deletes with indexed deleted_at
- Pagination on all list endpoints
- Gzip compression
- Morgan request logging

## Future Enhancements

- [ ] Redis-based rate limiting
- [ ] Real Stripe integration
- [ ] Email notifications (SendGrid)
- [ ] WebSocket support for real-time messages
- [ ] File upload handling
- [ ] Advanced analytics
- [ ] Email campaigns
- [ ] SMS notifications

## License

MIT
