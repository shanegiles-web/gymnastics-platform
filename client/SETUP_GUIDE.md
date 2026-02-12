# GymFlow - Gymnastics Facility Management Platform
## Frontend Setup Guide

This is a complete React 18 + TypeScript + Vite frontend for the GymFlow gymnastics facility management platform.

### Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── layout/          # Layout components (Sidebar, TopBar, PageLayout)
│   │   └── ui/              # Reusable UI components (Button, Card, Table, etc.)
│   ├── contexts/            # React contexts (AuthContext)
│   ├── hooks/               # Custom React hooks (useAuth, useStudents, etc.)
│   ├── lib/                 # Utility functions (api client, cn utility)
│   ├── pages/               # Page components organized by feature
│   │   ├── auth/            # Login, register, password reset
│   │   ├── dashboard/       # Admin dashboard
│   │   ├── students/        # Student management
│   │   ├── classes/         # Class management
│   │   ├── families/        # Family management
│   │   ├── schedule/        # Class schedule
│   │   ├── billing/         # Invoices and payments
│   │   ├── waivers/         # Liability waivers
│   │   ├── staff/           # Staff directory
│   │   ├── attendance/      # Attendance tracking
│   │   ├── timeclock/       # Time clock for staff
│   │   ├── messages/        # Messaging (stub)
│   │   ├── reports/         # Reports (stub)
│   │   └── settings/        # Facility settings
│   ├── stores/              # Zustand stores (UI state)
│   ├── App.tsx              # Main app with routing
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── index.html               # HTML template
├── tailwind.config.ts       # Tailwind CSS configuration
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies
└── postcss.config.js        # PostCSS configuration
```

### Installation & Setup

#### 1. Install Dependencies
```bash
cd client
npm install
```

#### 2. Environment Configuration
Create a `.env` file in the client directory (optional):
```
VITE_API_URL=http://localhost:3001
```

#### 3. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

#### 4. Build for Production
```bash
npm run build
```

#### 5. Preview Production Build
```bash
npm run preview
```

### Design System

The design system is fully configured in `tailwind.config.ts` with these key colors:

- **Brand/Primary**: #5E6AD2 (Indigo)
- **Surface**: #FFFFFF (cards), #FAFAFA (page bg), #F5F5F5 (inputs)
- **Borders**: #E5E5E5 (default), #D4D4D4 (strong), #F0F0F0 (subtle)
- **Text**: #171717 (primary), #525252 (secondary), #737373 (tertiary), #A3A3A3 (disabled)
- **Status**: #00BA88 (success), #F59E0B (warning), #EF4444 (error), #3B82F6 (info)
- **Font**: Inter (from Google Fonts)
- **Spacing**: 4px base unit
- **Border Radius**: 4px (sm), 6px (base), 8px (md), 12px (lg)

### Key Features

#### Authentication
- Login page with demo credentials
- Auth context with token management
- Protected routes via ProtectedRoute component
- Automatic token attachment to API requests

#### UI Components
- **shadcn-style** components using Radix UI primitives
- Full TypeScript support with proper prop interfaces
- CVA (Class Variance Authority) for variant management
- Tailwind CSS for styling
- Lucide React icons throughout

#### Reusable Components
- `Button` (primary, secondary, destructive, ghost, link variants)
- `Input` (with label, error, helper text)
- `Card` (with header, footer, content)
- `Badge` (with variants: success, warning, error, info)
- `DataTable` (with pagination, search, sorting)
- `Dialog` (modal)
- `Dropdown Menu`
- `Select` (dropdown)
- `Table` (with header, body, footer, cells)
- `Tabs`
- `Skeleton` (loading state)
- And more...

#### State Management
- **React Query**: For server state (data fetching, caching, synchronization)
- **Zustand**: For UI state (sidebar collapsed, mobile nav open)
- **React Context**: For authentication state

#### API Integration
- Centralized API client in `lib/api.ts`
- Methods: `apiGet`, `apiPost`, `apiPut`, `apiDelete`
- Automatic Bearer token attachment from localStorage
- Error handling with typed responses

#### Custom Hooks
All hooks use React Query for data fetching:
- `useAuth` - Authentication context
- `useStudents` - Student CRUD operations
- `useClasses` - Class CRUD operations
- `useFamilies` - Family CRUD operations
- `useBilling` - Billing and invoices
- `useWaivers` - Waiver management
- `useAttendance` - Attendance records
- `useTimeclock` - Time clock records
- `useDashboard` - Dashboard metrics and activity

### Pages & Routes

#### Public Routes
- `/login` - Login page

#### Protected Routes
- `/dashboard` - Admin dashboard with KPIs and activity
- `/students` - Student list
- `/students/:id` - Student detail page
- `/classes` - Class list
- `/classes/:id` - Class detail page
- `/families` - Family directory
- `/families/:id` - Family detail page
- `/schedule` - Class schedule with calendar view
- `/billing` - Revenue and invoices
- `/billing/:id` - Invoice detail page
- `/waivers` - Waiver dashboard
- `/waivers/sign` - Sign waiver form
- `/staff` - Staff directory
- `/attendance` - Attendance reports
- `/timeclock` - Time clock for staff
- `/messages` - Messaging (stub)
- `/reports` - Reports (stub)
- `/settings` - Facility settings

### API Integration

The frontend expects a backend API at `http://localhost:3001` with these endpoints:

#### Authentication
- `POST /auth/login` - Login
- `POST /auth/register` - Register

#### Students
- `GET /students` - List students
- `GET /students/:id` - Get student detail
- `POST /students` - Create student
- `PUT /students/:id` - Update student
- `DELETE /students/:id` - Delete student

#### Classes
- `GET /classes` - List classes
- `GET /classes/:id` - Get class detail
- `POST /classes` - Create class
- `PUT /classes/:id` - Update class
- `DELETE /classes/:id` - Delete class

#### Families
- `GET /families` - List families
- `GET /families/:id` - Get family detail
- `POST /families` - Create family
- `PUT /families/:id` - Update family
- `DELETE /families/:id` - Delete family

#### Billing
- `GET /billing/invoices` - List invoices
- `GET /billing/invoices/:id` - Get invoice detail
- `POST /billing/invoices/:id/pay` - Record payment
- `GET /billing/dashboard` - Dashboard metrics

#### Waivers
- `GET /waivers` - List waivers
- `GET /waivers/:id` - Get waiver detail
- `POST /waivers/:id/sign` - Sign waiver
- `GET /waivers/template` - Get template

#### Attendance
- `GET /attendance` - List attendance records
- `POST /attendance/check-in` - Check in student

#### Time Clock
- `GET /timeclock/records` - List time records
- `POST /timeclock/clock-in` - Clock in
- `POST /timeclock/clock-out` - Clock out

#### Dashboard
- `GET /dashboard/metrics` - Dashboard KPIs
- `GET /dashboard/activity` - Recent activity

### Styling & Tailwind

All styling uses Tailwind CSS classes. The design system tokens are defined as:
- Color variables in `tailwind.config.ts`
- CSS variables in `src/index.css`
- Utility classes for spacing, sizing, and effects

Use the `cn()` utility from `lib/utils.ts` to combine class names conditionally:
```typescript
import { cn } from '@/lib/utils'

const className = cn(
  'base-class',
  isActive && 'active-class',
  disabled && 'opacity-50'
)
```

### Adding New Pages

1. Create a new directory in `src/pages/[feature]/`
2. Create your page component:
```typescript
import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'

export function MyNewPage() {
  return (
    <PageLayout>
      <PageHeader
        title="My Page"
        subtitle="Page description"
        action={{
          label: 'Add New',
          icon: <Plus className="h-4 w-4" />,
          onClick: () => {}
        }}
      />
      {/* Page content */}
    </PageLayout>
  )
}
```

3. Add the route in `src/App.tsx`:
```typescript
<Route
  path="/my-page"
  element={
    <ProtectedRoute>
      <MyNewPage />
    </ProtectedRoute>
  }
/>
```

### Adding New Components

1. Create in `src/components/ui/[component-name].tsx`
2. Export from component file
3. Use CVA for variants if needed
4. Ensure proper TypeScript prop interfaces
5. Use Lucide React for icons

Example:
```typescript
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const myComponentVariants = cva('base-styles', {
  variants: {
    variant: {
      primary: 'primary-styles',
      secondary: 'secondary-styles',
    }
  }
})

interface MyComponentProps extends VariantProps<typeof myComponentVariants> {
  // Add other props
}

export function MyComponent({ variant, ...props }: MyComponentProps) {
  return <div className={cn(myComponentVariants({ variant }))} {...props} />
}
```

### Demo Credentials

The login page includes demo buttons to quickly populate credentials:

- **Admin**: admin@demo.com / demo123
- **Parent**: parent@demo.com / demo123
- **Coach**: coach@demo.com / demo123

These are for development/testing only.

### Deployment

To deploy to production:

1. Build the project:
```bash
npm run build
```

2. The `dist/` folder contains optimized production assets

3. Deploy to any static hosting:
   - Vercel: `vercel`
   - Netlify: Drag & drop `dist/` folder
   - AWS S3 + CloudFront
   - GitHub Pages
   - Any static file server

### Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- React 18+
- ES2020 target

### Performance Notes

- Code splitting via Vite
- Lazy loading with React Router
- Image optimization via Vite
- CSS purging with Tailwind
- React Query caching strategy

### Development Tools

- **TypeScript**: Strict mode enabled
- **ESLint**: For code quality
- **Vite**: Fast dev server with HMR
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives

### Common Tasks

#### Add a new table column
Edit the `columns` array in your page component:
```typescript
{
  id: 'fieldName',
  header: 'Display Name',
  cell: (row) => row.fieldName,
  sortable: true,
}
```

#### Create a new custom hook
1. Create file in `src/hooks/useFeatureName.ts`
2. Use React Query for server state
3. Export hook and related types

#### Style a component
- Use Tailwind classes directly
- Use `cn()` utility for conditional styles
- Create variants using CVA for reusable components
- Colors available from design system in `tailwind.config.ts`

#### Handle API errors
All API calls go through `lib/api.ts` which handles:
- Automatic Bearer token attachment
- Error formatting
- Response type safety

Errors throw with structure: `{ message: string, status: number, code?: string }`

### Troubleshooting

**Port already in use:**
```bash
npm run dev -- --port 5174
```

**TypeScript errors:**
```bash
npm run build
```

**Build issues:**
```bash
rm -rf dist node_modules
npm install
npm run build
```

### Next Steps

1. Install dependencies: `npm install`
2. Set up backend API at `localhost:3001`
3. Start dev server: `npm run dev`
4. Login with demo credentials
5. Customize pages and components as needed
6. Deploy to production when ready

For questions or issues, refer to component documentation in code comments.
