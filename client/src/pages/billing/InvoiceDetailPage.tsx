import { useParams, useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useInvoice } from '@/hooks/useBilling'
import { ArrowLeft } from 'lucide-react'
import { formatDate } from 'date-fns'

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: invoice, isLoading } = useInvoice(id || '')

  if (isLoading) {
    return (
      <PageLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-input rounded w-1/4"></div>
          <div className="h-64 bg-surface-input rounded"></div>
        </div>
      </PageLayout>
    )
  }

  if (!invoice) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <p className="text-text-tertiary">Invoice not found</p>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate('/billing')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Invoice {invoice.id}</CardTitle>
                  <CardDescription>
                    Family: {invoice.familyId}
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    invoice.status === 'paid'
                      ? 'success'
                      : invoice.status === 'pending'
                      ? 'warning'
                      : 'error'
                  }
                  showDot
                >
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-text-tertiary font-semibold uppercase">Issued</p>
                  <p className="text-sm font-medium mt-1">
                    {formatDate(new Date(invoice.issuedDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary font-semibold uppercase">Due Date</p>
                  <p className="text-sm font-medium mt-1">
                    {formatDate(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>

              <div className="border-t border-border-DEFAULT pt-6">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Line Items</h3>
                <div className="space-y-2">
                  {invoice.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-surface-page rounded-md">
                      <div>
                        <p className="text-sm font-medium">{item.description}</p>
                        <p className="text-xs text-text-tertiary">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold">${item.amount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border-DEFAULT pt-6 flex items-center justify-between">
                <p className="text-lg font-semibold">Total</p>
                <p className="text-2xl font-bold text-brand-500">${invoice.amount.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="primary" className="w-full justify-start" disabled={invoice.status === 'paid'}>
                Record Payment
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                Send Email
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                Print Invoice
              </Button>
              {invoice.status !== 'paid' && (
                <Button variant="destructive" className="w-full justify-start">
                  Refund
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}
