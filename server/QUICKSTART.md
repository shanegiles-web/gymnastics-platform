# Quick Start Guide

## Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and update:
- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - Set to a random string (min 32 chars)
- `JWT_REFRESH_SECRET` - Set to a different random string (min 32 chars)
- `ENCRYPTION_KEY` - Set to a random string (min 32 chars)

Example:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/gymnastics_db
JWT_SECRET=your-super-secret-key-change-this-in-production-12345
JWT_REFRESH_SECRET=your-refresh-secret-change-this-in-production-12345
ENCRYPTION_KEY=your-encryption-key-minimum-32-bytes-long-here-12345
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup
```bash
# Generate initial migration files
npm run db:generate

# Apply migrations to PostgreSQL
npm run db:migrate

# Or push schema directly (development)
npm run db:push
```

### 4. Start Development Server
```bash
npm run dev
```

Server will start at `http://localhost:3001`

## First Steps

### 1. Check Health
```bash
curl http://localhost:3001/api/v1/health
```

Response:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-02-12T14:30:00.000Z"
  }
}
```

### 2. Create a Facility (as global admin)

First, create a global admin user in the database:
```sql
INSERT INTO global_admins (id, email, password_hash, first_name, last_name, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@example.com',
  '$2b$10$...',  -- bcrypt hash of password
  'Admin',
  'User',
  true,
  NOW(),
  NOW()
);
```

Then login as global admin:
```bash
curl -X POST http://localhost:3001/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "admin": {
      "id": "uuid...",
      "email": "admin@example.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "global_admin"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

### 3. Create Your First Facility
```bash
curl -X POST http://localhost:3001/api/v1/admin/facilities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "name": "Elite Gymnastics Academy",
    "domain": "elite-gymnastics.com",
    "adminEmail": "facility-admin@elite-gymnastics.com",
    "adminPassword": "SecurePassword123!",
    "addressLine1": "123 Gym Street",
    "city": "Springfield",
    "state": "IL",
    "postalCode": "62701",
    "country": "USA",
    "phone": "+1-217-555-0123"
  }'
```

### 4. Login as Facility Admin
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "facilityId": "facility-id-from-response",
    "email": "facility-admin@elite-gymnastics.com",
    "password": "SecurePassword123!"
  }'
```

## Basic Workflow

### Create Family
```bash
curl -X POST http://localhost:3001/api/v1/families \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer facility-admin-token" \
  -d '{
    "headOfHousehold": "John Smith",
    "email": "john@example.com",
    "phone": "+1-217-555-0456",
    "addressLine1": "456 Main St",
    "city": "Springfield",
    "state": "IL",
    "postalCode": "62702",
    "country": "USA"
  }'
```

### Create Student
```bash
curl -X POST http://localhost:3001/api/v1/families/{familyId}/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer facility-admin-token" \
  -d '{
    "firstName": "Sarah",
    "lastName": "Smith",
    "dateOfBirth": "2015-05-20",
    "gender": "female",
    "skillLevel": "beginner",
    "emergencyContacts": [
      {
        "name": "John Smith",
        "relationship": "Parent",
        "phone": "+1-217-555-0456"
      }
    ]
  }'
```

### Create Class
```bash
curl -X POST http://localhost:3001/api/v1/classes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer facility-admin-token" \
  -d '{
    "name": "Beginner Level 1",
    "description": "Perfect for ages 5-7",
    "skillLevel": "beginner",
    "maxCapacity": 12,
    "minAgeMonths": 60,
    "maxAgeMonths": 84,
    "coachIds": ["coach-uuid"],
    "pricePerMonth": 99.99
  }'
```

### Add Schedule to Class
```bash
curl -X POST http://localhost:3001/api/v1/classes/{classId}/schedules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer facility-admin-token" \
  -d '{
    "classId": "class-uuid",
    "dayOfWeek": 1,
    "startTime": "16:00",
    "endTime": "17:00",
    "recurrenceRule": "FREQ=WEEKLY;BYDAY=MO,WE,FR"
  }'
```

### Enroll Student
```bash
curl -X POST http://localhost:3001/api/v1/classes/{classId}/enrollments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer facility-admin-token" \
  -d '{
    "studentId": "student-uuid",
    "startDate": "2026-02-15",
    "endDate": null
  }'
```

## Common Tasks

### Get All Classes
```bash
curl -X GET "http://localhost:3001/api/v1/classes?page=1&limit=20" \
  -H "Authorization: Bearer token"
```

### Get Student Details
```bash
curl -X GET http://localhost:3001/api/v1/families/{familyId}/students/{studentId} \
  -H "Authorization: Bearer token"
```

### Record Attendance
```bash
curl -X POST http://localhost:3001/api/v1/attendance/check-in \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token" \
  -d '{
    "classInstanceId": "instance-uuid",
    "studentId": "student-uuid"
  }'
```

### Clock In (Timeclock)
```bash
curl -X POST http://localhost:3001/api/v1/timeclock/clock-in \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token" \
  -d '{
    "latitude": 39.7817,
    "longitude": -89.6501
  }'
```

### Create Invoice
```bash
curl -X POST http://localhost:3001/api/v1/billing/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token" \
  -d '{
    "familyId": "family-uuid",
    "dueDate": "2026-03-15",
    "items": [
      {
        "description": "Monthly Class Fee - Level 1",
        "quantity": 1,
        "unitPrice": 99.99
      }
    ]
  }'
```

## Testing with cURL

Save this as `test.sh` for quick API testing:

```bash
#!/bin/bash

BASE_URL="http://localhost:3001/api/v1"
TOKEN="your-access-token-here"

# Health check
curl $BASE_URL/health

# List classes
curl -H "Authorization: Bearer $TOKEN" $BASE_URL/classes

# List families
curl -H "Authorization: Bearer $TOKEN" $BASE_URL/families
```

## Building for Production

```bash
# Build TypeScript
npm run build

# Verify build
npm run lint

# Set NODE_ENV=production
export NODE_ENV=production

# Run migrations
npm run db:migrate

# Start server
npm start
```

## Troubleshooting

### Database Connection Error
- Check DATABASE_URL is correct
- Verify PostgreSQL is running
- Check database exists and is accessible

### JWT Errors
- Verify JWT_SECRET is set
- Check token hasn't expired
- Ensure Bearer token format: `Authorization: Bearer <token>`

### Validation Errors
- Check request body matches schema
- Ensure date formats are ISO 8601 (YYYY-MM-DD)
- Verify UUIDs are valid format

### Rate Limiting
- Default: 100 requests per 15 minutes
- Check response headers: `X-RateLimit-Remaining`
- Wait time in `Retry-After` header

## Next Steps

1. Read `/server/README.md` for full documentation
2. Review database schema in `/server/src/db/schema/`
3. Explore API endpoints in `/server/src/routes/`
4. Check authentication in `/server/src/middleware/auth.ts`
5. Review business logic in `/server/src/services/`

## Support

For issues or questions:
1. Check error messages in response body
2. Review TypeScript types in `/server/src/types/`
3. Check database logs
4. Verify environment variables

Happy coding!
