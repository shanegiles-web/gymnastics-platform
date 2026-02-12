import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { useAuth } from '@/hooks/useAuth'

import { LoginPage } from '@/pages/auth/LoginPage'
import { AdminDashboard } from '@/pages/dashboard/AdminDashboard'
import { StudentsListPage } from '@/pages/students/StudentsListPage'
import { StudentDetailPage } from '@/pages/students/StudentDetailPage'
import { ClassesListPage } from '@/pages/classes/ClassesListPage'
import { ClassDetailPage } from '@/pages/classes/ClassDetailPage'
import { SchedulePage } from '@/pages/schedule/SchedulePage'
import { BillingPage } from '@/pages/billing/BillingPage'
import { InvoiceDetailPage } from '@/pages/billing/InvoiceDetailPage'
import { WaiversPage } from '@/pages/waivers/WaiversPage'
import { SignWaiverPage } from '@/pages/waivers/SignWaiverPage'
import { StaffListPage } from '@/pages/staff/StaffListPage'
import { AttendancePage } from '@/pages/attendance/AttendancePage'
import { TimeClockPage } from '@/pages/timeclock/TimeClockPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { FamiliesListPage } from '@/pages/families/FamiliesListPage'
import { FamilyDetailPage } from '@/pages/families/FamilyDetailPage'
import { MessagesPage } from '@/pages/messages/MessagesPage'
import { ReportsPage } from '@/pages/reports/ReportsPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    )
  }

  // Check both context state AND localStorage to handle race condition after login
  const hasStoredAuth = localStorage.getItem('authToken') && localStorage.getItem('authUser')

  if (!user && !hasStoredAuth) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/students"
        element={
          <ProtectedRoute>
            <StudentsListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/students/:id"
        element={
          <ProtectedRoute>
            <StudentDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/classes"
        element={
          <ProtectedRoute>
            <ClassesListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/classes/:id"
        element={
          <ProtectedRoute>
            <ClassDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/families"
        element={
          <ProtectedRoute>
            <FamiliesListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/families/:id"
        element={
          <ProtectedRoute>
            <FamilyDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/schedule"
        element={
          <ProtectedRoute>
            <SchedulePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/billing"
        element={
          <ProtectedRoute>
            <BillingPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/billing/:id"
        element={
          <ProtectedRoute>
            <InvoiceDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/waivers"
        element={
          <ProtectedRoute>
            <WaiversPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/waivers/sign"
        element={
          <ProtectedRoute>
            <SignWaiverPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff"
        element={
          <ProtectedRoute>
            <StaffListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <AttendancePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/timeclock"
        element={
          <ProtectedRoute>
            <TimeClockPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
