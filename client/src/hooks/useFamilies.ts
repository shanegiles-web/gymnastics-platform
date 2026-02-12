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

interface ApiFamilyResponse {
  id: string
  headOfHousehold?: string
  name?: string
  email: string
  phone?: string
  children?: string[]
  status?: 'active' | 'inactive'
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

function transformFamily(f: ApiFamilyResponse): Family {
  return {
    id: f.id,
    name: f.name || f.headOfHousehold || 'Unknown Family',
    primaryContact: f.headOfHousehold || '',
    email: f.email,
    phone: f.phone || '',
    children: f.children || [],
    status: f.status || 'active',
  }
}

export function useFamilies() {
  return useQuery({
    queryKey: ['families'],
    queryFn: async () => {
      const response = await apiGet<PaginatedResponse<ApiFamilyResponse> | ApiFamilyResponse[]>('/families')
      // Handle both paginated and array responses
      if (Array.isArray(response)) {
        return response.map(transformFamily)
      }
      return response.data.map(transformFamily)
    },
  })
}

export function useFamily(id: string) {
  return useQuery({
    queryKey: ['family', id],
    queryFn: async () => {
      const response = await apiGet<ApiFamilyResponse>(`/families/${id}`)
      return transformFamily(response)
    },
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
