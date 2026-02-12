import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api'

export interface Class {
  id: string
  name: string
  type: 'recreational' | 'team' | 'private' | 'camp'
  instructor: string
  schedule: string
  capacity: number
  enrolled: number
  status: 'active' | 'inactive'
}

export function useClasses() {
  return useQuery({
    queryKey: ['classes'],
    queryFn: () => apiGet<Class[]>('/classes'),
  })
}

export function useClass(id: string) {
  return useQuery({
    queryKey: ['class', id],
    queryFn: () => apiGet<Class>(`/classes/${id}`),
    enabled: !!id,
  })
}

export function useCreateClass() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Class, 'id'>) => apiPost<Class>('/classes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
    },
  })
}

export function useUpdateClass() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Class) => apiPut<Class>(`/classes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
    },
  })
}

export function useDeleteClass() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/classes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
    },
  })
}
