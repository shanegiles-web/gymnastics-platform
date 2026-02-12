import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable, Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { useWaivers } from '@/hooks/useWaivers'
import { formatDate } from 'date-fns'

export function WaiversPage() {
  const { data: waivers, isLoading } = useWaivers()

  const columns: Column<NonNullable<typeof waivers>[number]>[] = [
    {
      id: 'studentId',
      header: 'Student ID',
      cell: (row) => row.studentId,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => (
        <Badge
          variant={
            row.status === 'signed'
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
    {
      id: 'signedDate',
      header: 'Signed Date',
      cell: (row) => (row.signedDate ? formatDate(new Date(row.signedDate), 'MMM dd, yyyy') : '-'),
    },
    {
      id: 'expiryDate',
      header: 'Expires',
      cell: (row) => formatDate(new Date(row.expiryDate), 'MMM dd, yyyy'),
    },
  ]

  return (
    <PageLayout>
      <PageHeader
        title="Waivers"
        subtitle="Manage liability waivers and student agreements"
      />

      <Card>
        <CardHeader>
          <CardTitle>Waiver Status Dashboard</CardTitle>
          <CardDescription>All student waivers and their signing status</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={waivers || []}
            loading={isLoading}
            searchPlaceholder="Search waivers..."
            emptyMessage="No waivers found"
          />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Waiver Template</CardTitle>
          <CardDescription>Current template used for all new waivers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-surface-page p-4 rounded-md text-sm text-text-secondary whitespace-pre-wrap">
            Standard Liability Waiver Template
            
This is a standard liability waiver agreement. Participants and parents/guardians must sign this agreement before engaging in gymnastics activities.

By signing below, you acknowledge that you understand the risks involved in gymnastics activities and agree to hold harmless the facility and its staff.
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  )
}
