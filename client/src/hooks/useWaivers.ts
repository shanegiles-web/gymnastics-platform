import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiPut } from '@/lib/api'

export interface Waiver {
  id: string
  studentId: string
  status: 'pending' | 'signed' | 'expired'
  signedDate?: string
  expiryDate: string
}

export function useWaivers() {
  return useQuery({
    queryKey: ['waivers'],
    queryFn: () => apiGet<Waiver[]>('/waivers'),
  })
}

export function useWaiver(id: string) {
  return useQuery({
    queryKey: ['waiver', id],
    queryFn: () => apiGet<Waiver>(`/waivers/${id}`),
    enabled: !!id,
  })
}

export function useSignWaiver() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ waiverIdId, parentName }: { waiverIdId: string; parentName: string }) =>
      apiPost(`/waivers/${waiverIdId}/sign`, { parentName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waivers'] })
    },
  })
}

export function useWaiverTemplate() {
  return useQuery({
    queryKey: ['waiver-template'],
    queryFn: () => apiGet<{ content: string }>('/waivers/template'),
  })
}
