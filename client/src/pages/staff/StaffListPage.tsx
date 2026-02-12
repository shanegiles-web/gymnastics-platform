import { useState } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable, Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'

interface StaffMember {
  id: string
  name: string
  role: string
  email: string
  phone: string
  status: 'active' | 'inactive'
}

export function StaffListPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const staffData: StaffMember[] = [
    { id: '1', name: 'Sarah Coach', role: 'Instructor', email: 'sarah@gym.com', phone: '555-0101', status: 'active' },
    { id: '2', name: 'John Trainer', role: 'Lead Instructor', email: 'john@gym.com', phone: '555-0102', status: 'active' },
    { id: '3', name: 'Mike Manager', role: 'Manager', email: 'mike@gym.com', phone: '555-0103', status: 'active' },
  ]

  const filteredStaff = staffData.filter(staff =>
    staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const columns: Column<StaffMember>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: (row) => row.name,
      sortable: true,
    },
    {
      id: 'role',
      header: 'Role',
      cell: (row) => row.role,
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
        title="Staff"
        subtitle="Manage instructors and facility staff"
        action={{
          label: 'Add Staff',
          icon: <Plus className="h-4 w-4" />,
          onClick: () => {},
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
          <CardDescription>All instructors and staff members</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredStaff}
            searchPlaceholder="Search by name or email..."
            onSearch={setSearchQuery}
            emptyMessage="No staff members found"
          />
        </CardContent>
      </Card>
    </PageLayout>
  )
}
