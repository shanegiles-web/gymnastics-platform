import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost } from '@/lib/api'

export interface AttendanceRecord {
  id: string
  studentId: string
  classId: string
  date: string
  status: 'present' | 'absent' | 'late'
}

export function useAttendance(filters?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['attendance', filters],
    queryFn: () => {
      const params = new URLSearchParams()
      if (filters?.startDate) params.append('startDate', filters.startDate)
      if (filters?.endDate) params.append('endDate', filters.endDate)
      return apiGet<AttendanceRecord[]>(`/attendance?${params.toString()}`)
    },
  })
}

export function useCheckInStudent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ classId, studentId }: { classId: string; studentId: string }) =>
      apiPost(`/attendance/check-in`, { classId, studentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
    },
  })
}
