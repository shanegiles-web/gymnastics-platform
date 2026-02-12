import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiPut } from '@/lib/api'

export interface Invoice {
  id: string
  familyId: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  dueDate: string
  issuedDate: string
  items: InvoiceItem[]
}

export interface InvoiceItem {
  description: string
  amount: number
  quantity: number
}

export function useInvoices() {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: () => apiGet<Invoice[]>('/billing/invoices'),
  })
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => apiGet<Invoice>(`/billing/invoices/${id}`),
    enabled: !!id,
  })
}

export function usePayInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ invoiceId, amount }: { invoiceId: string; amount: number }) =>
      apiPost(`/billing/invoices/${invoiceId}/pay`, { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}

export function useBillingDashboard() {
  return useQuery({
    queryKey: ['billing-dashboard'],
    queryFn: () => apiGet<{ totalRevenue: number; outstandingBalance: number }>('/billing/dashboard'),
  })
}
