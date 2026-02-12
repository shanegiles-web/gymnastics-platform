import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api'

export interface Family {
  id: string
  name: string
  primaryContact: string
  email: string
  phone: string
  children: string[]
  status: 'active' | 'inactive'
}

export function useFamilies() {
  return useQuery({
    queryKey: ['families'],
    queryFn: () => apiGet<Family[]>('/families'),
  })
}

export function useFamily(id: string) {
  return useQuery({
    queryKey: ['family', id],
    queryFn: () => apiGet<Family>(`/families/${id}`),
    enabled: !!id,
  })
}

export function useCreateFamily() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Family, 'id'>) => apiPost<Family>('/families', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] })
    },
  })
}

export function useUpdateFamily() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Family) => apiPut<Family>(`/families/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] })
    },
  })
}

export function useDeleteFamily() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/families/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] })
    },
  })
}
