import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable, Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { useInvoices, useBillingDashboard } from '@/hooks/useBilling'
import { DollarSign, TrendingUp } from 'lucide-react'
import { formatDate } from 'date-fns'

export function BillingPage() {
  const { data: metrics } = useBillingDashboard()
  const { data: invoices, isLoading } = useInvoices()

  const columns: Column<NonNullable<typeof invoices>[number]>[] = [
    {
      id: 'id',
      header: 'Invoice #',
      cell: (row) => row.id,
    },
    {
      id: 'familyId',
      header: 'Family',
      cell: (row) => row.familyId,
    },
    {
      id: 'amount',
      header: 'Amount',
      cell: (row) => `$${row.amount.toFixed(2)}`,
    },
    {
      id: 'dueDate',
      header: 'Due Date',
      cell: (row) => formatDate(new Date(row.dueDate), 'MMM dd, yyyy'),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => (
        <Badge
          variant={
            row.status === 'paid'
              ? 'success'
              : row.status === 'pending'
              ? 'warning'
              : 'error'
          }
          showDot
        >
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ),
    },
  ]

  return (
    <PageLayout>
      <PageHeader
        title="Billing"
        subtitle="Revenue, invoices, and payment tracking"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Total Revenue</span>
              <DollarSign className="h-4 w-4 text-status-success" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-text-primary">
              ${metrics?.totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-text-tertiary mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Outstanding Balance</span>
              <TrendingUp className="h-4 w-4 text-status-warning" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-text-primary">
              ${metrics?.outstandingBalance.toLocaleString()}
            </p>
            <p className="text-xs text-text-tertiary mt-1">Pending invoices</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>Payment history and outstanding balances</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={invoices || []}
            loading={isLoading}
            searchPlaceholder="Search invoices..."
            emptyMessage="No invoices found"
          />
        </CardContent>
      </Card>
    </PageLayout>
  )
}
