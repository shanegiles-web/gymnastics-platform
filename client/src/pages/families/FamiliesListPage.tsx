import { useState } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable, Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { useFamilies } from '@/hooks/useFamilies'
import { Plus } from 'lucide-react'

export function FamiliesListPage() {
  const { data: families, isLoading } = useFamilies()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFamilies = families?.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const columns: Column<typeof filteredFamilies[0]>[] = [
    {
      id: 'name',
      header: 'Family Name',
      cell: (row) => row.name,
      sortable: true,
    },
    {
      id: 'contact',
      header: 'Primary Contact',
      cell: (row) => row.primaryContact,
    },
    {
      id: 'email',
      header: 'Email',
      cell: (row) => row.email,
    },
    {
      id: 'phone',
      header: 'Phone',
      cell: (row) => row.phone,
    },
    {
      id: 'children',
      header: 'Children',
      cell: (row) => row.children.length,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.status === 'active' ? 'success' : 'error'} showDot>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ),
    },
  ]

  return (
    <PageLayout>
      <PageHeader
        title="Families"
        subtitle="Manage family accounts and contact information"
        action={{
          label: 'Add Family',
          icon: <Plus className="h-4 w-4" />,
          onClick: () => {},
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>Family Directory</CardTitle>
          <CardDescription>All registered families and their information</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredFamilies}
            loading={isLoading}
            searchPlaceholder="Search families..."
            onSearch={setSearchQuery}
            emptyMessage="No families found"
          />
        </CardContent>
      </Card>
    </PageLayout>
  )
}
