import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/api'

export interface DashboardMetrics {
  revenue: number
  activeStudents: number
  attendanceRate: number
  upcomingEvents: number
}

export interface Activity {
  id: string
  type: 'enrollment' | 'payment' | 'attendance' | 'waiver'
  message: string
  timestamp: string
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => apiGet<DashboardMetrics>('/dashboard/metrics'),
  })
}

export function useDashboardActivity() {
  return useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: () => apiGet<Activity[]>('/dashboard/activity'),
  })
}
