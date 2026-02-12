import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api'

export interface Student {
  id: string
  name: string
  age: number
  familyId: string
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  status: 'active' | 'inactive'
  enrolledClasses?: string[]
}

export function useStudents() {
  return useQuery({
    queryKey: ['students'],
    queryFn: () => apiGet<Student[]>('/students'),
  })
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: ['student', id],
    queryFn: () => apiGet<Student>(`/students/${id}`),
    enabled: !!id,
  })
}

export function useCreateStudent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Student, 'id'>) => apiPost<Student>('/students', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}

export function useUpdateStudent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Student) => apiPut<Student>(`/students/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}

export function useDeleteStudent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/students/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}
