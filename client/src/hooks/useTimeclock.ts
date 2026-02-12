import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiPost, apiGet } from '@/lib/api'

export interface TimeRecord {
  id: string
  staffId: string
  clockInTime: string
  clockOutTime?: string
  status: 'clocked_in' | 'clocked_out'
}

export function useTimeRecords() {
  return useQuery({
    queryKey: ['time-records'],
    queryFn: () => apiGet<TimeRecord[]>('/timeclock/records'),
  })
}

export function useClockIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => apiPost('/timeclock/clock-in', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-records'] })
    },
  })
}

export function useClockOut() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => apiPost('/timeclock/clock-out', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-records'] })
    },
  })
}
